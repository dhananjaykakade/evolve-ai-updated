
// Admin, Teacher, and Student types based on Prisma schema
export type Admin = {
  id: string;
  name: string;
  instituteName: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  password: string;
  adminId: string;
  isActive: boolean;
  createdAt: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  password: string;
  adminId: string;
  isActive: boolean;
  createdAt: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: Admin | null;
  token: string | null;
};

export type AuthAction = 
  | { type: 'LOGIN'; payload: { user: Admin; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: Admin; token: string } };
