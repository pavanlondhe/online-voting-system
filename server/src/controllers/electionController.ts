import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class ElectionController {
  /**
   * List Elections with filtering
   */
  static async getElections(req: Request, res: Response): Promise<void> {
    try {
      const { districtId, constituencyId, electionType, status, search } = req.query;

      const where: any = {};

      if (districtId) where.districtId = String(districtId);
      if (constituencyId) where.constituencyId = String(constituencyId);
      if (electionType) where.electionType = String(electionType);
      if (status) where.status = String(status);

      if (search) {
        where.OR = [
          { title: { contains: String(search) } },
          { description: { contains: String(search) } },
        ];
      }

      const elections = await prisma.election.findMany({
        where,
        orderBy: { startDate: 'desc' },
        include: {
          district: true,
          constituency: true,
          candidates: {
            include: {
              candidate: {
                include: {
                  user: { select: { fullName: true } },
                },
              },
            },
          },
          _count: {
            select: {
              participations: true,
            },
          },
        },
      });

      res.json({
        success: true,
        count: elections.length,
        data: elections,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch elections' });
    }
  }

  /**
   * Get single election details
   */
  static async getElectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const election = await prisma.election.findUnique({
        where: { id },
        include: {
          district: true,
          constituency: true,
          candidates: {
            where: { status: 'CONTESTING' },
            orderBy: { ballotOrder: 'asc' },
            include: {
              candidate: {
                include: {
                  user: { select: { fullName: true } },
                },
              },
            },
          },
          results: true,
          _count: {
            select: {
              participations: true,
            },
          },
        },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found' });
        return;
      }

      res.json({ success: true, data: election });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch election' });
    }
  }

  /**
   * Create New Demo Election (Admin only)
   */
  static async createElection(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        title,
        titleMr,
        titleHi,
        description,
        electionType,
        startDate,
        endDate,
        districtId,
        constituencyId,
        totalEligibleVoters = 10000,
      } = req.body;

      const election = await prisma.election.create({
        data: {
          title,
          titleMr: titleMr || null,
          titleHi: titleHi || null,
          description: description || null,
          electionType,
          status: 'SCHEDULED',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          districtId: districtId || null,
          constituencyId: constituencyId || null,
          createdByUserId: req.user?.userId || null,
          totalEligibleVoters: Number(totalEligibleVoters),
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        action: 'ELECTION_CREATED',
        resource: 'Election: ' + election.id,
        details: { title, electionType },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Demo election scheduled successfully.',
        data: election,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create election' });
    }
  }

  /**
   * Update Election Status (e.g. ACTIVE, PAUSED, CLOSED)
   */
  static async updateElectionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const election = await prisma.election.update({
        where: { id },
        data: { status },
      });

      await AuditService.log({
        userId: req.user?.userId,
        action: 'ELECTION_STATUS_UPDATED',
        resource: 'Election: ' + id,
        details: { newStatus: status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: `Election status updated to ${status}.`,
        data: election,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update election status' });
    }
  }

  /**
   * Get Maharashtra Districts
   */
  static async getDistricts(_req: Request, res: Response): Promise<void> {
    try {
      const districts = await prisma.district.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { constituencies: true } },
        },
      });
      res.json({ success: true, data: districts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch districts' });
    }
  }

  /**
   * Get Constituencies
   */
  static async getConstituencies(req: Request, res: Response): Promise<void> {
    try {
      const { districtId, type } = req.query;
      const where: any = {};
      if (districtId) where.districtId = String(districtId);
      if (type) where.type = String(type);

      const constituencies = await prisma.constituency.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { district: true },
      });
      res.json({ success: true, data: constituencies });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch constituencies' });
    }
  }
}
