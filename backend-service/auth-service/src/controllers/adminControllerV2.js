import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ResponseHandlerV2 from '../utils/ResponseHandlerV2.js';
import { CacheService } from '../middleware/cacheMiddleware.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Admin Controller V2 - Optimized with caching and improved error handling
 */
class AdminControllerV2 {
  /**
   * Admin registration with optimized validation
   */
  static async register(req, res) {
    const startTime = Date.now();

    try {
      const { name, email, password, role = 'admin' } = req.body;

      // Check if admin exists (optimized query - only check existence)
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingAdmin) {
        return ResponseHandlerV2.conflict(res, {
          message: 'Admin with this email already exists',
          metadata: {
            executionTime: Date.now() - startTime
          }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin
      const admin = await prisma.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      });

      logger.info(`Admin registered: ${admin.email}`);

      return ResponseHandlerV2.created(res, {
        message: 'Admin registered successfully',
        data: admin,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    } catch (error) {
      logger.error('Admin registration error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to register admin',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Admin login with rate limiting and caching
   */
  static async login(req, res) {
    const startTime = Date.now();

    try {
      const { email, password } = req.body;

      // Find admin
      const admin = await prisma.admin.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true
        }
      });

      if (!admin) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: {
            executionTime: Date.now() - startTime
          }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: {
            executionTime: Date.now() - startTime
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email, 
          role: admin.role,
          type: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Cache admin data (excluding password)
      const adminData = {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };

      await CacheService.set(`admin:${admin.id}`, adminData, 3600); // Cache for 1 hour

      logger.info(`Admin logged in: ${admin.email}`);

      return ResponseHandlerV2.success(res, {
        message: 'Login successful',
        data: {
          token,
          admin: adminData,
          expiresIn: '24h'
        },
        metadata: {
          executionTime: Date.now() - startTime,
          tokenType: 'Bearer'
        }
      });
    } catch (error) {
      logger.error('Admin login error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Login failed',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Get admin profile with caching
   */
  static async getProfile(req, res) {
    const startTime = Date.now();

    try {
      const adminId = req.user.id;

      // Try cache first
      let admin = await CacheService.get(`admin:${adminId}`);

      if (!admin) {
        // Fetch from database
        admin = await prisma.admin.findUnique({
          where: { id: adminId },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!admin) {
          return ResponseHandlerV2.notFound(res, {
            message: 'Admin not found',
            metadata: {
              executionTime: Date.now() - startTime
            }
          });
        }

        // Cache the result
        await CacheService.set(`admin:${adminId}`, admin, 3600);
      }

      return ResponseHandlerV2.success(res, {
        message: 'Profile retrieved successfully',
        data: admin,
        metadata: {
          executionTime: Date.now() - startTime,
          cached: !!admin
        }
      });
    } catch (error) {
      logger.error('Get admin profile error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve profile',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Update admin profile with cache invalidation
   */
  static async updateProfile(req, res) {
    const startTime = Date.now();

    try {
      const adminId = req.user.id;
      const { name, email, currentPassword, password } = req.body;

      // Verify current password if changing password
      if (password) {
        const admin = await prisma.admin.findUnique({
          where: { id: adminId },
          select: { password: true }
        });

        const isValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isValid) {
          return ResponseHandlerV2.unauthorized(res, {
            message: 'Current password is incorrect',
            metadata: {
              executionTime: Date.now() - startTime
            }
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = await bcrypt.hash(password, 12);

      // Update admin
      const updatedAdmin = await prisma.admin.update({
        where: { id: adminId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          updatedAt: true
        }
      });

      // Invalidate cache
      await CacheService.del(`admin:${adminId}`);

      logger.info(`Admin profile updated: ${updatedAdmin.email}`);

      return ResponseHandlerV2.success(res, {
        message: 'Profile updated successfully',
        data: updatedAdmin,
        metadata: {
          executionTime: Date.now() - startTime,
          cacheInvalidated: true
        }
      });
    } catch (error) {
      logger.error('Update admin profile error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to update profile',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    }
  }

  /**
   * Get all admins (superadmin only) with pagination
   */
  static async getAll(req, res) {
    const startTime = Date.now();

    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      // Get total count and data in parallel
      const [total, admins] = await Promise.all([
        prisma.admin.count({ where }),
        prisma.admin.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip: parseInt(skip),
          take: parseInt(limit)
        })
      ]);

      return ResponseHandlerV2.paginated(res, {
        data: admins,
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        message: 'Admins retrieved successfully',
        metadata: {
          executionTime: Date.now() - startTime,
          filters: { search, sortBy, sortOrder }
        }
      });
    } catch (error) {
      logger.error('Get all admins error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve admins',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: {
          executionTime: Date.now() - startTime
        }
      });
    }
  }
}

export default AdminControllerV2;
