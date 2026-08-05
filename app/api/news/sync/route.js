import { verifyCronSecret } from "@/lib/auth.js";
import { jsonSuccess, jsonError, jsonFromError } from "@/lib/api/response.js";
import { collectNews } from "@/lib/services/collectNews.js";
import { processNews } from "@/lib/services/processNews.js";

export async function POST(request) {
  const auth = verifyCronSecret(request);
  if (!auth.authorized) {
    return jsonError(auth.message, { status: auth.status, code: "UNAUTHORIZED" });
  }

  try {
    const collectStats = await collectNews();
    const batchSize = Number(process.env.AI_BATCH_SIZE ?? 5);
    const processStats = await processNews({ batchSize });

    return jsonSuccess({
      collect: collectStats,
      process: processStats,
    });
  } catch (error) {
    return jsonFromError(error);
  }
}