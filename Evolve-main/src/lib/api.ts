
import { Admin, Teacher, Student } from './types';

const API_URL = 'http://localhost:9001';

// Auth API calls
export const loginAdmin = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Login failed');
    }

    const result = { user: data.admin, token: data.token };    
    return result;
  } catch (error) {
    console.error('Error during login:', error);
    throw new Error(error.message || 'Login failed');
  }
};


export const registerAdmin = async (adminData: {
  name: string;
  instituteName: string;
  email: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/auth/admin/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  const data = await response.json();
  return data.data.admin; // Accessing the actual admin object from the API response
};


// Teacher API calls
export const getTeachers = async (adminId: string) => {
  const response = await fetch(`${API_URL}/auth/admin/teachers/${adminId}`);
  return response.json();
};

export const addTeacher = async (teacher: {
  name: string;
  email: string;
  password: string;
  adminId: string;
}) => {
  const response = await fetch(`${API_URL}/auth/admin/teachers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add teacher');
  }

  return response.json();
};


export const updateTeacher = async (id: string, teacherData: Partial<Teacher>) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/teachers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      throw new Error('Failed to update teacher');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating teacher:', error);
    throw new Error(error.message || 'Failed to update teacher');
  }
};


export const deleteTeacher = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/teachers/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete teacher');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting teacher:', error);
    throw new Error(error.message || 'Failed to delete teacher');
  }
};


// Student API calls
export const getStudents = async (adminId: string) => {
  const response = await fetch(`${API_URL}/auth/admin/students/${adminId}`);
  return response.json();
};

export const addStudent = async (student: {
  name: string;
  email: string;
  adminId: string;
  course: string;
  password: string;
}) => {
  const response = await fetch(`${API_URL}/auth/admin/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(student),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add student');
  }

  return response.json();
};


export const updateStudent = async (id: string, studentData: Partial<Student>) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error('Failed to update student');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating student:', error);
    throw new Error(error.message || 'Failed to update student');
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/admin/students/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete student');
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error(error.message || 'Failed to delete student');
  }
};

export const sendCredentials = async (email: string) => {
  // Simulate sending credentials
  // In a real app, this would be an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: `Credentials sent to ${email}` });
    }, 1000);
  });
};
