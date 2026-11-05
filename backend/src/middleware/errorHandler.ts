import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected server error occurred';

  // Handle MongoDB Duplicate Key (E11000)
  if (err.code === 11000 && err.keyValue) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `A record with ${field} '${value}' already exists.`;
  }

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource identifier format.';
  }

  if (!config.isProduction) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
};
