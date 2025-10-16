# EvolveAI Platform

## Enterprise AI-Powered Educational Assessment System

*Version 2.0 - Production-Ready Microservices Architecture*

---

## 🚀 Quick Start

### One-Command Setup

Get the entire platform running in minutes:

```bash
# Complete setup with one command
npm run setup

# Or run directly
node setup.mjs
```

That's it! The setup script will:
- ✅ Install all dependencies
- ✅ Configure all services
- ✅ Start databases (PostgreSQL, MongoDB, Redis)
- ✅ Run Prisma migrations
- ✅ Seed sample data

**For detailed setup options and troubleshooting, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

---

## Overview

EvolveAI is a comprehensive AI-powered assessment platform designed for educational institutions across all levels. The system facilitates effective test administration, assignment management, and performance evaluation through advanced AI capabilities and real-time monitoring.

## 🎯 Core Capabilities

### Administration Portal
- Secure administrator authentication and account management
- Comprehensive faculty and student record management
- Course assignment and instructor allocation
- Email notification system for credential distribution

### Faculty Interface
- Assignment creation, management, and publication
- Resource distribution and submission tracking
- Assessment design (Multiple-Choice and Coding formats)
- Question bank management with full CRUD functionality
- Examination scheduling with configurable parameters
- Automated assessment of multiple-choice examinations
- AI-powered code evaluation utilizing **Gemini AI**
- Performance analytics and real-time feedback mechanisms
- Academic integrity monitoring with suspicious activity detection

### Student Interface
- Secure authentication and personalized dashboard
- Assignment access and submission management
- Proctored examination environment with full-screen enforcement
- Real-time integrity monitoring (tab-switching, copy/paste, keyboard shortcuts)
- Integrated coding environment with containerized execution
- Progress auto-save functionality
- AI-generated performance insights and improvement suggestions

### Notification System
- WebSocket-based real-time alert infrastructure
- Comprehensive activity logging for faculty review

## 🏗️ Technical Architecture

### Microservices

| Service | Technology | Port | Description |
|---------|-----------|------|-------------|
| API Gateway | Node.js + Express | 9001 | Central routing, rate limiting, CORS |
| Auth Service | Node.js + Express + Prisma | 9001 | Authentication (routes through gateway) |
| Student Service | Node.js + Express + Mongoose | 9002 | Student profiles & enrollments |
| Teacher Service | Node.js + Express + Mongoose | 9003 | Teacher profiles & courses |
| Notification Service | Node.js + Express + WebSocket | 9004 | Real-time notifications |

### Databases

| Database | Port | Usage |
|----------|------|-------|
| PostgreSQL 16 | 5433 | User authentication & authorization |
| MongoDB 7 | 27019 | Student/teacher profiles, courses |
| Redis 7 | 6379 | Caching, session management |

### Frontend Applications

| Component         | Technology Implementation                |
|-------------------|-----------------------------------------|
| Admin Portal      | React + TypeScript (Vite)               |
| Teacher Dashboard | React + TypeScript (Vite)               |
| Student Portal    | React + TypeScript (Vite)               |
| Exam Interface    | React + TypeScript (Vite)               |
| Service Structure | Microservices Architecture              |
| Data Storage      | PostgreSQL (Authentication), MongoDB (Application Data) |
| AI Integration    | Gemini (Google Generative AI)           |
| Code Execution    | Docker Containerization                 |
| Activity Tracking | WebSocket Protocol                      |
| Asset Management  | Cloudinary                              |
| Authentication    | JWT with Redis-based OTP                |

---

## 🎥 Live Test Demos

### 📋 MCQ Test Demo
[![MCQ Test Demo](https://via.placeholder.com/800x450.png?text=MCQ+Test+Demo+▶)](https://res.cloudinary.com/dj6mlh67u/video/upload/v1745090299/mcq-test-demo_phxzj8.mp4)

---

### 💻 Coding Test Demo
[![Coding Test Demo](https://via.placeholder.com/800x450.png?text=Coding+Test+Demo+▶)](https://res.cloudinary.com/dj6mlh67u/video/upload/v1745090312/coding-test-demo_f6qc42.mp4)



## Project Structure

```
evolve-ai/  
├── Evolve-Exam/                  # Examination Portal
├── Evolve-main/                  # Administrative Dashboard
├── Evolve-student/               # Student Interface
├── Evolve-teacher/               # Faculty Interface
├── bavkend-service/                     # Backend Microservices
│   ├── auth-service/             # Authentication & Authorization (PostgreSQL/Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── index.js
│   │   └── .env    
│   ├── teacher-service/          # Faculty Operations (MongoDB)
│   ├── student-service/          # Student Data Management (MongoDB)
│   ├── ai-service/               # AI Evaluation Engine
│   └── notification-service/     # Real-time Monitoring System
├── .gitignore
├── docker-compose.yml            # Container Orchestration
├── package.json
├── pnpm-workspace.yaml
├── README.md                     # Documentation
└── tsconfig.json                 # TypeScript Configuration
```



## Installation Guide

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- pnpm package manager
- Git

### Deployment Steps

1. **Clone Repository**
   ```bash
   git clone https://github.com/dhananjaykakade/evolve-ai-updated
   cd evolve-ai
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Create appropriate `.env` files based on the template below paste the `.env` files in root folder of each backend service :

   ```
   # Database Configuration
   DATABASE_URL="postgresql://<DB_USER>:<DB_PASSWORD>@<DB_HOST>:<DB_PORT>/<DB_NAME>"

   # Security
   JWT_SECRET="[strong_jwt_secret_key]"

   # Redis Configuration
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379

   # Email Service
   EMAIL_USER="notifications@yourdomain.com"
   EMAIL_PASS="[secure_email_password]"

   # Cloudinary Integration
   CLOUDINARY_CLOUD_NAME="[cloud_name]"
   CLOUDINARY_API_KEY="[api_key]"
   CLOUDINARY_API_SECRET="[api_secret]"

   # Server Configuration
   PORT=8001

   # External API Keys
   RAPID_API_KEY="[rapid_api_key]"
   GEMINI_API_KEY="[gemini_api_key]"
   ```

4. **Launch Services**
   ```bash
   docker-compose up -d
   ```

5. **Initialize Database**
   ```bash
   cd backend-service/auth-service
   pnpm prisma migrate dev --name init
   pnpm prisma generate
   pnpm dev
   ```

## Operational Services

Upon successful deployment, the following services will be operational:
- Authentication Service (PostgreSQL/Prisma)
- Student Data Service (MongoDB)
- Faculty Management Service (MongoDB)
- Notification Service (WebSocket/MongoDB)
- AI Evaluation Service
- Code Execution Engine (Docker-in-Docker)

## Development Team

- Dhananjay Kakade
- Siddhi Bodake
- Prathamesh Ghatmal
- Saad Sayyed

---

© 2025 EvolveAI. All rights reserved.
