import ResponseHandler from "../utils/CustomResponse.js";
import { logger } from "../utils/logger.js"; // Import Winston logger

/**
 * Global error-handling middleware for Express.
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || {};
  const logLevel = statusCode >= 500 ? "error" : "warn"; // Ensure 500-level errors log as 'error'

  // Prevent Express from auto-logging errors
  res.locals.errorMessage = message;

  // Ensure structured logging with meta object
  logger.log({
    level: logLevel,
    message: `${statusCode} - ${message} (${req.method} ${req.originalUrl})`,
    meta: {
      statusCode,
      route: req.originalUrl,
      method: req.method,
      errors,
    },
    stack: err.stack || "No stack trace available", // Always log stack trace properly
  });

  // Send structured error response
  return ResponseHandler.handleError(err, res);
};

export default errorMiddleware;
