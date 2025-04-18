
# EvolveAI Admin Hub

EvolveAI is a comprehensive educational platform that serves as a central hub for three portals: Teacher Portal, Student Portal, and Admin Portal. This project implements the Admin Portal with user authentication and management capabilities.

## Features

- **User Authentication**
  - Admin Login & Registration
  - Protected Routes
  - Session Management with localStorage

- **Admin Dashboard**
  - Overview statistics
  - Recent teacher and student activity

- **Teacher Management**
  - Add, edit, and delete teachers
  - Enable/disable teacher accounts
  - Send login credentials

- **Student Management**
  - Add, edit, and delete students
  - Enable/disable student accounts
  - Send login credentials

## Tech Stack

- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- JSON Server for mock API
- Zod for form validation
- Context API for state management

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the mock API server:
   ```
   npm run start-api
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Mock Credentials

You can use these credentials to test the application:

- **Admin**
  - Email: admin@example.com
  - Password: password123

## Project Structure

- `/src/components` - Reusable UI components
- `/src/context` - Context providers for auth
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and API calls
- `/src/pages` - Page components for routing
- `/src/data` - Mock data for JSON Server

## API Endpoints

The mock API runs on `http://localhost:3001` with the following endpoints:

- `GET /admins` - Get all admins
- `POST /admins` - Register a new admin
- `GET /teachers` - Get all teachers
- `POST /teachers` - Add a new teacher
- `PATCH /teachers/:id` - Update a teacher
- `DELETE /teachers/:id` - Delete a teacher
- `GET /students` - Get all students
- `POST /students` - Add a new student
- `PATCH /students/:id` - Update a student
- `DELETE /students/:id` - Delete a student

## Future Enhancements

- Teacher and Student portals
- Course management
- Assignment creation and grading
- Analytics dashboard
- Real authentication with JWT
