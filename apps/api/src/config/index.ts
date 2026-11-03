import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or apps/api
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  clientUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizpockethub',
    useMemoryDb: process.env.USE_MEMORY_DB !== 'false', // Default to memory-db if local mongo isn't available
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'bizpockethub-super-secret-jwt-key-min-32-chars-long',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'bizpockethub-super-secret-cookie-salt-min-32',
    name: 'bizpocket_session',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
    max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  },
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpSecure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    smtpUser: process.env.SMTP_USER || 'bizlistplaceofficial@gmail.com',
    smtpPass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Biz List Place',
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'bizlistplaceofficial@gmail.com',
    adminEmail: process.env.ADMIN_EMAIL || 'bizlistplaceofficial@gmail.com',
  },
};
