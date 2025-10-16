# Auth Service V2 - Quick Test Guide 🧪

## Prerequisites Check
```bash
# 1. Check Redis is running
docker ps | grep redis
# Should show: evolve_redis running on port 6379

# 2. Check PostgreSQL is running
docker ps | grep postgres
# Should show: evolve_postgres running on port 5433

# 3. Check auth service dependencies
cd backend-service/auth-service
pnpm list bcrypt joi redis
```

---

## Start Auth Service

```bash
cd backend-service/auth-service
pnpm dev
```

Expected output:
```
🚀 Auth Service running on port 9001
Redis: Connected successfully
Redis: Ready to accept commands
```

---

## Test V2 Endpoints

### 1. Health Check ✅
```bash
curl http://localhost:9001/health
```

Expected:
```json
{
  "status": "ok"
}
```

---

### 2. Admin Registration ✅
```bash
curl -X POST http://localhost:9001/v2/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Admin V2",
    "email": "adminv2@test.com",
    "password": "Admin1234!",
    "role": "admin"
  }'
```

Expected response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Admin registered successfully",
  "trackingId": "1705315200000-abc123-def456",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "data": {
    "id": "uuid-here",
    "name": "Test Admin V2",
    "email": "adminv2@test.com",
    "role": "admin",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 245
  }
}
```

**Check Response**:
- ✅ Has `trackingId` field
- ✅ Has `timestamp` field
- ✅ Has `metadata` with `version: "v2"`
- ✅ Has `executionTime` in metadata
- ✅ Password not returned in response

---

### 3. Admin Login ✅
```bash
curl -X POST http://localhost:9001/v2/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "adminv2@test.com",
    "password": "Admin1234!"
  }'
```

Expected response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin": {
      "id": "uuid-here",
      "name": "Test Admin V2",
      "email": "adminv2@test.com",
      "role": "admin"
    },
    "expiresIn": "24h"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 156,
    "tokenType": "Bearer"
  }
}
```

**Save the token** for next requests:
```bash
TOKEN="your-token-here"
```

---

### 4. Get Admin Profile (First Request - No Cache) ✅
```bash
curl -X GET http://localhost:9001/v2/admin/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "...",
    "name": "Test Admin V2",
    "email": "adminv2@test.com",
    "role": "admin",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "metadata": {
    "version": "v2",
    "executionTime": 45,
    "cached": false
  }
}
```

**Check**:
- ✅ `executionTime` around 40-80ms (database query)
- ✅ `cached: false`

---

### 5. Get Admin Profile (Second Request - Cached) ✅
```bash
curl -X GET http://localhost:9001/v2/admin/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "metadata": {
    "version": "v2",
    "executionTime": 8,
    "cached": true
  }
}
```

**Check**:
- ✅ `executionTime` around 5-15ms (Redis lookup)
- ✅ `cached: true`
- ✅ **80-90% faster** than first request!

---

### 6. Create Teacher ✅
```bash
curl -X POST http://localhost:9001/v2/teacher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe Teacher",
    "email": "teacher@test.com",
    "password": "Teacher1234!",
    "phone": "1234567890",
    "department": "Computer Science",
    "qualification": "PhD in CS",
    "experience": 5
  }'
```

