import express from 'express';
import StudentControllerV2 from '../controllers/studentControllerV2.js';
import { authenticateAdmin } from '../middlewares/auth.js';
import { strictRateLimit, userRateLimit } from '../middleware/rateLimitMiddleware.js';
import { validate, studentSchemas, commonSchemas } from '../middleware/validationMiddleware.js';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v2/student/login
 * @desc    Student login
 * @access  Public
 */
router.post(
  '/login',
  strictRateLimit(5, 300), // 5 attempts per 5 minutes
  validate(studentSchemas.login),
  StudentControllerV2.login
);

/**
 * @route   POST /api/v2/student
 * @desc    Create a new student
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticateAdmin,
  userRateLimit(20, 60), // 20 requests per minute
  validate(studentSchemas.create),
  invalidateCacheMiddleware(['students:list:*']),
  StudentControllerV2.create
);

/**
 * @route   GET /api/v2/student
 * @desc    Get all students with pagination
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateAdmin,
  userRateLimit(100, 60), // 100 requests per minute
  validate(studentSchemas.list, 'query'),
  StudentControllerV2.getAll
);

/**
 * @route   GET /api/v2/student/:id
 * @desc    Get student by ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authenticateAdmin,
  userRateLimit(100, 60), // 100 requests per minute
  validate(commonSchemas.id, 'params'),
  StudentControllerV2.getById
);

/**
 * @route   PUT /api/v2/student/:id
 * @desc    Update student
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticateAdmin,
  userRateLimit(30, 60), // 30 requests per minute
  validate(commonSchemas.id, 'params'),
  validate(studentSchemas.update),
  invalidateCacheMiddleware(['students:list:*', 'student:*']),
  StudentControllerV2.update
);

/**
 * @route   DELETE /api/v2/student/:id
 * @desc    Delete student
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticateAdmin,
  userRateLimit(20, 60), // 20 requests per minute
  validate(commonSchemas.id, 'params'),
  invalidateCacheMiddleware(['students:list:*', 'student:*']),
  StudentControllerV2.delete
);

export default router;
