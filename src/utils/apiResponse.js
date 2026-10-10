import { NextResponse } from "next/server";

const ENVELOPE_KEYS = new Set(["success", "message", "data", "pagination", "errors", "meta"]);

export const normalizePagination = (pagination) => {
  if (!pagination || typeof pagination !== "object") return undefined;
  return {
    limit: Number(pagination.limit) || null,
    nextCursor: pagination.nextCursor ?? null,
    hasMore: Boolean(pagination.hasMore),
  };
};

export const toEnvelope = (body, status = 200) => {
  const source = body && typeof body === "object" && !Array.isArray(body) ? body : { data: body };
  const ok = source.success ?? status < 400;

  const envelope = { success: Boolean(ok) };

  if (source.message) envelope.message = source.message;
  if (source.data !== undefined) envelope.data = source.data;

  const pagination = normalizePagination(source.pagination);
  if (pagination) envelope.pagination = pagination;

  if (source.errors !== undefined) envelope.errors = source.errors;

  const extra = Object.fromEntries(
    Object.entries(source).filter(([key, value]) => !ENVELOPE_KEYS.has(key) && value !== undefined)
  );
  const meta = { ...(source.meta || {}), ...extra };
  if (Object.keys(meta).length) envelope.meta = meta;

  if (!envelope.success && !envelope.message) envelope.message = "Request failed";

  return envelope;
};

export const respond = (body = {}, init = {}) => NextResponse.json(toEnvelope(body, init.status ?? 200), init);

export const ok = (data, { status = 200, message, meta } = {}) =>
  respond({ success: true, data, message, meta }, { status });

export const created = (data, message) => ok(data, { status: 201, message });

export const paginated = (result, { meta, message } = {}) =>
  respond({ success: true, data: result?.data ?? [], pagination: result?.pagination, meta, message });

export const jsonError = (message, status = 400, errors) => respond({ success: false, message, errors }, { status });

export const fromService = (result, { status = 200, message } = {}) =>
  result?.success === false
    ? jsonError(result.message, result.status || 400, result.details)
    : respond({ success: true, message: message ?? result?.message, data: result?.data }, { status });

export const formDataToObject = (formData, { skipEmpty = false } = {}) => {
  const result = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      if (skipEmpty && value.trim() === "") continue;
      result[key] = value;
    } else if (value && value.size > 0) {
      result[key] = value;
    }
  }

  return result;
};

export const validationError = (errorsOrZodError) => {
  const errors = Array.isArray(errorsOrZodError)
    ? errorsOrZodError
    : errorsOrZodError.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

  return jsonError("Validation failed", 400, errors);
};

export const handleRouteError = (err, label = "API") => {
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return jsonError(field ? `${field} already exists` : "Already exists", 409);
  }

  if (err?.name === "AppError" || (err?.statusCode && err?.message)) {
    return jsonError(err.message, err.statusCode || err.status || 400);
  }

  console.error(`${label} failed:`, err);
  return jsonError("Internal server error", 500);
};
