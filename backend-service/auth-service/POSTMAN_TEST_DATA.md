# Auth Service V2 - Postman Test Data 🧪

## Base URL
```
http://localhost:9001
```

---

## 📋 Table of Contents
1. [Admin Endpoints](#admin-endpoints)
2. [Teacher Endpoints](#teacher-endpoints)
3. [Student Endpoints](#student-endpoints)
4. [Error Testing](#error-testing)
5. [Rate Limiting Tests](#rate-limiting-tests)
6. [Postman Collection JSON](#postman-collection-json)

---

## Admin Endpoints

### 1. Admin Registration ✅

**Endpoint**: `POST /v2/admin/register`

**Test Data - Valid Registration**:
```json
{
  "name": "John Admin",
  "email": "john.admin@evolve.com",
  "password": "Admin@123",
  "role": "admin"
}
```

**Alternative Test Cases**:

```json
// Superadmin
{
  "name": "Super Admin",
  "email": "super.admin@evolve.com",
  "password": "SuperAdmin@2024",
  "role": "superadmin"
}
```

```json
// Another Admin
{
  "name": "Jane Admin",
  "email": "jane.admin@evolve.com",
  "password": "JaneAdmin@456",
  "role": "admin"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Admin registered successfully",
  "trackingId": "1729080000000-abc123-def456",
  "timestamp": "2025-10-16T10:00:00.000Z",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Admin",
    "email": "john.admin@evolve.com",
    "role": "admin",
    "createdAt": "2025-10-16T10:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 245
  }
}
```

---

### 2. Admin Login ✅

**Endpoint**: `POST /v2/admin/login`

**Test Data**:
```json
{
  "email": "john.admin@evolve.com",
  "password": "Admin@123"
}
```

**Alternative Test Cases**:
```json
// Superadmin login
{
  "email": "super.admin@evolve.com",
  "password": "SuperAdmin@2024"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "trackingId": "1729080000000-xyz789",
  "timestamp": "2025-10-16T10:05:00.000Z",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obi5hZG1pbkBldm9sdmUuY29tIiwicm9sZSI6ImFkbWluIiwidHlwZSI6ImFkbWluIiwiaWF0IjoxNzI5MDgwMDAwLCJleHAiOjE3MjkxNjY0MDB9.signature",
    "admin": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Admin",
      "email": "john.admin@evolve.com",
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

**⚠️ SAVE THE TOKEN**: Copy the `token` value for use in subsequent requests!

---

### 3. Get Admin Profile ✅

**Endpoint**: `GET /v2/admin/profile`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

**Expected Response** (200 - First Request - Not Cached):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Admin",
    "email": "john.admin@evolve.com",
    "role": "admin",
    "createdAt": "2025-10-16T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 45,
    "cached": false
  }
}
```

**Expected Response** (200 - Second Request - Cached):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully",
  "data": { ... },
  "metadata": {
    "version": "v2",
    "executionTime": 8,
    "cached": true,
    "cacheTtl": 295
  }
}
```

**✨ Notice**: `executionTime` drops from ~45ms to ~8ms (80-90% faster!)

---

### 4. Update Admin Profile ✅

**Endpoint**: `PUT /v2/admin/profile`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Test Data - Update Name**:
```json
{
  "name": "John Updated Admin"
}
```

**Test Data - Update Email**:
```json
{
  "email": "john.updated@evolve.com"
}
```

**Test Data - Update Password**:
```json
{
  "currentPassword": "Admin@123",
  "password": "NewAdmin@456"
}
```

**Test Data - Update Multiple Fields**:
```json
{
  "name": "John Modified Admin",
  "email": "john.modified@evolve.com"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Updated Admin",
    "email": "john.admin@evolve.com",
    "role": "admin",
    "updatedAt": "2025-10-16T10:15:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 89,
    "cacheInvalidated": true
  }
}
```

---

### 5. Get All Admins ✅

**Endpoint**: `GET /v2/admin/all?page=1&limit=10`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters**:
- `page`: 1 (default)
- `limit`: 10 (default)
- `search`: (optional) "john"
- `sortBy`: (optional) "name" | "email" | "createdAt"
- `sortOrder`: (optional) "asc" | "desc"

**Example URLs**:
```
GET /v2/admin/all
GET /v2/admin/all?page=1&limit=5
GET /v2/admin/all?search=john
GET /v2/admin/all?sortBy=name&sortOrder=asc
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Admins retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Admin",
        "email": "john.admin@evolve.com",
        "role": "admin",
        "createdAt": "2025-10-16T10:00:00.000Z"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Jane Admin",
        "email": "jane.admin@evolve.com",
        "role": "admin",
        "createdAt": "2025-10-16T10:10:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "metadata": {
    "version": "v2",
    "executionTime": 67,
    "filters": {
      "search": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

---

## Teacher Endpoints

### 1. Teacher Login ✅

**Endpoint**: `POST /v2/teacher/login`

**Test Data**:
```json
{
  "email": "sarah.teacher@evolve.com",
  "password": "Teacher@123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "teacher": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Sarah Teacher",
      "email": "sarah.teacher@evolve.com",
      "department": "Computer Science"
    },
    "expiresIn": "24h"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 142,
    "tokenType": "Bearer"
  }
}
```

---

### 2. Create Teacher ✅

**Endpoint**: `POST /v2/teacher`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Test Data 1 - Computer Science Teacher**:
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.teacher@evolve.com",
  "password": "Teacher@123",
  "phone": "1234567890",
  "department": "Computer Science",
  "qualification": "PhD in Computer Science",
  "experience": 8
}
```

**Test Data 2 - Mathematics Teacher**:
```json
{
  "name": "Michael Brown",
  "email": "michael.teacher@evolve.com",
  "password": "MathTeach@456",
  "phone": "2345678901",
  "department": "Mathematics",
  "qualification": "M.Sc. Mathematics",
  "experience": 5
}
```

**Test Data 3 - Physics Teacher**:
```json
{
  "name": "Emily Davis",
  "email": "emily.teacher@evolve.com",
  "password": "Physics@789",
  "phone": "3456789012",
  "department": "Physics",
  "qualification": "PhD in Physics",
  "experience": 12
}
```

**Test Data 4 - Minimal Fields**:
```json
{
  "name": "Robert Wilson",
  "email": "robert.teacher@evolve.com",
  "password": "Teacher@2024"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Teacher created successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Johnson",
    "email": "sarah.teacher@evolve.com",
    "phone": "1234567890",
    "department": "Computer Science",
    "qualification": "PhD in Computer Science",
    "experience": 8,
    "createdAt": "2025-10-16T11:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 198,
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### 3. Get All Teachers ✅

**Endpoint**: `GET /v2/teacher?page=1&limit=10`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Query Parameters**:
- `page`: 1
- `limit`: 10
- `search`: (optional) "sarah"
- `department`: (optional) "Computer Science"
- `sortBy`: (optional) "name" | "email" | "createdAt" | "experience"
- `sortOrder`: (optional) "asc" | "desc"

**Example URLs**:
```
GET /v2/teacher
GET /v2/teacher?page=1&limit=5
GET /v2/teacher?search=sarah
GET /v2/teacher?department=Computer Science
GET /v2/teacher?department=CS&sortBy=experience&sortOrder=desc
GET /v2/teacher?search=johnson&department=Computer
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teachers retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "items": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "name": "Sarah Johnson",
        "email": "sarah.teacher@evolve.com",
        "phone": "1234567890",
        "department": "Computer Science",
        "qualification": "PhD in Computer Science",
        "experience": 8,
        "createdAt": "2025-10-16T11:00:00.000Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440003",
        "name": "Emily Davis",
        "email": "emily.teacher@evolve.com",
        "phone": "3456789012",
        "department": "Physics",
        "qualification": "PhD in Physics",
        "experience": 12,
        "createdAt": "2025-10-16T11:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "metadata": {
    "version": "v2",
    "executionTime": 67,
    "filters": {
      "search": null,
      "department": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

---

### 4. Get Teacher by ID ✅

**Endpoint**: `GET /v2/teacher/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Example**:
```
GET /v2/teacher/770e8400-e29b-41d4-a716-446655440002
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teacher retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Johnson",
    "email": "sarah.teacher@evolve.com",
    "phone": "1234567890",
    "department": "Computer Science",
    "qualification": "PhD in Computer Science",
    "experience": 8,
    "createdAt": "2025-10-16T11:00:00.000Z",
    "updatedAt": "2025-10-16T11:00:00.000Z",
    "courses": [
      {
        "id": "course-uuid-1",
        "subject": {
          "id": "subject-uuid-1",
          "name": "Data Structures",
          "code": "CS201"
        }
      }
    ]
  },
  "metadata": {
    "version": "v2",
    "executionTime": 45,
    "cached": false
  }
}
```

---

### 5. Update Teacher ✅

**Endpoint**: `PUT /v2/teacher/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Test Data - Update Experience**:
```json
{
  "experience": 10
}
```

**Test Data - Update Department**:
```json
{
  "department": "Computer Science & AI"
}
```

**Test Data - Update Multiple Fields**:
```json
{
  "phone": "9999999999",
  "qualification": "PhD in AI & Machine Learning",
  "experience": 10
}
```

**Test Data - Update Password**:
```json
{
  "password": "NewTeacher@2024"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teacher updated successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "name": "Sarah Johnson",
    "email": "sarah.teacher@evolve.com",
    "phone": "9999999999",
    "department": "Computer Science & AI",
    "qualification": "PhD in AI & Machine Learning",
    "experience": 10,
    "updatedAt": "2025-10-16T12:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 89,
    "updatedBy": "550e8400-e29b-41d4-a716-446655440000",
    "cacheInvalidated": true
  }
}
```

---

### 6. Delete Teacher ✅

**Endpoint**: `DELETE /v2/teacher/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Example**:
```
DELETE /v2/teacher/770e8400-e29b-41d4-a716-446655440002
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Teacher deleted successfully",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2",
    "executionTime": 45,
    "deletedBy": "550e8400-e29b-41d4-a716-446655440000",
    "cacheInvalidated": true
  }
}
```

---

## Student Endpoints

### 1. Student Login ✅

**Endpoint**: `POST /v2/student/login`

**Test Data**:
```json
{
  "email": "alice.student@evolve.com",
  "password": "Student@123"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "student": {
      "id": "880e8400-e29b-41d4-a716-446655440004",
      "name": "Alice Smith",
      "email": "alice.student@evolve.com",
      "enrollmentNumber": "ENR2024001"
    },
    "expiresIn": "24h"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 138,
    "tokenType": "Bearer"
  }
}
```

---

### 2. Create Student ✅

**Endpoint**: `POST /v2/student`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Test Data 1 - Complete Student**:
```json
{
  "name": "Alice Smith",
  "email": "alice.student@evolve.com",
  "password": "Student@123",
  "phone": "4567890123",
  "enrollmentNumber": "ENR2024001",
  "dateOfBirth": "2002-05-15",
  "address": "123 Main Street, City, State 12345"
}
```

**Test Data 2 - Another Student**:
```json
{
  "name": "Bob Johnson",
  "email": "bob.student@evolve.com",
  "password": "BobStud@456",
  "phone": "5678901234",
  "enrollmentNumber": "ENR2024002",
  "dateOfBirth": "2001-08-20",
  "address": "456 Oak Avenue, Town, State 67890"
}
```

**Test Data 3 - Third Student**:
```json
{
  "name": "Charlie Davis",
  "email": "charlie.student@evolve.com",
  "password": "Charlie@789",
  "phone": "6789012345",
  "enrollmentNumber": "ENR2024003",
  "dateOfBirth": "2003-01-10",
  "address": "789 Pine Road, Village, State 11223"
}
```

**Test Data 4 - Minimal Fields**:
```json
{
  "name": "Diana Wilson",
  "email": "diana.student@evolve.com",
  "password": "Diana@2024"
}
```

**Expected Response** (201):
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Student created successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Alice Smith",
    "email": "alice.student@evolve.com",
    "phone": "4567890123",
    "enrollmentNumber": "ENR2024001",
    "dateOfBirth": "2002-05-15T00:00:00.000Z",
    "address": "123 Main Street, City, State 12345",
    "createdAt": "2025-10-16T13:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 203,
    "createdBy": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

### 3. Get All Students ✅

**Endpoint**: `GET /v2/student?page=1&limit=10`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Query Parameters**:
- `page`: 1
- `limit`: 10
- `search`: (optional) "alice"
- `enrollmentNumber`: (optional) "ENR2024"
- `sortBy`: (optional) "name" | "email" | "enrollmentNumber" | "createdAt"
- `sortOrder`: (optional) "asc" | "desc"

**Example URLs**:
```
GET /v2/student
GET /v2/student?page=1&limit=5
GET /v2/student?search=alice
GET /v2/student?enrollmentNumber=ENR2024001
GET /v2/student?search=smith&sortBy=name&sortOrder=asc
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Students retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "items": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440004",
        "name": "Alice Smith",
        "email": "alice.student@evolve.com",
        "phone": "4567890123",
        "enrollmentNumber": "ENR2024001",
        "dateOfBirth": "2002-05-15T00:00:00.000Z",
        "createdAt": "2025-10-16T13:00:00.000Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440005",
        "name": "Bob Johnson",
        "email": "bob.student@evolve.com",
        "phone": "5678901234",
        "enrollmentNumber": "ENR2024002",
        "dateOfBirth": "2001-08-20T00:00:00.000Z",
        "createdAt": "2025-10-16T13:05:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "metadata": {
    "version": "v2",
    "executionTime": 72,
    "filters": {
      "search": null,
      "enrollmentNumber": null,
      "sortBy": "createdAt",
      "sortOrder": "desc"
    }
  }
}
```

---

### 4. Get Student by ID ✅

**Endpoint**: `GET /v2/student/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Example**:
```
GET /v2/student/880e8400-e29b-41d4-a716-446655440004
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student retrieved successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Alice Smith",
    "email": "alice.student@evolve.com",
    "phone": "4567890123",
    "enrollmentNumber": "ENR2024001",
    "dateOfBirth": "2002-05-15T00:00:00.000Z",
    "address": "123 Main Street, City, State 12345",
    "createdAt": "2025-10-16T13:00:00.000Z",
    "updatedAt": "2025-10-16T13:00:00.000Z",
    "enrollments": [
      {
        "id": "enrollment-uuid-1",
        "enrolledAt": "2025-10-16T13:30:00.000Z",
        "course": {
          "id": "course-uuid-1",
          "subject": {
            "id": "subject-uuid-1",
            "name": "Data Structures",
            "code": "CS201"
          },
          "teacher": {
            "id": "770e8400-e29b-41d4-a716-446655440002",
            "name": "Sarah Johnson",
            "department": "Computer Science"
          }
        }
      }
    ]
  },
  "metadata": {
    "version": "v2",
    "executionTime": 52,
    "cached": false
  }
}
```

---

### 5. Update Student ✅

**Endpoint**: `PUT /v2/student/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Test Data - Update Phone**:
```json
{
  "phone": "9876543210"
}
```

**Test Data - Update Address**:
```json
{
  "address": "999 New Street, New City, State 99999"
}
```

**Test Data - Update Multiple Fields**:
```json
{
  "phone": "8888888888",
  "address": "888 Updated Avenue, Updated Town, State 88888"
}
```

**Test Data - Update Password**:
```json
{
  "password": "NewStudent@2024"
}
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student updated successfully",
  "trackingId": "...",
  "timestamp": "...",
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440004",
    "name": "Alice Smith",
    "email": "alice.student@evolve.com",
    "phone": "9876543210",
    "enrollmentNumber": "ENR2024001",
    "dateOfBirth": "2002-05-15T00:00:00.000Z",
    "address": "999 New Street, New City, State 99999",
    "updatedAt": "2025-10-16T14:00:00.000Z"
  },
  "metadata": {
    "version": "v2",
    "executionTime": 95,
    "updatedBy": "550e8400-e29b-41d4-a716-446655440000",
    "cacheInvalidated": true
  }
}
```

---

### 6. Delete Student ✅

**Endpoint**: `DELETE /v2/student/:id`

**Headers**:
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Example**:
```
DELETE /v2/student/880e8400-e29b-41d4-a716-446655440004
```

**Expected Response** (200):
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student deleted successfully",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2",
    "executionTime": 48,
    "deletedBy": "550e8400-e29b-41d4-a716-446655440000",
    "cacheInvalidated": true
  }
}
```

---

## Error Testing

### 1. Validation Errors (422)

**Invalid Email**:
```json
{
  "name": "Test User",
  "email": "invalid-email",
  "password": "Test@123"
}
```

**Weak Password**:
```json
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "weak"
}
```

**Missing Required Fields**:
```json
{
  "name": "Test User"
}
```

**Expected Response**:
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "trackingId": "...",
  "timestamp": "...",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    },
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    }
  ],
  "metadata": {
    "version": "v2",
    "executionTime": 5,
    "validatedProperty": "body"
  }
}
```

