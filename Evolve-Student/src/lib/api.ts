// lib/api.ts
import axios from 'axios';

export const getStudentWithAdmin = async (id: string) => {
  const response = await axios.get(`http://localhost:9001/auth/students/${id}`);
  return response.data.data; // contains { student, admin }
};
