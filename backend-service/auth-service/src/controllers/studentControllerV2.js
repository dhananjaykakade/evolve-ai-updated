import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ResponseHandlerV2 from '../utils/ResponseHandlerV2.js';
import { CacheService } from '../middleware/cacheMiddleware.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Student Controller V2 - Optimized with caching and improved error handling
 */
class StudentControllerV2 {
  /**
   * Create student with optimized validation
   */
  static async create(req, res) {
    const startTime = Date.now();

    try {
      const { name, email, password, phone, enrollmentNumber, dateOfBirth, address } = req.body;
      const adminId = req.user.id;

      // Check if student exists
      const existingStudent = await prisma.student.findUnique({
        where: { email },
        select: { id: true }
      });

      if (existingStudent) {
        return ResponseHandlerV2.conflict(res, {
          message: 'Student with this email already exists',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Check enrollment number uniqueness if provided
      if (enrollmentNumber) {
        const enrollmentExists = await prisma.student.findFirst({
          where: { enrollmentNumber },
          select: { id: true }
        });

        if (enrollmentExists) {
          return ResponseHandlerV2.conflict(res, {
            message: 'Enrollment number already exists',
            metadata: { executionTime: Date.now() - startTime }
          });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create student
      const student = await prisma.student.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          enrollmentNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          adminId
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          enrollmentNumber: true,
          dateOfBirth: true,
          address: true,
          createdAt: true
        }
      });

      // Invalidate students list cache
      await CacheService.delPattern('students:list:*');

      logger.info(`Student created: ${student.email} by admin ${adminId}`);

      return ResponseHandlerV2.created(res, {
        message: 'Student created successfully',
        data: student,
        metadata: {
          executionTime: Date.now() - startTime,
          createdBy: adminId
        }
      });
    } catch (error) {
      logger.error('Create student error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to create student',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Get all students with pagination and caching
   */
  static async getAll(req, res) {
    const startTime = Date.now();

    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        enrollmentNumber,
        sortBy = 'createdAt', 
        sortOrder = 'desc' 
      } = req.query;

      const skip = (page - 1) * limit;

      // Create cache key
      const cacheKey = `students:list:${page}:${limit}:${search || ''}:${enrollmentNumber || ''}:${sortBy}:${sortOrder}`;
      
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
      if (search || enrollmentNumber) {
        where.AND = [];
        if (search) {
          where.AND.push({
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          });
        }
        if (enrollmentNumber) {
          where.AND.push({ enrollmentNumber: { contains: enrollmentNumber, mode: 'insensitive' } });
        }
      }

      // Get total count and data in parallel
      const [total, students] = await Promise.all([
        prisma.student.count({ where: Object.keys(where).length > 0 ? where : undefined }),
        prisma.student.findMany({
          where: Object.keys(where).length > 0 ? where : undefined,
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            enrollmentNumber: true,
            dateOfBirth: true,
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
        message: 'Students retrieved successfully',
        data: {
          items: students,
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
          filters: { search, enrollmentNumber, sortBy, sortOrder }
        }
      });

      // Cache the response for 5 minutes
      await CacheService.set(cacheKey, response, 300);

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Get all students error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve students',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Get student by ID with caching
   */
  static async getById(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      // Try cache first
      let student = await CacheService.get(`student:${id}`);

      if (!student) {
        student = await prisma.student.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            enrollmentNumber: true,
            dateOfBirth: true,
            address: true,
            createdAt: true,
            updatedAt: true,
            enrollments: {
              select: {
                id: true,
                enrolledAt: true,
                course: {
                  select: {
                    id: true,
                    subject: {
                      select: {
                        id: true,
                        name: true,
                        code: true
                      }
                    },
                    teacher: {
                      select: {
                        id: true,
                        name: true,
                        department: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        if (!student) {
          return ResponseHandlerV2.notFound(res, {
            message: 'Student not found',
            metadata: { executionTime: Date.now() - startTime }
          });
        }

        // Cache for 10 minutes
        await CacheService.set(`student:${id}`, student, 600);
      }

      return ResponseHandlerV2.success(res, {
        message: 'Student retrieved successfully',
        data: student,
        metadata: {
          executionTime: Date.now() - startTime,
          cached: !!student
        }
      });
    } catch (error) {
      logger.error('Get student by ID error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to retrieve student',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Update student with cache invalidation
   */
  static async update(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const { name, email, phone, enrollmentNumber, dateOfBirth, address, password } = req.body;

      // Check if student exists
      const existingStudent = await prisma.student.findUnique({
        where: { id },
        select: { id: true, email: true, enrollmentNumber: true }
      });

      if (!existingStudent) {
        return ResponseHandlerV2.notFound(res, {
          message: 'Student not found',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Check email uniqueness if changing
      if (email && email !== existingStudent.email) {
        const emailExists = await prisma.student.findUnique({
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

      // Check enrollment number uniqueness if changing
      if (enrollmentNumber && enrollmentNumber !== existingStudent.enrollmentNumber) {
        const enrollmentExists = await prisma.student.findFirst({
          where: { enrollmentNumber },
          select: { id: true }
        });

        if (enrollmentExists) {
          return ResponseHandlerV2.conflict(res, {
            message: 'Enrollment number already in use',
            metadata: { executionTime: Date.now() - startTime }
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (enrollmentNumber) updateData.enrollmentNumber = enrollmentNumber;
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
      if (address !== undefined) updateData.address = address;
      if (password) updateData.password = await bcrypt.hash(password, 12);

      // Update student
      const student = await prisma.student.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          enrollmentNumber: true,
          dateOfBirth: true,
          address: true,
          updatedAt: true
        }
      });

      // Invalidate caches
      await Promise.all([
        CacheService.del(`student:${id}`),
        CacheService.delPattern('students:list:*')
      ]);

      logger.info(`Student updated: ${student.email} by admin ${req.user.id}`);

      return ResponseHandlerV2.success(res, {
        message: 'Student updated successfully',
        data: student,
        metadata: {
          executionTime: Date.now() - startTime,
          updatedBy: req.user.id,
          cacheInvalidated: true
        }
      });
    } catch (error) {
      logger.error('Update student error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to update student',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Delete student with cache invalidation
   */
  static async delete(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      // Check if student exists and has enrollments
      const student = await prisma.student.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          enrollments: {
            select: { id: true }
          }
        }
      });

      if (!student) {
        return ResponseHandlerV2.notFound(res, {
          message: 'Student not found',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      if (student.enrollments.length > 0) {
        return ResponseHandlerV2.badRequest(res, {
          message: 'Cannot delete student with active enrollments',
          errors: {
            enrollmentsCount: student.enrollments.length,
            hint: 'Please unenroll student from courses first'
          },
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Delete student
      await prisma.student.delete({ where: { id } });

      // Invalidate caches
      await Promise.all([
        CacheService.del(`student:${id}`),
        CacheService.delPattern('students:list:*')
      ]);

      logger.info(`Student deleted: ${student.email} by admin ${req.user.id}`);

      return ResponseHandlerV2.success(res, {
        message: 'Student deleted successfully',
        metadata: {
          executionTime: Date.now() - startTime,
          deletedBy: req.user.id,
          cacheInvalidated: true
        }
      });
    } catch (error) {
      logger.error('Delete student error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Failed to delete student',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }

  /**
   * Student login
   */
  static async login(req, res) {
    const startTime = Date.now();

    try {
      const { email, password } = req.body;

      // Find student
      const student = await prisma.student.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          enrollmentNumber: true
        }
      });

      if (!student) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, student.password);

      if (!isValidPassword) {
        return ResponseHandlerV2.unauthorized(res, {
          message: 'Invalid credentials',
          metadata: { executionTime: Date.now() - startTime }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: student.id, 
          email: student.email,
          type: 'student'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Cache student data
      const studentData = {
        id: student.id,
        name: student.name,
        email: student.email,
        enrollmentNumber: student.enrollmentNumber
      };

      await CacheService.set(`student:${student.id}`, studentData, 3600);

      logger.info(`Student logged in: ${student.email}`);

      return ResponseHandlerV2.success(res, {
        message: 'Login successful',
        data: {
          token,
          student: studentData,
          expiresIn: '24h'
        },
        metadata: {
          executionTime: Date.now() - startTime,
          tokenType: 'Bearer'
        }
      });
    } catch (error) {
      logger.error('Student login error:', error);
      return ResponseHandlerV2.internalError(res, {
        message: 'Login failed',
        errors: process.env.NODE_ENV === 'development' ? error.message : undefined,
        metadata: { executionTime: Date.now() - startTime }
      });
    }
  }
}

export default StudentControllerV2;
