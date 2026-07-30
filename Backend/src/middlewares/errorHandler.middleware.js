import ENV from "../config/env.js";

export default function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.statusCode ? err.message : "Something went wrong";

  if (err.code === "P2002") {
    statusCode = 409; // Conflict
    const target = err.meta?.target ? ` (${err.meta.target.join(", ")})` : "";
    message = `A record with this unique field already exists${target}.`;
  }

  if (err.code === "P2025") {
    statusCode = 404; // Not Found
    message = "The requested resource was not found.";
  }

  if (err.code === "P2023") {
    statusCode = 400; // Bad Request
    message = "Invalid identifier format provided.";
  }

  if (ENV.NODE_ENV !== "production") {
    console.error("💥 ERROR HANDLED:", err);
  }

  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,

    ...(ENV.NODE_ENV === "development" && { stack: err.stack }),
  });
}
