import { streamText } from 'ai';
import { z } from 'zod';
import { DRAFT_MODEL } from '@/lib/ai/anthropic';
import { buildDraftPrompt, SYSTEM_PROMPT } from '@/lib/ai/prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Zod schema for request validation
const draftRequestSchema = z.object({
  senderName: z.string().max(200).optional(),
  senderEmail: z.string().email('Invalid email format'),
  subject: z.string().min(1, 'Subject is required').max(500),
  snippet: z.string().max(5000).optional(),
  category: z.enum(['rav', 'billing', 'personal', 'action_required', 'other']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  userName: z.string().max(100).optional(),
  tone: z.enum(['professional', 'friendly', 'concise']).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validationResult = draftRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));

      return new Response(
        JSON.stringify({ error: 'Validation failed', details: errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const {
      senderName,
      senderEmail,
      subject,
      snippet,
      category,
      priority,
      userName,
      tone,
    } = validationResult.data;

    const prompt = buildDraftPrompt({
      senderName: senderName || 'Unknown Sender',
      senderEmail,
      subject,
      snippet: snippet || '',
      category: category || 'other',
      priority: priority || 'medium',
      userName,
      tone,
    });

    const result = streamText({
      model: DRAFT_MODEL,
      system: SYSTEM_PROMPT,
      prompt,
      maxOutputTokens: 500, // Limit response length for email drafts
      temperature: 0.7, // Balanced creativity for natural responses
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Generate draft error:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return new Response(
          JSON.stringify({ error: 'API configuration error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (error.message.includes('rate limit')) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Failed to generate draft' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
