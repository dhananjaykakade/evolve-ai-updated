import express from 'express';
import TeacherControllerV2 from '../controllers/teacherControllerV2.js';
import { authenticateAdmin } from '../middlewares/auth.js';
import { strictRateLimit, userRateLimit } from '../middleware/rateLimitMiddleware.js';
import { validate, teacherSchemas, commonSchemas } from '../middleware/validationMiddleware.js';
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v2/teacher/login
 * @desc    Teacher login
 * @access  Public
 */
router.post(
  '/login',
  strictRateLimit(5, 300), // 5 attempts per 5 minutes
  validate(teacherSchemas.login),
  TeacherControllerV2.login
);

/**
 * @route   POST /api/v2/teacher
 * @desc    Create a new teacher
 * @access  Private (Admin)
 */
router.post(
  '/',
  authenticateAdmin,
  userRateLimit(20, 60), // 20 requests per minute
  validate(teacherSchemas.create),
  invalidateCacheMiddleware(['teachers:list:*']),
  TeacherControllerV2.create
);

/**
 * @route   GET /api/v2/teacher
 * @desc    Get all teachers with pagination
 * @access  Private (Admin)
 */
router.get(
  '/',
  authenticateAdmin,
  userRateLimit(100, 60), // 100 requests per minute
  validate(teacherSchemas.list, 'query'),
  TeacherControllerV2.getAll
);

/**
 * @route   GET /api/v2/teacher/:id
 * @desc    Get teacher by ID
 * @access  Private (Admin)
 */
router.get(
  '/:id',
  authenticateAdmin,
  userRateLimit(100, 60), // 100 requests per minute
  validate(commonSchemas.id, 'params'),
  TeacherControllerV2.getById
);

/**
 * @route   PUT /api/v2/teacher/:id
 * @desc    Update teacher
 * @access  Private (Admin)
 */
router.put(
  '/:id',
  authenticateAdmin,
  userRateLimit(30, 60), // 30 requests per minute
  validate(commonSchemas.id, 'params'),
  validate(teacherSchemas.update),
  invalidateCacheMiddleware(['teachers:list:*', 'teacher:*']),
  TeacherControllerV2.update
);

/**
 * @route   DELETE /api/v2/teacher/:id
 * @desc    Delete teacher
 * @access  Private (Admin)
 */
router.delete(
  '/:id',
  authenticateAdmin,
  userRateLimit(20, 60), // 20 requests per minute
  validate(commonSchemas.id, 'params'),
  invalidateCacheMiddleware(['teachers:list:*', 'teacher:*']),
  TeacherControllerV2.delete
);

export default router;
