/**
 * Service Registry - Central configuration for all microservices
 * 
 * This registry maintains the URLs, health endpoints, and configuration
 * for all services in the Evolve AI platform.
 */

export const SERVICE_REGISTRY = {
  AUTH: {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
    healthEndpoint: '/health',
    readyEndpoint: '/ready',
    timeout: 5000,
    retries: 3,
  },
  TEACHER: {
    name: 'teacher-service',
    url: process.env.TEACHER_SERVICE_URL || 'http://teacher-service:9003',
    healthEndpoint: '/health',
    readyEndpoint: '/ready',
    timeout: 5000,
    retries: 3,
  },
  STUDENT: {
    name: 'student-service',
    url: process.env.STUDENT_SERVICE_URL || 'http://student-service:9002',
    healthEndpoint: '/health',
    readyEndpoint: '/ready',
    timeout: 5000,
    retries: 3,
  },
  NOTIFICATION: {
    name: 'notification-service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:9020',
    healthEndpoint: '/health',
    readyEndpoint: '/ready',
    timeout: 3000,
    retries: 2,
  },
  GRADING: {
    name: 'grading-service',
    url: process.env.GRADING_SERVICE_URL || 'http://grading-service:9006',
    healthEndpoint: '/health',
    readyEndpoint: '/ready',
    timeout: 10000, // Grading may take longer
    retries: 3,
  },
  EXAM: {
    name: 'exam-service',
    url: process.env.EXAM_SERVICE_URL || 'http://exam-service:9005',
    healthEndpoint: '/backend-health',
    readyEndpoint: '/backend-health',
    timeout: 30000, // Code execution takes time
    retries: 2,
  },
  AI: {
    name: 'ai-service',
    url: process.env.AI_SERVICE_URL || 'http://ai-service:8000',
    healthEndpoint: '/health',
    readyEndpoint: '/health',
    timeout: 15000, // AI processing takes time
    retries: 2,
  },
};

/**
 * Get service URL by service name
 * @param {string} serviceName - Name of the service (e.g., 'AUTH', 'TEACHER')
 * @returns {string} Service URL
 * @throws {Error} If service not found
 */
export const getServiceUrl = (serviceName) => {
  const service = SERVICE_REGISTRY[serviceName.toUpperCase()];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found in registry`);
  }
  return service.url;
};

/**
 * Get service configuration by service name
 * @param {string} serviceName - Name of the service
 * @returns {object} Service configuration
 * @throws {Error} If service not found
 */
export const getServiceConfig = (serviceName) => {
  const service = SERVICE_REGISTRY[serviceName.toUpperCase()];
  if (!service) {
    throw new Error(`Service '${serviceName}' not found in registry`);
  }
  return service;
};

/**
 * Get all service names
 * @returns {string[]} Array of service names
 */
export const getAllServiceNames = () => {
  return Object.keys(SERVICE_REGISTRY);
};

/**
 * Get all service URLs
 * @returns {object} Object mapping service names to URLs
 */
export const getAllServiceUrls = () => {
  const urls = {};
  Object.entries(SERVICE_REGISTRY).forEach(([key, config]) => {
    urls[key] = config.url;
  });
  return urls;
};

/**
 * Check if a service is registered
 * @param {string} serviceName - Name of the service
 * @returns {boolean} True if service is registered
 */
export const isServiceRegistered = (serviceName) => {
  return SERVICE_REGISTRY.hasOwnProperty(serviceName.toUpperCase());
};

/**
 * Build full endpoint URL
 * @param {string} serviceName - Name of the service
 * @param {string} path - API path (e.g., '/assignments')
 * @returns {string} Full URL
 */
export const buildServiceUrl = (serviceName, path) => {
  const baseUrl = getServiceUrl(serviceName);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Service endpoints - Commonly used API endpoints
 */
export const ENDPOINTS = {
  // Auth Service
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_VERIFY: '/auth/verify',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_SUBJECTS: '/subjects',

  // Teacher Service
  TEACHER_ASSIGNMENTS: '/assignments',
  TEACHER_TESTS: '/tests',
  TEACHER_QUESTIONS: '/questions',
  TEACHER_CODING: '/coding',

  // Student Service
  STUDENT_SUBMISSIONS: '/submissions',
  STUDENT_TESTS: '/tests',
  STUDENT_AI: '/ai',

  // Notification Service
  NOTIFICATION_LOGS: '/logs',
  NOTIFICATION_WEBSOCKET: '/ws',

  // Grading Service
  GRADING_EVALUATE: '/evaluate',

  // Exam Service
  EXAM_EXECUTE: '/execute',
  EXAM_WEB: '/execute/web',
};

export default {
  SERVICE_REGISTRY,
  getServiceUrl,
  getServiceConfig,
  getAllServiceNames,
  getAllServiceUrls,
  isServiceRegistered,
  buildServiceUrl,
  ENDPOINTS,
};