---

### 2. Unauthorized (401)

**No Token**:
```
GET /v2/admin/profile
(without Authorization header)
```

**Invalid Token**:
```
Authorization: Bearer invalid-token-123
```

**Expected Response**:
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized access",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2"
  }
}
```

---

### 3. Not Found (404)

**Non-existent ID**:
```
GET /v2/teacher/00000000-0000-0000-0000-000000000000
```

**Expected Response**:
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Teacher not found",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2",
    "executionTime": 23
  }
}
```

---

### 4. Conflict (409)

**Duplicate Email (Register again with same email)**:
```json
{
  "name": "Duplicate User",
  "email": "john.admin@evolve.com",
  "password": "Test@123"
}
```

**Expected Response**:
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Admin with this email already exists",
  "trackingId": "...",
  "timestamp": "...",
  "metadata": {
    "version": "v2",
    "executionTime": 15
  }
}
```

---

## Rate Limiting Tests

### Test Login Rate Limit (5 per 5 minutes)

**Make 6 rapid requests**:

```json
// Request 1-5: Should get 401 (Unauthorized)
POST /v2/admin/login
{
  "email": "wrong@email.com",
  "password": "wrongpassword"
}

// Request 6: Should get 429 (Too Many Requests)
```

**Expected Response (6th request)**:
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
    "resetTime": "2025-10-16T10:10:00.000Z"
  }
}
```

