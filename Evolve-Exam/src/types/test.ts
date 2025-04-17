
export interface TestCase {
  _id: string;
  input: string;
  expectedOutput: string;
}

export interface Question {
  _id: string;
  title: string;
  testId: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  starterCode: string;
  testCases: TestCase[];
  marks: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Test {
  _id: string;
  title: string;
  type: 'MCQ' | 'CODING';  // Updated to capital letters
  createdBy: string;
  course: string;
  scheduledAt: string;
  expiresAt: string;
  totalMarks: number;
  isPublished: boolean;
  reopenedFor: string[];
  questions: Question[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface APIResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
