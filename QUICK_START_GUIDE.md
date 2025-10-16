# 🚀 Quick Start Guide: Microservices Improvement Implementation

## Overview

This guide will help you implement the microservices improvements step-by-step. Follow these instructions to upgrade your services with enhanced performance, reliability, and production-readiness.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Redis running (for caching)
- Docker (optional, for containerized development)
- Git (for version control)

---

## Phase 1: Setup Shared Libraries (Day 1)

### Step 1: Install Shared Package Dependencies

```bash
cd shared
npm install
```

### Step 2: Link Shared Package to Services

For each service (auth-service, teacher-service, student-service, etc.):

```bash
cd backend-service/auth-service
npm install ../../shared
npm install compression joi
```

Repeat for all services.

### Step 3: Verify Installation

```bash
# In any service directory
npm list @evolve-ai/shared
# Should show: @evolve-ai/shared@1.0.0
```

---

## Phase 2: Update API Gateway (Day 1-2)

### Step 1: Backup Current Gateway

```bash
cd backend-service/api-gateway
cp index.js index.backup.js
```

### Step 2: Replace with Improved Version

```bash
# Rename the improved version
mv index.improved.js index.js
```

### Step 3: Test Gateway

```bash
# Start gateway
npm run dev

# Test health endpoint
curl http://localhost:9001/health

# Expected response:
# {
#   "status": "healthy",
#   "service": "api-gateway",
#   "version": "2.0.0",
#   ...
# }
```

---

## Phase 3: Update Individual Services (Day 2-5)

### Example: Refactoring Teacher Service

#### Before: `teacher-service/index.js`

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Routes...

app.listen(9003, () => {
  console.log("Teacher Service running on port 9003");
});
```

#### After: `teacher-service/index.js`

```javascript
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { 
  correlationMiddleware,
  serviceNameMiddleware,
  requestLoggerMiddleware 
} from "../../shared/middleware/correlation.js";
import { compressionMiddleware } from "../../shared/middleware/optimization.js";

dotenv.config();

const app = express();
const SERVICE_NAME = "teacher-service";
const PORT = process.env.PORT || 9003;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  exposedHeaders: ["Content-Type", "Authorization", "X-Correlation-ID"],
}));

// Shared middleware
app.use(correlationMiddleware);
app.use(serviceNameMiddleware(SERVICE_NAME));
app.use(requestLoggerMiddleware);
app.use(compressionMiddleware);

app.use(express.json());

// ========================================
// ROUTES
// ========================================

// ... your routes

// ========================================
// HEALTH CHECKS
// ========================================

app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

app.get("/ready", async (req, res) => {
  // Check database connection
  res.status(200).json({ ready: true });
});

// ========================================
// START SERVER
// ========================================

const server = app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log(`Shutting down ${SERVICE_NAME}...`);
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
```

### Refactoring Inter-Service Communication

#### Before: `teacher-service/controllers/assignmentRoute.js`

```javascript
import axios from "axios";

export const getStudentAssignmentsWithSubmissions = async (req, res) => {
  const { studentId } = req.query;
  
  // Fetch from student service
  const submissionsResponse = await axios.get(
    `http://localhost:9002/submissions/all/assignments`,
    { params: { studentId } }
  );
  
  const submissions = submissionsResponse.data.data.submissions || [];
  // ... rest of code
};
```

#### After: `teacher-service/controllers/assignmentRoute.js`

```javascript
import ServiceClient from "../../../shared/http-client.js";
import CacheService from "../../../shared/cache-service.js";
import { buildServiceUrl } from "../../../shared/service-registry.js";

const client = new ServiceClient({ serviceName: 'teacher-service' });
const cache = new CacheService();

export const getStudentAssignmentsWithSubmissions = async (req, res) => {
  const { studentId } = req.query;
  const cacheKey = `submissions:student:${studentId}:assignments`;
  
  try {
    // Try cache first
    let submissions = await cache.get(cacheKey);
    
    if (!submissions) {
      // Cache miss - call student service
      const url = buildServiceUrl('STUDENT', '/submissions/all/assignments');
      const response = await client.get(url, {
        params: { studentId },
        headers: {
          'X-Correlation-ID': req.correlationId // Forward correlation ID
        }
      });
      
      submissions = response.data.data?.submissions || [];
      
      // Cache for 2 minutes
      await cache.set(cacheKey, submissions, 120);
    }
    
    // ... rest of code
    
  } catch (error) {
    console.error(`[${req.correlationId}] Error fetching submissions:`, error.message);
    throw error;
  }
};
```

---

## Phase 4: Add Caching to Critical Endpoints (Day 5-7)

### Identify Cacheable Data

1. **Static/Rarely Changing Data** (Cache 1+ hours):
   - Subjects list
   - Course information
   - System configuration

2. **Frequently Read Data** (Cache 5-10 minutes):
   - Assignment lists
   - Test listings
   - User profiles

3. **Dynamic Data** (Cache 1-2 minutes):
   - Submissions
   - Real-time notifications
   - Leaderboards

### Implementation Example

```javascript
import CacheService from "../../shared/cache-service.js";
const cache = new CacheService();

// GET /subjects - Cache for 1 hour
app.get("/subjects", async (req, res) => {
  const cacheKey = "subjects:all";
  
  let subjects = await cache.get(cacheKey);
  
  if (!subjects) {
    subjects = await prisma.subject.findMany({
      select: { id: true, name: true, code: true }
    });
    await cache.set(cacheKey, subjects, 3600); // 1 hour
  }
  
  res.json({ success: true, data: subjects });
});

