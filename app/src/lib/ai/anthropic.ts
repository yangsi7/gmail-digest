import { createAnthropic } from '@ai-sdk/anthropic';

// Create Anthropic client with API key from environment
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Model selection for draft generation
// claude-sonnet-4-20250514: Best balance of speed, quality, and cost for email drafts
// claude-opus-4-20250514: Reserved for complex analysis tasks
export const DRAFT_MODEL = anthropic('claude-sonnet-4-20250514');
