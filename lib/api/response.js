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
  const message =
    error instanceof Error && error.message
      ? error.message
      : options.fallbackMessage ?? "Internal server error";
  const status = options.status ?? (error instanceof Error && /not found/i.test(message) ? 404 : 500);
  return jsonError(message, { status });
}

export default jsonSuccess;