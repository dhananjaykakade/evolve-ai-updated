import Joi from 'joi';
import ResponseHandlerV2 from '../utils/ResponseHandlerV2.js';

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return ResponseHandlerV2.validationError(res, {
        message: 'Validation failed',
        errors,
        metadata: {
          validatedProperty: property
        }
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

/**
 * Validation schemas for Admin routes
 */
export const adminSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    role: Joi.string().valid('admin', 'superadmin').default('admin')
  }),

  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    email: Joi.string().email().trim().lowercase(),
    currentPassword: Joi.string().when('password', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
    password: Joi.string().min(8).max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  }).min(1)
};

/**
 * Validation schemas for Teacher routes
 */
export const teacherSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    department: Joi.string().max(100).optional().trim(),
    qualification: Joi.string().max(200).optional().trim(),
    experience: Joi.number().integer().min(0).optional()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    email: Joi.string().email().trim().lowercase(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    department: Joi.string().max(100).trim(),
    qualification: Joi.string().max(200).trim(),
    experience: Joi.number().integer().min(0),
    password: Joi.string().min(8).max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  }).min(1),

  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).trim(),
    department: Joi.string().max(100).trim(),
    sortBy: Joi.string().valid('name', 'email', 'createdAt', 'experience').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

/**
 * Validation schemas for Student routes
 */
export const studentSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    enrollmentNumber: Joi.string().max(50).optional().trim(),
    dateOfBirth: Joi.date().max('now').optional(),
    address: Joi.string().max(500).optional().trim()
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim(),
    email: Joi.string().email().trim().lowercase(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    enrollmentNumber: Joi.string().max(50).trim(),
    dateOfBirth: Joi.date().max('now'),
    address: Joi.string().max(500).trim(),
    password: Joi.string().min(8).max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  }).min(1),

  login: Joi.object({
    email: Joi.string().email().required().trim().lowercase(),
    password: Joi.string().required()
  }),

  list: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().max(100).trim(),
    enrollmentNumber: Joi.string().max(50).trim(),
    sortBy: Joi.string().valid('name', 'email', 'enrollmentNumber', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  })
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: Joi.object({
    id: Joi.string().uuid().required()
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};
