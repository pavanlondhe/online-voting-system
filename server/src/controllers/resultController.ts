import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AuditService } from '../services/auditService.js';

export class ResultController {
  /**
   * Get Public Results for an Election
   * (Educational Demo: Results only displayed if CLOSED or RESULTS_DECLARED)
   */
  static async getResults(req: Request, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;

      const election = await prisma.election.findUnique({
        where: { id: electionId },
        include: {
          results: true,
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
        },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }

      if (election.status !== 'CLOSED' && election.status !== 'RESULTS_DECLARED') {
        res.status(403).json({
          success: false,
          message: `Results cannot be displayed while election is ${election.status}. Results are only published once the election is officially closed.`,
        });
        return;
      }

      // Check if result record already exists
      let result = election.results;

      // If not yet compiled or updating, compile from anonymous ballots
      if (!result) {
        result = await ResultController.compileElectionResult(electionId);
      }

      const parsedTallies = result ? JSON.parse(result.talliesJson) : [];

      res.json({
        success: true,
        disclaimer: 'SIMULATED DEMONSTRATION RESULTS — NOT OFFICIAL ELECTION RESULTS',
        data: {
          election: {
            id: election.id,
            title: election.title,
            titleMr: election.titleMr,
            titleHi: election.titleHi,
            electionType: election.electionType,
            districtName: election.district?.name,
            constituencyName: election.constituency?.name,
            status: election.status,
            totalEligibleVoters: election.totalEligibleVoters,
          },
          summary: {
            totalVotesCast: result.totalVotesCast,
            turnoutPercentage: result.turnoutPercentage,
            notaCount: result.notaCount,
            declaredAt: result.declaredAt,
            winnerSummary: result.winnerSummary,
          },
          tallies: parsedTallies,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch results' });
    }
  }

  /**
   * Admin Trigger: Calculate and Declare Results for a closed election
   */
  static async declareResults(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { electionId } = req.params;

      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        res.status(404).json({ success: false, message: 'Election not found.' });
        return;
      }

      const result = await ResultController.compileElectionResult(electionId);

      // Update election status to RESULTS_DECLARED
      await prisma.election.update({
        where: { id: electionId },
        data: { status: 'RESULTS_DECLARED' },
      });

      await AuditService.log({
        userId: req.user?.userId,
        action: 'RESULTS_DECLARED',
        resource: 'Election: ' + electionId,
        details: { totalVotes: result.totalVotesCast, winner: result.winnerSummary },
        severity: 'INFO',
      });

      res.json({
        success: true,
        message: 'Simulated election results computed and declared successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to declare results' });
    }
  }

  /**
   * Internal Helper: Tally Anonymous Ballots and Compute Winner
   */
  private static async compileElectionResult(electionId: string) {
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          include: {
            candidate: {
              include: {
                user: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!election) throw new Error('Election not found');

    const totalVotes = await prisma.ballot.count({ where: { electionId } });
    const notaVotes = await prisma.ballot.count({ where: { electionId, isNota: true } });

    // Count votes per candidate
    const candidateTallies: any[] = [];
    let topCandidate = null;
    let maxVotes = -1;

    for (const ec of election.candidates) {
      const votes = await prisma.ballot.count({
        where: {
          electionId,
          candidateId: ec.candidate.id,
          isNota: false,
        },
      });

      const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0;

      candidateTallies.push({
        candidateId: ec.candidate.id,
        candidateName: ec.candidate.user.fullName,
        party: ec.candidate.partyAffiliation,
        symbol: ec.candidate.symbolName,
        votes,
        percentage,
        isWinner: false,
      });

      if (votes > maxVotes) {
        maxVotes = votes;
        topCandidate = ec.candidate;
      }
    }

    // Add NOTA tally
    const notaPercentage = totalVotes > 0 ? Number(((notaVotes / totalVotes) * 100).toFixed(2)) : 0;
    candidateTallies.push({
      candidateId: null,
      candidateName: 'None of the Above (NOTA)',
      party: 'None',
      symbol: 'Crossed Ballot',
      votes: notaVotes,
      percentage: notaPercentage,
      isWinner: false,
    });

    // Mark winner
    if (topCandidate && maxVotes > notaVotes) {
      const winnerItem = candidateTallies.find((c) => c.candidateId === topCandidate.id);
      if (winnerItem) winnerItem.isWinner = true;
    }

    const winnerSummary = topCandidate
      ? `${topCandidate.user.fullName} (${topCandidate.partyAffiliation}) with ${maxVotes} votes.`
      : 'No votes recorded or NOTA majority.';

    const turnoutPercentage =
      election.totalEligibleVoters > 0
        ? Number(((totalVotes / election.totalEligibleVoters) * 100).toFixed(2))
        : 0;

    const result = await prisma.electionResult.upsert({
      where: { electionId },
      update: {
        totalVotesCast: totalVotes,
        notaCount: notaVotes,
        turnoutPercentage,
        talliesJson: JSON.stringify(candidateTallies),
        winnerSummary,
        declaredAt: new Date(),
      },
      create: {
        electionId,
        totalVotesCast: totalVotes,
        notaCount: notaVotes,
        turnoutPercentage,
        talliesJson: JSON.stringify(candidateTallies),
        winnerSummary,
        declaredAt: new Date(),
      },
    });

    return result;
  }
}
