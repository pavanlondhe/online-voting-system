import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class CandidateController {
  /**
   * Public Candidate Directory
   */
  static async getCandidates(req: Request, res: Response): Promise<void> {
    try {
      const { constituencyId, party, search } = req.query;

      const where: any = {};
      if (constituencyId) where.constituencyId = String(constituencyId);
      if (party) where.partyAffiliation = String(party);

      if (search) {
        where.OR = [
          { user: { fullName: { contains: String(search) } } },
          { partyAffiliation: { contains: String(search) } },
          { symbolName: { contains: String(search) } },
        ];
      }

      const candidates = await prisma.candidateProfile.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          constituency: { include: { district: true } },
          electionCandidates: {
            include: {
              election: { select: { id: true, title: true, status: true } },
            },
          },
        },
      });

      res.json({ success: true, count: candidates.length, data: candidates });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch candidates' });
    }
  }

  /**
   * Get Candidate by ID
   */
  static async getCandidateById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const candidate = await prisma.candidateProfile.findUnique({
        where: { id },
        include: {
          user: { select: { fullName: true, email: true } },
          constituency: { include: { district: true } },
          electionCandidates: {
            include: {
              election: { select: { id: true, title: true, status: true, electionType: true } },
            },
          },
        },
      });

      if (!candidate) {
        res.status(404).json({ success: false, message: 'Candidate not found.' });
        return;
      }

      res.json({ success: true, data: candidate });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch candidate' });
    }
  }

  /**
   * Candidate Dashboard - Get Own Profile
   */
  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await prisma.candidateProfile.findUnique({
        where: { userId },
        include: {
          user: { select: { fullName: true, email: true, phone: true } },
          constituency: { include: { district: true } },
          nominations: {
            include: {
              election: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  electionType: true,
                  startDate: true,
                  endDate: true,
                },
              },
              reviewedBy: { select: { fullName: true } },
            },
            orderBy: { nominationDate: 'desc' },
          },
        },
      });

      if (!profile) {
        res.status(404).json({ success: false, message: 'Candidate profile not found' });
        return;
      }

      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile' });
    }
  }

  /**
   * Update Profile
   */
  static async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { manifesto, biography, education, assetsDeclaration, symbolName } = req.body;

      const profile = await prisma.candidateProfile.update({
        where: { userId },
        data: {
          manifesto,
          biography,
          education,
          assetsDeclaration,
          symbolName,
        },
      });

      res.json({ success: true, message: 'Profile updated successfully', data: profile });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
    }
  }

  /**
   * Submit Nomination to an Election
   */
  static async submitNomination(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { electionId, affidavitSummary } = req.body;

      const candidate = await prisma.candidateProfile.findUnique({
        where: { userId },
      });

      if (!candidate) {
        res.status(403).json({ success: false, message: 'Only candidates can submit nominations.' });
        return;
      }

      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }

      // Check if nomination exists
      const existing = await prisma.nomination.findUnique({
        where: {
          electionId_candidateId: {
            electionId,
            candidateId: candidate.id,
          },
        },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: `Nomination already submitted for this election. Current status: ${existing.status}.`,
        });
        return;
      }

      const nomination = await prisma.nomination.create({
        data: {
          electionId,
          candidateId: candidate.id,
          status: 'PENDING',
          affidavitSummary,
        },
        include: { election: true },
      });

      await AuditService.log({
        userId,
        action: 'NOMINATION_SUBMITTED',
        resource: 'Nomination: ' + nomination.id,
        details: { electionId, candidateId: candidate.id },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        message: 'Nomination submitted successfully and is pending review by the Returning Officer.',
        data: nomination,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to submit nomination' });
    }
  }
}
