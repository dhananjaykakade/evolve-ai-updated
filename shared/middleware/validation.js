import Joi from 'joi';

/**
 * Validation Middleware Factory
 * 
 * Creates middleware for validating request body, query params, or route params
 * 
 * @example
 * const validateBody = createValidator({
 *   body: Joi.object({
 *     title: Joi.string().required(),
 *     email: Joi.string().email().required()
 *   })
 * });
 * 
 * app.post('/endpoint', validateBody, controller);
 */
export const createValidator = (schemas) => {
  return (req, res, next) => {
    const errors = {};

    // Validate body
    if (schemas.body) {
      const { error, value } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        errors.body = error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        }));
      } else {
        req.validatedBody = value;
      }
    }

    // Validate query params
    if (schemas.query) {
      const { error, value } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        errors.query = error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        }));
      } else {
        req.validatedQuery = value;
      }
    }

    // Validate route params
    if (schemas.params) {
      const { error, value } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      });
      
      if (error) {
        errors.params = error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message,
        }));
      } else {
        req.validatedParams = value;
      }
    }

    // If validation errors exist, return 400
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: errors,
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlationId: req.correlationId,
        },
      });
    }

    next();
  };
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
    }),
    
  uuid: Joi.string()
    .uuid()
    .required(),
    
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required(),
    
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
    
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')),
  }),
};

/**
 * Assignment validation schemas
 */
export const assignmentSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(5000).required(),
    dueDate: Joi.date().iso().greater('now').required(),
    teacherId: Joi.string().required(),
    course: Joi.string().required(),
    useAI: Joi.boolean().default(false),
    submissionType: Joi.string().valid('file', 'text', 'code', 'url').default('file'),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED').default('DRAFT'),
    materialsUrl: Joi.string().uri().allow(''),
    maxScore: Joi.number().integer().min(0).max(1000).default(100),
    tags: Joi.array().items(Joi.string()).default([]),
  }),
  
  update: Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(5000),
    dueDate: Joi.date().iso().greater('now'),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED'),
    materialsUrl: Joi.string().uri().allow(''),
    maxScore: Joi.number().integer().min(0).max(1000),
    tags: Joi.array().items(Joi.string()),
  }).min(1),
  
  query: Joi.object({
    teacherId: Joi.string(),
    course: Joi.string(),
    status: Joi.string().valid('DRAFT', 'PUBLISHED', 'CLOSED'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

/**
 * User validation schemas
 */
export const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('student', 'teacher', 'admin').required(),
  }),
  
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required(),
  }),
  
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
    bio: Joi.string().max(500),
  }).min(1),
};

/**
 * Test/Exam validation schemas
 */
export const testSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().max(2000),
    duration: Joi.number().integer().min(1).max(720).required(), // In minutes
    totalMarks: Joi.number().integer().min(1).max(1000).required(),
    passingMarks: Joi.number().integer().min(0).required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
    courseId: Joi.string().required(),
    teacherId: Joi.string().required(),
    instructions: Joi.string().max(5000),
    isNegativeMarking: Joi.boolean().default(false),
    negativeMarkingRatio: Joi.number().min(0).max(1).default(0),
  }),
};

/**
 * Submission validation schemas
 */
export const submissionSchemas = {
  create: Joi.object({
    assignmentId: Joi.string().required(),
    studentId: Joi.string().required(),
    content: Joi.string().max(50000).required(),
    fileUrl: Joi.string().uri(),
    submittedAt: Joi.date().iso().default(() => new Date()),
    isLate: Joi.boolean().default(false),
  }),
};

export default {
  createValidator,
  commonSchemas,
  assignmentSchemas,
  userSchemas,
  testSchemas,
  submissionSchemas,
};
