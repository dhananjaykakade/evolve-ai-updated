import messages from "./message.js";


/**
 * Handles HTTP responses.
 * Provides a set of static methods for sending various HTTP responses.
 */


class ResponseHandler {
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Success message
   * @param {Object} [data={}] - Additional data
   */
  static success(res, statusCode = 200, message = messages.success.DEFAULT, data = {}) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Error message
   * @param {Object} [errors={}] - Additional error details
   */
  static error(res, statusCode = 500, message = messages.error.DEFAULT, errors = {}) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  }

  /**
   * Send a validation error response
   * @param {Object} res - Express response object
   * @param {String} message - Validation error message
   * @param {Object} errors - Validation error details
   */
  static validationError(res, message = messages.error.VALIDATION, errors = {}) {
    return res.status(422).json({
      success: false,
      statusCode: 422,
      message,
      errors,
    });
  }

  /**
   * Send an unauthorized response
   * @param {Object} res - Express response object
   * @param {String} message - Unauthorized access message
   */
  static unauthorized(res, message = messages.error.UNAUTHORIZED) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message,
    });
  }

  /**
   * Send a forbidden response
   * @param {Object} res - Express response object
   * @param {String} message - Forbidden action message
   */
  static forbidden(res, message = messages.error.FORBIDDEN) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message,
    });
  }

  /**
   * Send a not found response
   * @param {Object} res - Express response object
   * @param {String} message - Not found message
   */
  static notFound(res, message = messages.error.NOT_FOUND) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message,
    });
  }

  /**
   * Send a bad request response
   * @param {Object} res - Express response object
   * @param {String} message - Bad request message
   * @param {Object} errors - Additional error details
   */
  static badRequest(res, message = messages.error.BAD_REQUEST, errors = {}) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message,
      errors,
    });
  }

  /**
   * Send a conflict response
   * @param {Object} res - Express response object
   * @param {String} message - Conflict message
   */
  static conflict(res, message = messages.error.CONFLICT) {
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message,
    });
  }

  /**
   * Send a too many requests response
   * @param {Object} res - Express response object
   * @param {String} message - Too many requests message
   */
  static tooManyRequests(res, message = messages.error.TOO_MANY_REQUESTS) {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message,
    });
  }

  /**
   * Send a service unavailable response
   * @param {Object} res - Express response object
   * @param {String} message - Service unavailable message
   */
  static serviceUnavailable(res, message = messages.error.SERVICE_UNAVAILABLE) {
    return res.status(503).json({
      success: false,
      statusCode: 503,
      message,
    });
  }


  /**
   * Send an error response (for middleware)
   */
  static handleError(err, res) {
    const statusCode = err.statusCode || 500;
    const message = err.message || messages.error.DEFAULT;
    const errors = err.errors || {};

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  }
}

export default ResponseHandler;