Expected response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Teacher created successfully",
  "data": {
    "id": "uuid-here",
    "name": "John Doe Teacher",
    "email": "teacher@test.com",
    "phone": "1234567890",
    "department": "Computer Science",
    "qualification": "PhD in CS",
    "experience": 5,
    "createdAt": "..."
  },
  "metadata": {
    "version": "v2",
    "executionTime": 198,
    "createdBy": "admin-uuid"
  }
}
```

---

### 7. Get All Teachers (With Filters) ✅
```bash
curl -X GET "http://localhost:9001/v2/teacher?page=1&limit=10&search=john&department=CS" \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teachers retrieved successfully",
  "data": {
    "items": [
      {
        "id": "...",
        "name": "John Doe Teacher",
        "email": "teacher@test.com",
        "phone": "1234567890",
        "department": "Computer Science",
        "qualification": "PhD in CS",
        "experience": 5,
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "metadata": {
    "version": "v2",
    "executionTime": 67,
    "filters": {
      "search": "john",
      "department": "CS",
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

**Check Pagination**:
- ✅ Has `items` array
- ✅ Has `pagination` object with page, limit, total, totalPages
- ✅ Has `hasNext` and `hasPrev` flags

---

### 8. Test Validation Error ✅
```bash
curl -X POST http://localhost:9001/v2/teacher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "A",
    "email": "invalid-email",
    "password": "weak"
  }'
```

Expected response (422):
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "trackingId": "...",
  "timestamp": "...",
  "errors": [
    {
      "field": "name",
      "message": "\"name\" length must be at least 2 characters long"
    },
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter..."
    }
  ],
  "metadata": {
    "version": "v2",
    "executionTime": 5,
    "validatedProperty": "body"
  }
}
```

**Check Validation**:
- ✅ Status code 422
- ✅ `errors` array with field-specific messages
- ✅ Clear validation messages

---

### 9. Test Rate Limiting ✅

Run this command **6 times quickly**:
```bash
for i in {1..6}; do
  curl -X POST http://localhost:9001/v2/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n\n" \
    -s
done
```

Expected:
- First 5 attempts: Various responses (401 if credentials wrong)
- 6th attempt: **429 Too Many Requests**

```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many attempts. Please try again after 5 minutes",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2",
    "retryAfter": 300,
    "resetTime": "2024-01-15T10:05:00.000Z"
  }
}
```

**Check Headers**:
```bash
curl -I -X POST http://localhost:9001/v2/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'
```

Expected headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 2024-01-15T10:05:00.000Z
```

---

### 10. Create Student ✅
```bash
curl -X POST http://localhost:9001/v2/student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Jane Student",
    "email": "student@test.com",
    "password": "Student1234!",
    "phone": "9876543210",
    "enrollmentNumber": "ENR2024001",
    "dateOfBirth": "2000-01-15",
    "address": "123 Test Street"
  }'
```

Expected response (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Student created successfully",
  "data": {
    "id": "uuid-here",
    "name": "Jane Student",
    "email": "student@test.com",
    "phone": "9876543210",
    "enrollmentNumber": "ENR2024001",
    "dateOfBirth": "2000-01-15T00:00:00.000Z",
    "address": "123 Test Street",
    "createdAt": "..."
  },
  "metadata": {
    "version": "v2",
    "executionTime": 203,
    "createdBy": "admin-uuid"
  }
}
```

---

### 11. Update Teacher ✅
```bash
# Get teacher ID from previous create response
TEACHER_ID="uuid-here"

curl -X PUT http://localhost:9001/v2/teacher/$TEACHER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "experience": 6,
    "department": "Computer Science & AI"
  }'
```

Expected response (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teacher updated successfully",
  "data": {
    "id": "...",
    "name": "John Doe Teacher",
    "email": "teacher@test.com",
    "experience": 6,
    "department": "Computer Science & AI",
    "updatedAt": "..."
  },
  "metadata": {
    "version": "v2",
    "executionTime": 89,
    "updatedBy": "admin-uuid",
    "cacheInvalidated": true
  }
}
```

**Check Cache Invalidation**:
```bash
# This should now fetch from database (not cache)
curl -X GET http://localhost:9001/v2/teacher/$TEACHER_ID \
  -H "Authorization: Bearer $TOKEN"
```

Expected metadata:
```json
{
  "metadata": {
    "cached": false,
    "executionTime": 45
  }
}
```

---

## Redis Cache Verification

### Check Cache Keys
```bash
# Connect to Redis
docker exec -it evolve_redis redis-cli

# List all cache keys
KEYS *

# Output should show:
# 1) "admin:uuid-here"
# 2) "teachers:list:1:10:john:CS:createdAt:desc"
# 3) "teacher:uuid-here"
# 4) "student:uuid-here"

# Get cached value
GET "admin:uuid-here"

# Check TTL
TTL "admin:uuid-here"
# Should return remaining seconds (e.g., 3540 for 1 hour cache)

# Exit Redis CLI
exit
```

---

## Performance Comparison

### Without Cache (First Request)
```bash
# Measure time
time curl -X GET http://localhost:9001/v2/admin/profile \
  -H "Authorization: Bearer $TOKEN" \
  -s > /dev/null
```

Expected: ~0.05-0.10 seconds

### With Cache (Second Request)
```bash
# Measure time
time curl -X GET http://localhost:9001/v2/admin/profile \
  -H "Authorization: Bearer $TOKEN" \
  -s > /dev/null
```

Expected: ~0.01-0.02 seconds (80-90% faster!)

---

## Error Testing

### 1. Test Unauthorized Access ✅
```bash
curl -X GET http://localhost:9001/v2/admin/profile
```