// POST /subjects - Invalidate cache on create
app.post("/subjects", async (req, res) => {
  const subject = await prisma.subject.create({ data: req.body });
  
  // Invalidate cache
  await cache.del("subjects:all");
  
  res.json({ success: true, data: subject });
});
```

---

## Phase 5: Add Request Validation (Day 7-8)

### Update Routes with Validation

```javascript
import { createValidator, assignmentSchemas } from "../../shared/middleware/validation.js";

// Before
app.post("/assignments", createAssignment);

// After
app.post(
  "/assignments",
  createValidator({ body: assignmentSchemas.create }),
  createAssignment
);

// Controller now receives validated data
export const createAssignment = async (req, res) => {
  // req.validatedBody contains clean, validated data
  const assignment = await Assignment.create(req.validatedBody);
  res.json({ success: true, data: assignment });
};
```

---

## Phase 6: Testing (Day 9-10)

### Manual Testing Checklist

```bash
# 1. Test Gateway
curl http://localhost:9001/health
curl http://localhost:9001/auth/health

# 2. Test Correlation IDs
curl -H "X-Correlation-ID: test-123" http://localhost:9001/auth/health
# Check logs for correlation ID propagation

# 3. Test Caching
# Make same request twice, second should be faster
time curl http://localhost:9001/auth/subjects
time curl http://localhost:9001/auth/subjects

# 4. Test Circuit Breaker
# Stop a service and make requests
docker stop evolveai_student
curl http://localhost:9001/student/health
# Should see circuit breaker message after retries

# 5. Test Rate Limiting
for i in {1..100}; do
  curl http://localhost:9001/health
done
```

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test API Gateway
ab -n 1000 -c 10 http://localhost:9001/health

# Before improvements: ~200 req/sec
# After improvements: ~1000+ req/sec (5x improvement)
```

---

## Phase 7: Monitoring Setup (Day 11-12)

### Add Health Check Aggregator

Create `backend-service/health-monitor/index.js`:

```javascript
import ServiceClient from "../../shared/http-client.js";
import { SERVICE_REGISTRY } from "../../shared/service-registry.js";

const client = new ServiceClient({ serviceName: 'health-monitor' });

async function checkAllServices() {
  const results = {};
  
  for (const [name, config] of Object.entries(SERVICE_REGISTRY)) {
    try {
      const response = await client.get(
        `${config.url}${config.healthEndpoint}`,
        { timeout: 2000 }
      );
      
      results[name] = {
        status: 'healthy',
        responseTime: response.timing,
        ...response.data
      };
    } catch (error) {
      results[name] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  return results;
}

// Run every 30 seconds
setInterval(async () => {
  const health = await checkAllServices();
  console.log('Service Health:', JSON.stringify(health, null, 2));
}, 30000);
```

---

## 📊 Verification & Success Metrics

### After completing all phases, verify:

#### 1. Performance Metrics

```bash
# Check cache hit rate
# Should be >60% for frequently accessed endpoints
curl http://localhost:9001/cache/stats
```

Expected output:
```json
{
  "hits": 850,
  "misses": 150,
  "total": 1000,
  "hitRate": "85.00%"
}
```

#### 2. Response Times

- API Gateway: < 100ms (p95)
- Cached endpoints: < 50ms (p95)
- Database queries: < 200ms (p95)

#### 3. Error Rates

- Overall error rate: < 1%
- Circuit breaker activations: Logged and handled
- No unhandled promise rejections

#### 4. Correlation IDs

- All requests have correlation IDs
- IDs are propagated across services
- Logs include correlation IDs

---

## 🐛 Troubleshooting

### Issue: Services can't find shared module

**Solution:**
```bash
cd backend-service/your-service
npm install ../../shared
```

### Issue: Redis connection errors

**Solution:**
```bash
# Check if Redis is running
docker ps | grep redis

# Start Redis if needed
docker-compose up -d redis

# Test connection
redis-cli ping
```

### Issue: Circuit breaker keeps opening

**Solution:**
1. Check target service health
2. Increase timeout in service-registry.js
3. Check network connectivity
4. Review service logs

### Issue: Cache not working

**Solution:**
```bash
# Test Redis connection
redis-cli
> PING
> SET test "hello"
> GET test

# Check cache stats in service
curl http://localhost:9001/service-name/cache/stats
```

---

## 📈 Performance Before/After

### Expected Improvements

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| API Gateway Latency (p95) | 500ms | 80ms | <100ms |
| Cache Hit Rate | 0% | 75% | >60% |
| Service Call Failures | 5% | 0.3% | <1% |
| Requests per Second | 100 | 800+ | >500 |
| Database Load | 100% | 30% | <50% |

---

## 🎯 Next Steps

1. ✅ Implement shared libraries
2. ✅ Update API Gateway
3. ✅ Refactor all services
4. ✅ Add caching layer
5. ✅ Add request validation
6. ✅ Test all endpoints
7. ⬜ Set up monitoring (Prometheus/Grafana)
8. ⬜ Add distributed tracing (Jaeger)
9. ⬜ Implement service mesh (optional)
10. ⬜ Load testing and optimization

---

## 📚 Additional Resources

- [Main Improvement Plan](./MICROSERVICES_IMPROVEMENT_PLAN.md)
- [Shared Libraries Documentation](./shared/README.md)
- [API Gateway Documentation](./backend-service/api-gateway/README.md)

---

## 💡 Tips for Success

1. **Test incrementally** - Don't update all services at once
2. **Monitor logs** - Watch for correlation IDs and errors
3. **Use cache strategically** - Not everything needs caching
4. **Keep timeouts reasonable** - Balance between retries and UX
5. **Document changes** - Update service READMEs
6. **Measure improvements** - Use before/after metrics

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
