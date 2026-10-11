import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  console.error('[SERVER ERROR]:', err);

  // Record critical error in audit logs
  AuditService.log({
    action: 'SERVER_ERROR',
    resource: req.path,
    details: {
      message: err.message,
      method: req.method,
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    severity: 'CRITICAL',
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected internal error occurred. Please contact administrator.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}
