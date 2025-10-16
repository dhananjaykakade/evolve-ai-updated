import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ResponseHandlerV2 from '../utils/ResponseHandlerV2.js';
import { CacheService } from '../middleware/cacheMiddleware.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Teacher Controller V2 - Optimized with caching and improved error handling
 */
class TeacherControllerV2 {
  /**
   * Create teacher with optimized validation
   */
  static async create(req, res) {
    const startTime = Date.now();

    try {
      const { name, email, password, phone, department, qualification, experience } = req.body;
      const adminId = req.user.id;

      // Check if teacher exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingTeacher) {
        return ResponseHandlerV2.conflict(res, {
          message: 'Teacher with this email already exists',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create teacher
      const teacher = await prisma.teacher.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          department,
          qualification,
          experience,
          adminId
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          qualification: true,
          experience: true,
          createdAt: true
        }
      });

      // Invalidate teachers list cache
      await CacheService.delPattern('teachers:list:*');

      logger.info(`Teacher created: ${teacher.email} by admin ${adminId}`);

      return ResponseHandlerV2.created(res, {
        message: 'Teacher created successfully',
        data: teacher,
        metadata: {
          executionTime: Date.now() - startTime,
          createdBy: adminId
        }
      });
    } catch (error) {
      logger.error('Create teacher error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to create teacher',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Get all teachers with pagination and caching
   */
  static async getAll(req, res) {
    const startTime = Date.now();

    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        department,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const skip = (page - 1) * limit;

      // Create cache key
      const cacheKey = `teachers:list:${page}:${limit}:${search || ''}:${department || ''}:${sortBy}:${sortOrder}`;
      
      // Try cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          ...cached,
          metadata: {
            ...cached.metadata,
            cached: true,
            executionTime: Date.now() - startTime
          }
        });
      }

      // Build where clause
      const where = {};
      if (search || department) {
        where.AND = [];
        if (search) {
          where.AND.push({
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          });
        }
        if (department) {
          where.AND.push({ department: { contains: department, mode: 'insensitive' } });
        }
      }

      // Get total count and data in parallel
      const [total, teachers] = await Promise.all([
        prisma.teacher.count({ where: Object.keys(where).length > 0 ? where : undefined }),
        prisma.teacher.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
            qualification: true,
            experience: true,
            createdAt: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip: parseInt(skip),
          take: parseInt(limit)
        })
      ]);

      const response = ResponseHandlerV2.buildResponse({
        success: true,
        statusCode: 200,
        message: 'Teachers retrieved successfully',
        data: {
          items: teachers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          filters: { search, department, sortBy, sortOrder }
        }
      });

      // Cache the response for 5 minutes
      await CacheService.set(cacheKey, response, 300);

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Get all teachers error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve teachers',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Get teacher by ID with caching
   */
  static async getById(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      // Try cache first
      let teacher = await CacheService.get(`teacher:${id}`);

      if (!teacher) {
        teacher = await prisma.teacher.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            department: true,
            qualification: true,
            experience: true,
            createdAt: true,
            updatedAt: true,
            courses: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        });

        if (!teacher) {
          return ResponseHandlerV2.notFound(res, {
            message: 'Teacher not found',
            metadata: { executionTime: Date.now() - startTime }
          });
        }

        // Cache for 10 minutes
        await CacheService.set(`teacher:${id}`, teacher, 600);
      }

      return ResponseHandlerV2.success(res, {
        message: 'Teacher retrieved successfully',
        data: teacher,
        metadata: {
          executionTime: Date.now() - startTime,
          cached: !!teacher
        }
      });
    } catch (error) {
      logger.error('Get teacher by ID error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve teacher',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Update teacher with cache invalidation
   */
  static async update(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const { name, email, phone, department, qualification, experience, password } = req.body;

      // Check if teacher exists
      const existingTeacher = await prisma.teacher.findUnique({
        where: { id },
        select: { id: true, email: true }
      });

      if (!existingTeacher) {
        return ResponseHandlerV2.notFound(res, {
          message: 'Teacher not found',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Check email uniqueness if changing
      if (email && email !== existingTeacher.email) {
        const emailExists = await prisma.teacher.findUnique({
          where: { email },
          select: { id: true }
        });

        if (emailExists) {
          return ResponseHandlerV2.conflict(res, {
            message: 'Email already in use',
            metadata: { executionTime: Date.now() - startTime }
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (department) updateData.department = department;
      if (qualification) updateData.qualification = qualification;
      if (experience !== undefined) updateData.experience = experience;
      if (password) updateData.password = await bcrypt.hash(password, 12);

      // Update teacher
      const teacher = await prisma.teacher.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          department: true,
          qualification: true,
          experience: true,
          updatedAt: true
        }
      });

      // Invalidate caches
      await Promise.all([
        CacheService.del(`teacher:${id}`),
        CacheService.delPattern('teachers:list:*')
      ]);

      logger.info(`Teacher updated: ${teacher.email} by admin ${req.user.id}`);

      return ResponseHandlerV2.success(res, {
        message: 'Teacher updated successfully',
        data: teacher,
        metadata: {
          executionTime: Date.now() - startTime,
          updatedBy: req.user.id,
          cacheInvalidated: true
        }
      });
    } catch (error) {
      logger.error('Update teacher error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to update teacher',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Delete teacher with cache invalidation
   */
  static async delete(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      // Check if teacher exists and has courses
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          courses: {
            select: { id: true }
          }
        }
      });

      if (!teacher) {
        return ResponseHandlerV2.notFound(res, {
          message: 'Teacher not found',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      if (teacher.courses.length > 0) {
        return ResponseHandlerV2.badRequest(res, {
          message: 'Cannot delete teacher with assigned courses',
          errors: {
            coursesCount: teacher.courses.length,
            hint: 'Please reassign or delete courses first'
          },
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Delete teacher
      await prisma.teacher.delete({ where: { id } });

      // Invalidate caches
      await Promise.all([
        CacheService.del(`teacher:${id}`),
        CacheService.delPattern('teachers:list:*')
      ]);

      logger.info(`Teacher deleted: ${teacher.email} by admin ${req.user.id}`);

      return ResponseHandlerV2.success(res, {
        message: 'Teacher deleted successfully',
        metadata: {
          executionTime: Date.now() - startTime,
          deletedBy: req.user.id,
          cacheInvalidated: true
        }
      });
    } catch (error) {
      logger.error('Delete teacher error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to delete teacher',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Teacher login
   */
  static async login(req, res) {
    const startTime = Date.now();

    try {
      const { email, password } = req.body;

      // Find teacher
      const teacher = await prisma.teacher.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          department: true
        }
      });

      if (!teacher) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, teacher.password);

      if (!isValidPassword) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: teacher.id, 
          email: teacher.email,
          type: 'teacher'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Cache teacher data
      const teacherData = {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department
      };

      await CacheService.set(`teacher:${teacher.id}`, teacherData, 3600);

      logger.info(`Teacher logged in: ${teacher.email}`);

      return ResponseHandlerV2.success(res, {
        message: 'Login successful',
        data: {
          token,
          teacher: teacherData,
          expiresIn: '24h'
        },
        metadata: {
          executionTime: Date.now() - startTime,
          tokenType: 'Bearer'
        }
      });
    } catch (error) {
      logger.error('Teacher login error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Login failed',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }
}

export default TeacherControllerV2;
