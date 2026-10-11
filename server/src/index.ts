import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { swaggerSpec } from './swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Swagger UI and local scripts in development
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or localhost
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// General request limiter
app.use('/api', generalLimiter);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in development
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// System Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MahaVote Maharashtra Election Management Portal Backend',
    mode: 'EDUCATIONAL_DEMO',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Main API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server if not imported by test suite
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 MahaVote Server is running on port ${env.PORT}`);
    console.log(`📖 API Documentation: http://localhost:${env.PORT}/api/docs`);
    console.log(`🩺 Health Check:      http://localhost:${env.PORT}/api/health`);
    console.log(`⚠️  EDUCATIONAL DEMO: Not an official election service`);
    console.log(`=======================================================`);
  });
}

export default app;
