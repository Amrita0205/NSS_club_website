import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, StudentUser } from '../types/auth';
import { logger } from '../utils/logger';

export const studentAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nss-iiit-raichur-secret-key-2024') as any;
      
      const studentUser: StudentUser = {
        id: decoded.id,
        rollNo: decoded.rollNo,
        email: decoded.email
      };

      req.student = studentUser;
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
  } catch (error) {
    logger.error('Error in studentAuth middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 