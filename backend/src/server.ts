import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import connectDB from './config/database';
import studentRoutes from './routes/studentRoutes';
import adminRoutes from './routes/adminRoutes';
import eventRoutes from './routes/eventRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware (allow Google Identity popups/postMessage)
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// CORS configuration (must be BEFORE any middleware that may respond)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://nss-iiit-raichur.vercel.app', 'https://nss.iiitrc.ac.in']
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
}));
// Explicitly handle CORS preflight for all routes (place early)
app.options('*', cors());

// Rate limiting (after CORS so preflights get proper headers)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute for development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and in development
    return req.url === '/health' || process.env.NODE_ENV === 'development';
  }
});
app.use('/api/', limiter);

// Body parsing middleware with error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Skip verification for methods that don't send JSON bodies and for empty bodies
    const method = (req.method || '').toUpperCase();
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return;
    }
    if (!buf || buf.length === 0) {
      return;
    }
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      logger.error('JSON parsing error:', {
        error: e,
        url: req.url,
        method: req.method,
        body: buf.toString().substring(0, 200) + '...'
      });
      throw new Error('Invalid JSON format');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'NSS IIIT Raichur Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      logger.info(`🚀 NSS IIIT Raichur Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

export default app;