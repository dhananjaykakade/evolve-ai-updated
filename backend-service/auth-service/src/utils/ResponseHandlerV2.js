import { randomUUID } from 'crypto';

/**
 * Enhanced Response Handler with tracking ID and metadata
 * Version 2.0
 */
class ResponseHandler {
  /**
   * Generate a unique tracking ID for each request
   */
  static generateTrackingId() {
    return `${Date.now()}-${randomUUID()}`;
  }

  /**
   * Build base response structure with metadata
   */
  static buildResponse({
    success,
    statusCode,
    message,
    data = null,
    errors = null,
    trackingId = null,
    metadata = {}
  }) {
    const response = {
      success,
      statusCode,
      message,
      trackingId: trackingId || this.generateTrackingId(),
      timestamp: new Date().toISOString(),
      metadata: {
        version: 'v2',
        ...metadata
      }
    };

    if (data !== null) {
      response.data = data;
    }

    if (errors !== null) {
      response.errors = errors;
    }

    return response;
  }

  /**
   * Send success response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Success message
   * @param {*} data - Response data
   * @param {Object} metadata - Additional metadata
   */
  static success(res, {
    statusCode = 200,
    message = 'Request successful',
    data = null,
    metadata = {}
  }) {
    const response = this.buildResponse({
      success: true,
      statusCode,
      message,
      data,
      metadata
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   * @param {Object} res - Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Error message
   * @param {*} errors - Error details
   * @param {Object} metadata - Additional metadata
   */
  static error(res, {
    statusCode = 500,
    message = 'An error occurred',
    errors = null,
    metadata = {}
  }) {
    const response = this.buildResponse({
      success: false,
      statusCode,
      message,
      errors,
      metadata
    });

    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created(res, { message = 'Resource created successfully', data = null, metadata = {} }) {
    return this.success(res, { statusCode: 201, message, data, metadata });
  }

  /**
   * Send accepted response (202)
   */
  static accepted(res, { message = 'Request accepted', data = null, metadata = {} }) {
    return this.success(res, { statusCode: 202, message, data, metadata });
  }

  /**
   * Send no content response (204)
   */
  static noContent(res) {
    return res.status(204).send();
  }

  /**
   * Send bad request error (400)
   */
  static badRequest(res, { message = 'Bad request', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 400, message, errors, metadata });
  }

  /**
   * Send unauthorized error (401)
   */
  static unauthorized(res, { message = 'Unauthorized access', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 401, message, errors, metadata });
  }

  /**
   * Send forbidden error (403)
   */
  static forbidden(res, { message = 'Access forbidden', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 403, message, errors, metadata });
  }

  /**
   * Send not found error (404)
   */
  static notFound(res, { message = 'Resource not found', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 404, message, errors, metadata });
  }

  /**
   * Send conflict error (409)
   */
  static conflict(res, { message = 'Resource conflict', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 409, message, errors, metadata });
  }

  /**
   * Send validation error (422)
   */
  static validationError(res, { message = 'Validation failed', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 422, message, errors, metadata });
  }

  /**
   * Send too many requests error (429)
   */
  static tooManyRequests(res, { message = 'Too many requests', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 429, message, errors, metadata });
  }

  /**
   * Send internal server error (500)
   */
  static internalError(res, { message = 'Internal server error', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 500, message, errors, metadata });
  }

  /**
   * Send service unavailable error (503)
   */
  static serviceUnavailable(res, { message = 'Service temporarily unavailable', errors = null, metadata = {} }) {
    return this.error(res, { statusCode: 503, message, errors, metadata });
  }

  /**
   * Paginated response helper
   */
  static paginated(res, {
    data,
    page = 1,
    limit = 10,
    total,
    message = 'Data retrieved successfully',
    metadata = {}
  }) {
    const totalPages = Math.ceil(total / limit);
    
    return this.success(res, {
      statusCode: 200,
      message,
      data: {
        items: data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      metadata
    });
  }
}

export default ResponseHandler;
