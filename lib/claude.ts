import { AIScore, AIPlan, IdeaLink, WeeklyNudge } from './types';

const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

export const isClaudeConfigured = CLAUDE_API_KEY.length > 0;

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function callClaude(system: string, messages: ClaudeMessage[]): Promise<string> {
  if (!isClaudeConfigured) {
    throw new Error('Claude API key not configured. Add EXPO_PUBLIC_CLAUDE_API_KEY to your .env file.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((block: { type: string }) => block.type === 'text');
  if (!textBlock) {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}

function parseJSON<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export async function analyzeIdea(
  title: string,
  description: string,
  devilAdvocateMode: boolean
): Promise<AIScore> {
  const system = `You are an expert startup advisor and product strategist. Analyze the idea provided and return ONLY a JSON object with this exact structure, no preamble, no markdown:
{
  "feasibility": <1-10>,
  "market_demand": <1-10>,
  "uniqueness": <1-10>,
  "time_to_build": <1-10>,
  "revenue_potential": <1-10>,
  "overall_score": <average, 1 decimal>,
  "strengths": "<2-3 sentences>",
  "weaknesses": "<2-3 sentences>"${devilAdvocateMode ? ',\n  "devil_advocate": "<2-3 sentences arguing against the idea>"' : ''}
}`;

  const userMessage = `Analyze this idea: ${title} — ${description || 'No additional description provided.'}. Devil advocate mode: ${devilAdvocateMode}`;

  const response = await callClaude(system, [{ role: 'user', content: userMessage }]);
  return parseJSON<AIScore>(response);
}

export async function generatePlan(title: string, description: string): Promise<AIPlan> {
  const system = `You are a product planning expert. Generate a detailed build plan for this idea. Return ONLY a JSON object, no preamble, no markdown:
{
  "phases": [{ "name": "", "description": "", "time_estimate": "" }],
  "tools_and_tech": [""],
  "budget": [{ "category": "", "low": "", "high": "" }],
  "first_3_actions": [""],
  "risk_flags": [{ "risk": "", "mitigation": "" }]
}`;

  const userMessage = `Create a full plan for: ${title} — ${description || 'No additional description provided.'}`;

  const response = await callClaude(system, [{ role: 'user', content: userMessage }]);
  return parseJSON<AIPlan>(response);
}

export async function findIdeaLinks(
  ideas: { id: string; title: string; description: string | null }[]
): Promise<IdeaLink[]> {
  const system = `You are analyzing a set of ideas to find thematic connections. Return ONLY a JSON array of idea ID pairs that are related, no preamble:
[{ "idea_a_id": "", "idea_b_id": "", "reason": "" }]
If no connections exist, return an empty array: []`;

  const userMessage = `Find connections between these ideas: ${JSON.stringify(ideas)}`;

  const response = await callClaude(system, [{ role: 'user', content: userMessage }]);
  return parseJSON<IdeaLink[]>(response);
}

export async function getWeeklyNudge(
  ideas: { id: string; title: string; description: string | null }[]
): Promise<WeeklyNudge | null> {
  if (ideas.length === 0) return null;

  const system = `You are a personal productivity coach. Pick the single most promising unactioned idea from this list and explain in one sentence why now is a good time to revisit it. Return ONLY JSON: { "idea_id": "", "nudge_message": "" }`;

  const userMessage = JSON.stringify(ideas);

  const response = await callClaude(system, [{ role: 'user', content: userMessage }]);
  return parseJSON<WeeklyNudge>(response);
}

export async function autoTagIdea(title: string, description: string): Promise<string> {
  const system = `You are a categorization expert. Given an idea title and description, suggest the single best category from this list: App, Business, Creative, Personal, Tech, Content, Product, Research, Other. Return ONLY the category name as a single word, nothing else.`;

  const userMessage = `Title: ${title}. Description: ${description || 'None'}`;

  const response = await callClaude(system, [{ role: 'user', content: userMessage }]);
  return response.trim();
}
