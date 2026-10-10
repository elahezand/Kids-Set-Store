const validate = (schema, body) => {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((err) => ({
      field: err.path.join("."),
      message: err.message,
      expected: err.expected,
      received: err.received,
    }));

    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
};

export default validate;
