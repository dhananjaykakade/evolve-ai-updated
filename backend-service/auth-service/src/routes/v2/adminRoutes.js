import express from 'express';
import AdminControllerV2 from '../controllers/adminControllerV2.js';
import { authenticateAdmin } from '../middlewares/auth.js';
import { strictRateLimit, ipRateLimit, userRateLimit } from '../middleware/rateLimitMiddleware.js';
import { validate, adminSchemas, commonSchemas } from '../middleware/validationMiddleware.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/v2/admin/register
 * @desc    Register a new admin
 * @access  Public (should be protected in production)
 */
router.post(
  '/register',
  strictRateLimit(5, 3600), // 5 requests per hour
  validate(adminSchemas.register),
  AdminControllerV2.register
);

/**
 * @route   POST /api/v2/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post(
  '/login',
  strictRateLimit(5, 300), // 5 attempts per 5 minutes
  validate(adminSchemas.login),
  AdminControllerV2.login
);

/**
 * @route   GET /api/v2/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get(
  '/profile',
  authenticateAdmin,
  userRateLimit(100, 60), // 100 requests per minute
  cacheMiddleware({ ttl: 300 }), // Cache for 5 minutes
  AdminControllerV2.getProfile
);

/**
 * @route   PUT /api/v2/admin/profile
 * @desc    Update admin profile
 * @access  Private (Admin)
 */
router.put(
  '/profile',
  authenticateAdmin,
  userRateLimit(20, 60), // 20 requests per minute
  validate(adminSchemas.updateProfile),
  AdminControllerV2.updateProfile
);

/**
 * @route   GET /api/v2/admin/all
 * @desc    Get all admins (superadmin only)
 * @access  Private (Superadmin)
 */
router.get(
  '/all',
  authenticateAdmin,
  userRateLimit(50, 60), // 50 requests per minute
  cacheMiddleware({ 
    ttl: 300,
    keyGenerator: (req) => `admins:list:${req.query.page || 1}:${req.query.limit || 10}:${req.query.search || ''}`
  }),
  AdminControllerV2.getAll
);

export default router;
