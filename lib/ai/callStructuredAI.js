import { getOpenAIClient, getOpenAIModel } from "./openai.js";

/**
 * Call OpenAI with JSON response format and validate with Zod.
 * @param {{ system: string, user: string, schema: import("zod").ZodType, model?: string, temperature?: number }} options
 */
export async function callStructuredAI({ system, user, schema, model, temperature = 0.2 }) {
  const openai = getOpenAIClient();
  const resolvedModel = model ?? getOpenAIModel();

  const completion = await openai.chat.completions.create({
    model: resolvedModel,
    temperature,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const rawContent = completion.choices?.[0]?.message?.content;
  if (!rawContent) {
    return { success: false, error: "OpenAI returned an empty response" };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    return { success: false, error: "OpenAI response was not valid JSON" };
  }

  const validated = schema.safeParse(parsed);
  if (!validated.success) {
    return {
      success: false,
      error: "AI response failed validation",
      details: validated.error.flatten(),
    };
  }

  return {
    success: true,
    data: validated.data,
    model: resolvedModel,
    usage: completion.usage,
  };
}

export default callStructuredAI;
