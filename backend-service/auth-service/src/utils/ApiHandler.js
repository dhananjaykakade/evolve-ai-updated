import { logger } from "./logger.js";
import CustomError from "./CustomError.js";

/**
 * Wraps an asynchronous function in a try-catch block to handle errors.
 * @param {Function} fn - The asynchronous function to handle.
 * @returns {Function} An asynchronous function wrapped with error handling.
 */
const apiHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next);
    } catch (error) {
        logger.error(error.message);
        next(new CustomError());
    }
};

export default apiHandler;
