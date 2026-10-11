import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class AdminController {
  /**
   * Comprehensive Analytics Dashboard Metrics
   */
  static async getDashboardMetrics(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalVoters = await prisma.voterProfile.count();
      const totalCandidates = await prisma.candidateProfile.count();
      const activeElections = await prisma.election.count({ where: { status: 'ACTIVE' } });
      const totalElections = await prisma.election.count();
      const pendingNominations = await prisma.nomination.count({ where: { status: 'PENDING' } });
      const totalParticipations = await prisma.voteParticipation.count();

      // Recent audit logs
      const recentLogs = await prisma.auditLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { fullName: true, role: true, email: true } },
        },
      });

      // Security alerts: Warning / Critical logs
      const securityAlerts = await prisma.auditLog.findMany({
        where: { severity: { in: ['WARNING', 'CRITICAL'] } },
        take: 8,
        orderBy: { timestamp: 'desc' },
      });

      // District-wise distribution
      const districts = await prisma.district.findMany({
        include: {
          _count: {
            select: {
              voterProfiles: true,
              elections: true,
            },
          },
        },
      });

      // Election participation stats
      const electionsStats = await prisma.election.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          totalEligibleVoters: true,
          _count: {
            select: { participations: true, candidates: true },
          },
        },
      });

      res.json({
        success: true,
        data: {
          summary: {
            totalRegisteredVoters: totalVoters,
            totalApprovedCandidates: totalCandidates,
            activeElectionsCount: activeElections,
            totalElectionsCount: totalElections,
            pendingNominationsCount: pendingNominations,
            totalBallotsCast: totalParticipations,
          },
          districts: districts.map((d) => ({
            id: d.id,
            name: d.name,
            code: d.code,
            division: d.division,
            voterCount: d._count.voterProfiles,
            electionCount: d._count.elections,
          })),
          elections: electionsStats.map((e) => ({
            id: e.id,
            title: e.title,
            status: e.status,
            eligibleVoters: e.totalEligibleVoters,
            votesCast: e._count.participations,
            candidateCount: e._count.candidates,
            turnoutRate:
              e.totalEligibleVoters > 0
                ? Number(((e._count.participations / e.totalEligibleVoters) * 100).toFixed(2))
                : 0,
          })),
          recentLogs,
          securityAlerts,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin metrics' });
    }
  }

  /**
   * List Nominations for RO/Admin Review
   */
  static async getNominations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, electionId } = req.query;
      const where: any = {};
      if (status) where.status = String(status);
      if (electionId) where.electionId = String(electionId);

      const nominations = await prisma.nomination.findMany({
        where,
        orderBy: { nominationDate: 'desc' },
        include: {
          candidate: {
            include: {
              user: { select: { fullName: true, email: true, phone: true } },
              constituency: { include: { district: true } },
            },
          },
          election: {
            select: { id: true, title: true, electionType: true, status: true },
          },
          reviewedBy: {
            select: { fullName: true, role: true },
          },
        },
      });

      res.json({ success: true, count: nominations.length, data: nominations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch nominations' });
    }
  }

  /**
   * Review Nomination (Approve or Reject with mandatory reason)
   */
  static async reviewNomination(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, reviewRemarks } = req.body;
      const reviewerId = req.user?.userId;

      const nomination = await prisma.nomination.findUnique({
        where: { id },
        include: { election: true, candidate: true },
      });

      if (!nomination) {
        res.status(404).json({ success: false, message: 'Nomination not found.' });
        return;
      }

      // Update nomination
      const updated = await prisma.nomination.update({
        where: { id },
        data: {
          status,
          reviewRemarks,
          reviewedByUserId: reviewerId,
          reviewedAt: new Date(),
        },
      });

      // If approved, ensure candidate is in ElectionCandidate table
      if (status === 'APPROVED') {
        const existingCount = await prisma.electionCandidate.count({
          where: { electionId: nomination.electionId },
        });

        await prisma.electionCandidate.upsert({
          where: {
            electionId_candidateId: {
              electionId: nomination.electionId,
              candidateId: nomination.candidateId,
            },
          },
          update: { status: 'CONTESTING' },
          create: {
            electionId: nomination.electionId,
            candidateId: nomination.candidateId,
            ballotOrder: existingCount + 1,
            status: 'CONTESTING',
          },
        });
      } else if (status === 'REJECTED') {
        // Remove from election candidates if was present
        await prisma.electionCandidate.deleteMany({
          where: {
            electionId: nomination.electionId,
            candidateId: nomination.candidateId,
          },
        });
      }

      await AuditService.log({
        userId: reviewerId,
        action: `NOMINATION_${status}`,
        resource: 'Nomination: ' + id,
        details: { status, reviewRemarks },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: `Nomination application ${status.toLowerCase()} successfully.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to review nomination' });
    }
  }

  /**
   * Get User Management List
   */
  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { role, search } = req.query;
      const where: any = {};
      if (role) where.role = String(role);
      if (search) {
        where.OR = [
          { fullName: { contains: String(search) } },
          { email: { contains: String(search) } },
          { phone: { contains: String(search) } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          voterProfile: {
            select: {
              voterUid: true,
              district: { select: { name: true } },
              constituency: { select: { name: true } },
            },
          },
          candidateProfile: {
            select: {
              partyAffiliation: true,
              symbolName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, count: users.length, data: users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
    }
  }

  /**
   * Get Audit Logs
   */
  static async getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { limit = '100', severity } = req.query;
      const logs = await AuditService.getRecentLogs(Number(limit), severity ? String(severity) : undefined);
      res.json({ success: true, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch audit logs' });
    }
  }

  /**
   * Export Audit Logs as CSV
   */
  static async exportAuditLogsCsv(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 1000,
        include: {
          user: { select: { email: true, role: true } },
        },
      });

      let csv = 'Timestamp,Severity,Action,Resource,UserEmail,UserRole,IPAddress,Details\n';
      for (const log of logs) {
        const timestamp = log.timestamp.toISOString();
        const severity = log.severity;
        const action = `"${log.action.replace(/"/g, '""')}"`;
        const resource = `"${log.resource.replace(/"/g, '""')}"`;
        const userEmail = log.user?.email || 'SYSTEM';
        const userRole = log.user?.role || 'N/A';
        const ip = log.ipAddress || 'UNKNOWN';
        const details = `"${(log.details || '').replace(/"/g, '""')}"`;

        csv += `${timestamp},${severity},${action},${resource},${userEmail},${userRole},${ip},${details}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="mahavote_audit_logs.csv"');
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to export CSV' });
    }
  }
}
