export function jsonSuccess(data = {}, options = {}) {
  return Response.json(
    { success: true, data },
    { status: options.status ?? 200, headers: options.headers },
  );
}

export function jsonError(message, options = {}) {
  return Response.json(
    {
      success: false,
      error: {
        message,
        code: options.code ?? "ERROR",
        ...(options.details !== undefined ? { details: options.details } : {}),
      },
    },
    { status: options.status ?? 400, headers: options.headers },
  );
}

export function jsonFromError(error, options = {}) {
  const rawMessage =
    error instanceof Error && error.message
      ? error.message
      : options.fallbackMessage ?? "Internal server error";

  const isProd = process.env.NODE_ENV === "production";
  const isNotFound = error instanceof Error && /not found/i.test(rawMessage);
  const status = options.status ?? (isNotFound ? 404 : 500);

  const message = isProd && status >= 500 && !options.expose
    ? options.fallbackMessage ?? "Internal server error"
    : rawMessage;

  return jsonError(message, { status, code: options.code ?? (isNotFound ? "NOT_FOUND" : "INTERNAL_ERROR") });
}

export default jsonSuccess;