**Check Headers**:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-16T10:10:00.000Z
Retry-After: 300
```

---

## 🎯 Postman Tips

### Environment Variables

Create a Postman environment with:

```json
{
  "base_url": "http://localhost:9001",
  "admin_token": "",
  "teacher_token": "",
  "student_token": "",
  "teacher_id": "",
  "student_id": ""
}
```

### Save Token After Login

Add this to the **Tests** tab in login requests:

```javascript
// Save token to environment
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("admin_token", response.data.token);
        console.log("Token saved:", response.data.token);
    }
}
```

### Use Environment Variables

In requests, use:
```
URL: {{base_url}}/v2/admin/profile
Authorization: Bearer {{admin_token}}
```

---

## 📦 Complete Test Sequence

1. ✅ Admin Registration
2. ✅ Admin Login (Save token)
3. ✅ Get Admin Profile (Check cache: false)
4. ✅ Get Admin Profile again (Check cache: true)
5. ✅ Create Teacher 1
6. ✅ Create Teacher 2
7. ✅ Get All Teachers
8. ✅ Get Teacher by ID
9. ✅ Update Teacher
10. ✅ Create Student 1
11. ✅ Create Student 2
12. ✅ Get All Students
13. ✅ Get Student by ID
14. ✅ Update Student
15. ✅ Test validation errors
16. ✅ Test rate limiting
17. ✅ Test unauthorized access
18. ✅ Delete Teacher
19. ✅ Delete Student

---

**Total Test Cases**: 30+ endpoints with variations  
**Ready to import into Postman!** 🚀