Expected (401):
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access"
}
```

### 2. Test Invalid Token ✅
```bash
curl -X GET http://localhost:9001/v2/admin/profile \
  -H "Authorization: Bearer invalid-token"
```

Expected (401):
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access"
}
```

### 3. Test Not Found ✅
```bash
curl -X GET http://localhost:9001/v2/teacher/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer $TOKEN"
```

Expected (404):
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Teacher not found",
  "metadata": {
    "version": "v2",
    "executionTime": 23
  }
}
```

### 4. Test Conflict ✅
```bash
# Try to register admin with same email again
curl -X POST http://localhost:9001/v2/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Duplicate Admin",
    "email": "adminv2@test.com",
    "password": "Admin1234!"
  }'
```

Expected (409):
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Admin with this email already exists",
  "metadata": {
    "version": "v2",
    "executionTime": 15
  }
}
```

---

## Checklist Summary

### Feature Testing ✅
- [ ] Admin registration with tracking ID
- [ ] Admin login with JWT token
- [ ] Get profile (check cache: false on first request)
- [ ] Get profile again (check cache: true on second request)
- [ ] Create teacher with validation
- [ ] Get teachers list with pagination
- [ ] Update teacher (check cache invalidation)
- [ ] Create student with all fields
- [ ] Get student by ID with relationships
- [ ] Update student with validation

### Rate Limiting ✅
- [ ] Login endpoint (5 requests per 5 minutes)
- [ ] Registration endpoint (5 requests per hour)
- [ ] Read endpoints (100 requests per minute)
- [ ] Write endpoints (20-30 requests per minute)
- [ ] Check X-RateLimit-* headers

### Caching ✅
- [ ] Profile caching (5 minutes TTL)
- [ ] List caching (5 minutes TTL)
- [ ] Detail caching (10 minutes TTL)
- [ ] Cache invalidation on updates
- [ ] Cache keys in Redis

### Validation ✅
- [ ] Password strength validation
- [ ] Email format validation
- [ ] Phone number validation
- [ ] Required field validation
- [ ] Min/max length validation

### Error Handling ✅
- [ ] 400 Bad Request
- [ ] 401 Unauthorized
- [ ] 404 Not Found
- [ ] 409 Conflict
- [ ] 422 Validation Error
- [ ] 429 Too Many Requests

### Response Format ✅
- [ ] Has `success` boolean
- [ ] Has `statusCode` number
- [ ] Has `message` string
- [ ] Has `trackingId` string
- [ ] Has `timestamp` ISO string
- [ ] Has `data` or `errors`
- [ ] Has `metadata` object
- [ ] Metadata includes `version: "v2"`
- [ ] Metadata includes `executionTime`

---

## Logs Verification

Check logs for tracking IDs:
```bash
# View application logs
tail -f backend-service/auth-service/logs/application-*.log

# View error logs
tail -f backend-service/auth-service/logs/error-*.log

# View HTTP logs
tail -f backend-service/auth-service/logs/http-*.log
```

Look for:
- Request tracking IDs
- Execution times
- Cache hit/miss events
- Rate limit events
- Validation errors

---

## Success Criteria

### Performance ✅
- [ ] First request: 40-100ms
- [ ] Cached request: 5-15ms
- [ ] 80-90% improvement with cache

### Functionality ✅
- [ ] All CRUD operations work
- [ ] Authentication works
- [ ] Validation works
- [ ] Rate limiting works
- [ ] Caching works

### Monitoring ✅
- [ ] Tracking IDs in all responses
- [ ] Execution time in all responses
- [ ] Cache status in metadata
- [ ] Rate limit headers present

---

## Troubleshooting

### Redis Connection Failed
```bash
# Check Redis is running
docker ps | grep redis

# Check Redis port
docker port evolve_redis

# Test connection
docker exec evolve_redis redis-cli ping
# Should return: PONG
```

### Cache Not Working
```bash
# Check Redis keys
docker exec -it evolve_redis redis-cli
KEYS *

# Check service logs
tail -f backend-service/auth-service/logs/application-*.log | grep -i redis
```

### Rate Limit Not Working
```bash
# Check Redis connection
# Rate limiter uses Redis, so check Redis first

# Check rate limit logs
tail -f backend-service/auth-service/logs/application-*.log | grep -i "rate limit"
```

---

**Testing Complete!** 🎉

If all tests pass, your Auth Service V2 is working perfectly!
