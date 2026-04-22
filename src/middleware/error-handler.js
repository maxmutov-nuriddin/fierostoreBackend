export function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(error, _req, res, _next) {
  if (error?.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed.",
      details: Object.values(error.errors).map((entry) => entry.message)
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: "This record already exists." });
  }

  return res.status(error?.statusCode ?? 500).json({
    message: error?.message ?? "Internal server error."
  });
}
