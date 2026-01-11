export type Tone = 'professional' | 'friendly' | 'concise';

export interface DraftPromptParams {
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  category: string;
  priority: string;
  userName?: string;
  tone?: Tone;
}

const toneInstructions: Record<Tone, string> = {
  professional: 'Use a professional, business-appropriate tone.',
  friendly: 'Use a warm, friendly but still professional tone.',
  concise: 'Be extremely brief and to the point. Minimize pleasantries.',
};

export const SYSTEM_PROMPT = `You are an expert email assistant. You help draft clear, professional email responses.

Your responses are:
- Concise and to the point
- Appropriately formal based on context
- Action-oriented when needed
- Free of unnecessary pleasantries

Rules:
- Never include email headers (To:, From:, Subject:, Date:)
- Never include email signatures (Best regards, Sincerely, etc.) unless the email context suggests one is expected
- Never include subject lines
- Write the body of the email only
- Match the language of the original email (e.g., respond in German if the email is in German)`;

export function buildDraftPrompt(params: DraftPromptParams): string {
  const {
    senderName,
    senderEmail,
    subject,
    snippet,
    category,
    priority,
    userName = 'the user',
    tone = 'professional',
  } = params;

  const toneInstruction = toneInstructions[tone];

  return `You are drafting an email response on behalf of ${userName}.

ORIGINAL EMAIL:
From: ${senderName} <${senderEmail}>
Subject: ${subject}
Category: ${category}
Priority: ${priority}

Email Preview:
${snippet}

INSTRUCTIONS:
1. ${toneInstruction}
2. Address the sender by their first name if appropriate for the context
3. Respond to the key points mentioned in the email preview
4. Keep the response focused and actionable
5. Match the language of the original email
6. Do NOT include a subject line - just the body
7. Do NOT include email headers or signatures
8. Write naturally as if ${userName} is writing

Draft a concise, helpful response:`;
}
