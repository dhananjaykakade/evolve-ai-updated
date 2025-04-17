
import axios from 'axios';
import { APIResponse, Test } from '../types/test';

const API_URL = 'http://localhost:9001';

export const getTestById = async (testId: string, token: string): Promise<APIResponse<Test>> => {
  try {
    const response = await axios.get<APIResponse<Test>>(
      `${API_URL}/student/tests/${testId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw {
        success: false,
        statusCode: error.response?.status || 500,
        message: error.response?.data?.message || "Failed to fetch test details",
        data: null
      };
    }
    throw error;
  }
};
