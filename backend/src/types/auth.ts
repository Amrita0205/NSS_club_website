import { Request } from 'express';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'coordinator';
  permissions: string[];
}

export interface StudentUser {
  id: string;
  rollNo: string;
  email: string;
}

export interface AuthRequest extends Request {
  admin?: AdminUser;
  student?: StudentUser;
}