import { Router } from 'express';
import { CandidateController } from '../controllers/candidateController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { submitNominationSchema } from '../utils/validation.js';

const router = Router();

// Public routes
router.get('/', CandidateController.getCandidates);
router.get('/:id', CandidateController.getCandidateById);

// Candidate authenticated routes
router.get('/me/profile', authenticate, requireRole(['CANDIDATE']), CandidateController.getMyProfile);
router.put('/me/profile', authenticate, requireRole(['CANDIDATE']), CandidateController.updateMyProfile);
router.post(
  '/nominations',
  authenticate,
  requireRole(['CANDIDATE']),
  validate(submitNominationSchema),
  CandidateController.submitNomination
);

export default router;
