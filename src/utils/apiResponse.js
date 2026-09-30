import { NextResponse } from "next/server";

/* FormData -> plain object.*/
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

// Same shape showErrorToast reads on the client: { message, errors: [{ message }] }
export const validationError = (errorsOrZodError) => {
  const errors = Array.isArray(errorsOrZodError)
    ? errorsOrZodError
    : errorsOrZodError.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

  return NextResponse.json({ message: "Validation failed", errors }, { status: 400 });
};

export const jsonError = (message, status) =>
  NextResponse.json({ message }, { status });

export const handleRouteError = (err, label) => {
  // Mongo duplicate key -> e.g. "title already exists"
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return jsonError(field ? `${field} already exists` : "Already exists", 409);
  }

  console.error(`${label} failed:`, err);
  return jsonError("Internal server error", 500);
};