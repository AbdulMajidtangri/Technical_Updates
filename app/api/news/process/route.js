import { verifyCronSecret } from "@/lib/auth.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { processNews } from "@/lib/services/processNews.js";

export async function POST(request) {
  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return jsonError(auth.message, { status: auth.status, code: "UNAUTHORIZED" });
  }

  try {
    const batchSize = Number(process.env.AI_BATCH_SIZE ?? 5);
    const stats = await processNews({ batchSize });
    return jsonSuccess({ stats });
  } catch (error) {
    return jsonFromError(error);
  }
}