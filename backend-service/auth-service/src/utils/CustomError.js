class CustomError extends Error {
    /**
     * Custom error class for consistent API error handling.
     * @param {String} message - The error message.
     * @param {Number} statusCode - HTTP status code (default: 500).
     * @param {Object} [errors={}] - Optional detailed errors.
     */
    constructor(message = "Internal Server Error", statusCode = 500, errors = {}) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.errors = errors;
      
      // Ensure proper stack trace
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export default CustomError;
  
  