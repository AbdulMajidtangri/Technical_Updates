export const TRUST_RULES = `
TRUST LAYER — label every major claim with one of:
- CONFIRMED: directly supported by the article/source
- REPORTED: attributed to reports or sources in the article
- AI_ANALYSIS: your interpretation grounded in the article
- SCENARIO: possible future outcome (use could/may/might)
- UNKNOWN: cannot be confirmed from the article

NEVER invent statistics, quotes, events, dates, people, or specifications.
If insufficient information, say "Insufficient information" for that field.
Use cautious language: could, may, might — never "will definitely".
Output JSON only. No markdown fences.`;

export const SIMPLICITY_RULES = `
LANGUAGE — THIS IS CRITICAL:
- Write so ANY normal person can understand — not experts, not developers unless the story is only for them.
- Use short sentences (aim for under 18 words each).
- Use common everyday words. Never use jargon, acronyms, or buzzwords unless you immediately explain them in plain words.
  Bad: "The LLM deployment leverages inference optimization."
  Good: "The company released a new AI tool that answers questions faster."
- Use simple analogies when helpful (like explaining to a friend over coffee).
- One clear idea per sentence. No long compound sentences.
- Avoid words like: leverage, utilize, paradigm, ecosystem, infrastructure (unless explained), regulatory framework, stakeholders, implications, paradigm shift.
- Prefer: use, help, change, affect, company, tool, rule, people, money, jobs.
- If the topic is technical, explain WHAT it does in plain language before any detail.
- Reading level: roughly grade 6–8. A teenager with no tech background should understand every sentence.
- simpleExplanation must be the EASIEST field — explain like talking to someone who has never read tech news before.`;

export const ARTICLE_CONTEXT_RULES = `
Use ONLY the provided article data. Do not browse the web.
Compress and explain — do not rewrite the full article.
${SIMPLICITY_RULES}`;

export default TRUST_RULES;
