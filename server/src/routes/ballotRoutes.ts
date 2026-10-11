import { Router } from 'express';
import { BallotController } from '../controllers/ballotController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { voteLimiter } from '../middleware/rateLimiter.js';
import { castVoteSchema } from '../utils/validation.js';

const router = Router();

// Public receipt verification
router.get('/receipt/verify/:receiptNumber', BallotController.verifyReceipt);

// Voter authenticated routes
router.get('/election/:electionId', authenticate, requireRole(['VOTER']), BallotController.getBallot);
router.post(
  '/vote',
  authenticate,
  requireRole(['VOTER']),
  voteLimiter,
  validate(castVoteSchema),
  BallotController.castVote
);
router.get('/voter/history', authenticate, requireRole(['VOTER']), BallotController.getVoterHistory);

export default router;
