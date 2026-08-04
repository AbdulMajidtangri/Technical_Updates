import OpenAI from "openai";

/** @type {OpenAI | null} */
let client = null;

/**
 * Server-side OpenAI client singleton.
 * @returns {OpenAI}
 */
export function getOpenAIClient() {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client = new OpenAI({ apiKey });
  return client;
}

/**
 * Resolved model name from environment.
 * @returns {string}
 */
export function getOpenAIModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export default getOpenAIClient;