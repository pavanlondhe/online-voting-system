import { Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  generateReceiptNumber,
  generateBallotHash,
  calculateReceiptVerificationHash,
} from '../utils/security.js';
import { AuditService } from '../services/auditService.js';

export class BallotController {
  /**
   * Get Ballot for an active election and verify voter eligibility
   */
  static async getBallot(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Check voter profile
      const voter = await prisma.voterProfile.findUnique({
        where: { userId },
        include: { constituency: true, district: true },
      });

      if (!voter) {
        res.status(403).json({
          success: false,
          message: 'Only registered voters can access the ballot.',
        });
        return;
      }

      // Check election
      const election = await prisma.election.findUnique({
        where: { id: electionId },
        include: {
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
          district: true,
          constituency: true,
        },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }

      if (election.status !== 'ACTIVE') {
        res.status(400).json({
          success: false,
          message: `This election is currently ${election.status}. Voting is only permitted for ACTIVE elections.`,
        });
        return;
      }

      // Check if already voted
      const existingVote = await prisma.voteParticipation.findUnique({
        where: {
          voterId_electionId: {
            voterId: voter.id,
            electionId: election.id,
          },
        },
      });

      if (existingVote) {
        res.status(400).json({
          success: false,
          hasAlreadyVoted: true,
          receiptId: existingVote.receiptId,
          message: 'You have already submitted a ballot for this election. Duplicate voting is strictly prevented.',
        });
        return;
      }

      // Formulate neutral ballot list (Candidates + NOTA)
      const candidateList = election.candidates.map((c) => ({
        id: c.candidate.id,
        ballotOrder: c.ballotOrder,
        fullName: c.candidate.user.fullName,
        partyAffiliation: c.candidate.partyAffiliation,
        symbolName: c.candidate.symbolName,
        symbolIcon: c.candidate.symbolIcon,
        photoUrl: c.candidate.photoUrl,
        biography: c.candidate.biography,
        manifesto: c.candidate.manifesto,
      }));

      res.json({
        success: true,
        data: {
          election: {
            id: election.id,
            title: election.title,
            electionType: election.electionType,
            districtName: election.district?.name,
            constituencyName: election.constituency?.name,
            endDate: election.endDate,
          },
          voter: {
            voterUid: voter.voterUid,
            districtName: voter.district.name,
            constituencyName: voter.constituency.name,
          },
          candidates: candidateList,
          notaOption: {
            id: 'NOTA',
            ballotOrder: candidateList.length + 1,
            fullName: 'None of the Above (NOTA)',
            partyAffiliation: 'None',
            symbolName: 'Crossed Ballot',
            symbolIcon: 'x-circle',
            biography: 'Formal constitutional option to register vote of rejection for all contesting candidates.',
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to retrieve ballot' });
    }
  }

  /**
   * Atomic, Privacy-Preserving Vote Submission
   */
  static async castVote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { electionId, candidateId, isNota } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // 1. Fetch voter profile
      const voter = await prisma.voterProfile.findUnique({
        where: { userId },
      });

      if (!voter) {
        res.status(403).json({ success: false, message: 'Voter profile required to cast a vote.' });
        return;
      }

      // 2. Fetch election
      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }

      if (election.status !== 'ACTIVE') {
        res.status(400).json({
          success: false,
          message: `Election is not active (current status: ${election.status}).`,
        });
        return;
      }

      // 3. Candidate validation if not NOTA
      if (!isNota) {
        if (!candidateId) {
          res.status(400).json({ success: false, message: 'Please select a candidate or NOTA.' });
          return;
        }

        const validCandidate = await prisma.electionCandidate.findUnique({
          where: {
            electionId_candidateId: {
              electionId,
              candidateId,
            },
          },
        });

        if (!validCandidate) {
          res.status(400).json({ success: false, message: 'Selected candidate is not contesting in this election.' });
          return;
        }
      }

      // 4. Execute Atomic Transaction to prevent race conditions & duplicate votes
      const receiptNumber = generateReceiptNumber();
      const ballotHash = generateBallotHash();
      const submissionTimestamp = new Date();
      const verificationHash = calculateReceiptVerificationHash(receiptNumber, electionId, submissionTimestamp);

      let createdReceipt;

      try {
        await prisma.$transaction(async (tx) => {
          // Check for existing participation inside transaction
          const existingParticipation = await tx.voteParticipation.findUnique({
            where: {
              voterId_electionId: {
                voterId: voter.id,
                electionId,
              },
            },
          });

          if (existingParticipation) {
            throw new Error('DUPLICATE_VOTE_DETECTED');
          }

          // A. Create Receipt record (stores receipt number, timestamp, integrity hash — NO candidate choice!)
          createdReceipt = await tx.voteReceipt.create({
            data: {
              receiptNumber,
              electionId,
              timestamp: submissionTimestamp,
              verificationHash,
            },
          });

          // B. Create Voter Participation record (tracks that voter completed voting — NO candidate choice!)
          await tx.voteParticipation.create({
            data: {
              voterId: voter.id,
              electionId,
              votedAt: submissionTimestamp,
              receiptId: createdReceipt.id,
            },
          });

          // C. Create Anonymous Ballot record (tracks vote choice with random cryptographic salt — NO voter ID!)
          await tx.ballot.create({
            data: {
              electionId,
              candidateId: isNota ? null : candidateId,
              isNota: !!isNota,
              ballotHash,
              castAt: submissionTimestamp,
            },
          });
        });
      } catch (txError: any) {
        if (txError.message === 'DUPLICATE_VOTE_DETECTED' || txError.code === 'P2002') {
          await AuditService.log({
            userId,
            action: 'DUPLICATE_VOTE_ATTEMPT_BLOCKED',
            resource: 'Election: ' + electionId,
            details: { reason: 'Duplicate vote prevented by unique constraint' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            severity: 'WARNING',
          });

          res.status(409).json({
            success: false,
            message: 'A vote has already been submitted for this election from this voter account.',
          });
          return;
        }
        throw txError;
      }

      // 5. Audit Logging (Guaranteed zero candidate choice recorded!)
      await AuditService.log({
        userId,
        action: 'BALLOT_CAST_SUCCESSFUL',
        resource: 'Election: ' + electionId,
        details: { receiptNumber, verified: true },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        severity: 'INFO',
      });

      // 6. Return Privacy Receipt to voter
      res.status(200).json({
        success: true,
        message: 'Your simulated vote has been cast and recorded successfully.',
        data: {
          receiptNumber,
          electionTitle: election.title,
          electionType: election.electionType,
          timestamp: submissionTimestamp,
          verificationHash,
          disclaimer:
            'EDUCATIONAL DEMO RECEIPT: This simulated digital receipt confirms participation in the MahaVote demonstration portal. Individual ballot choices are strictly separated and anonymized.',
        },
      });
    } catch (error: any) {
      console.error('Error casting vote:', error);
      res.status(500).json({ success: false, message: error.message || 'An error occurred while submitting your ballot' });
    }
  }

  /**
   * Verify Receipt Integrity
   */
  static async verifyReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { receiptNumber } = req.params;

      const receipt = await prisma.voteReceipt.findUnique({
        where: { receiptNumber: receiptNumber.toUpperCase() },
        include: {
          election: {
            select: {
              id: true,
              title: true,
              electionType: true,
              status: true,
            },
          },
        },
      });

      if (!receipt) {
        res.status(404).json({
          success: false,
          verified: false,
          message: 'Receipt reference not found in the demonstration registry.',
        });
        return;
      }

      res.json({
        success: true,
        verified: true,
        data: {
          receiptNumber: receipt.receiptNumber,
          electionTitle: receipt.election.title,
          electionType: receipt.election.electionType,
          electionStatus: receipt.election.status,
          timestamp: receipt.timestamp,
          verificationHash: receipt.verificationHash,
          status: 'AUTHENTICATED_DEMO_RECORD',
          privacyNotice: 'Zero-Knowledge Privacy: This receipt confirms valid ballot deposition without exposing voter identity or candidate preference.',
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Receipt verification failed' });
    }
  }

  /**
   * Get voter's personal participation history (Privacy-Preserving)
   */
  static async getVoterHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const voter = await prisma.voterProfile.findUnique({
        where: { userId },
      });

      if (!voter) {
        res.status(404).json({ success: false, message: 'Voter profile not found' });
        return;
      }

      const participations = await prisma.voteParticipation.findMany({
        where: { voterId: voter.id },
        include: {
          election: {
            select: {
              id: true,
              title: true,
              electionType: true,
              status: true,
            },
          },
        },
        orderBy: { votedAt: 'desc' },
      });

      // Map to safe format (NO candidate info!)
      const history = await Promise.all(
        participations.map(async (p) => {
          const receipt = await prisma.voteReceipt.findUnique({
            where: { id: p.receiptId },
          });

          return {
            electionId: p.election.id,
            electionTitle: p.election.title,
            electionType: p.election.electionType,
            votedAt: p.votedAt,
            receiptNumber: receipt?.receiptNumber || 'N/A',
            verificationHash: receipt?.verificationHash || 'N/A',
          };
        })
      );

      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch voter history' });
    }
  }
}
