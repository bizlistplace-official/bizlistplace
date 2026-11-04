import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import businessRoutes from './modules/businesses/business.routes';
import categoryRoutes from './modules/categories/category.routes';
import locationRoutes from './modules/locations/location.routes';
import reviewRoutes from './modules/reviews/review.routes';
import claimRoutes from './modules/claims/claim.routes';
import reportRoutes from './modules/reports/report.routes';
import adminRoutes from './modules/admin/admin.routes';
import contactRoutes from './modules/contact/contact.routes';
import { BusinessController } from './modules/businesses/business.controller';
import { requireAuth } from './middleware/auth';
import mongoose from 'mongoose';
import { mockRouter } from './modules/mock/mockRouter';

export const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Managed by Next.js on the frontend
  })
);

// Response compression (gzip/deflate for JSON and text payloads > 1 KB)
app.use(
  compression({
    threshold: 1024,
  })
);

// CORS configuration
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsers & Cookie parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser(config.cookie.secret));

// HTTP Request logging
if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});
app.use('/api/', limiter);

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Biz List Place API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Biz List Place API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount /api/v1 fallback router if database is offline/unreachable
app.use('/api/v1', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return mockRouter(req, res, next);
  }
  next();
});

// Mount /api/v1 API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/businesses', businessRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1', reviewRoutes);
app.use('/api/v1', claimRoutes);
app.use('/api/v1', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/contact', contactRoutes);
app.get('/api/v1/owner/businesses', requireAuth, BusinessController.getOwnerBusinesses);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use(errorHandler);
