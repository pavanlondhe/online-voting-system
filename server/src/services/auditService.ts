import { prisma } from '../prisma.js';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  resource: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
  userAgent?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export class AuditService {
  /**
   * Records a security or administrative audit log.
   * Strips any sensitive fields (passwords, OTPs, secret ballots).
   */
  static async log(params: AuditLogParams): Promise<void> {
    try {
      let serializedDetails: string | undefined = undefined;

      if (params.details) {
        if (typeof params.details === 'object') {
          // Sanitize details to guarantee privacy
          const sanitized = { ...params.details };
          delete (sanitized as any).password;
          delete (sanitized as any).passwordHash;
          delete (sanitized as any).otpCode;
          delete (sanitized as any).candidateId; // Never log candidate choice in vote events!
          delete (sanitized as any).selectedCandidate;
          serializedDetails = JSON.stringify(sanitized);
        } else {
          serializedDetails = String(params.details);
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          resource: params.resource,
          details: serializedDetails,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
          severity: params.severity || 'INFO',
        },
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }

  static async getRecentLogs(limit: number = 50, severity?: string) {
    return prisma.auditLog.findMany({
      where: severity ? { severity } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }
}
