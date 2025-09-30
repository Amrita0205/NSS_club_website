import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';
import { AuthRequest } from '../types/auth';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-admin-token');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024') as any;

    // Get admin from database
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin || !admin.isActive) {
      res.status(401).json({
        success: false,
        message: 'Token is not valid or admin is inactive'
      });
      return;
    }

    // Add admin to request object
    req.admin = {
      id: (admin._id as mongoose.Types.ObjectId).toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions
    };

    next();
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

// Middleware to check specific permissions
export const requirePermission = (permission: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!req.admin.permissions.includes(permission) && req.admin.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};