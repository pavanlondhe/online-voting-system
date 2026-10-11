import { Router } from 'express';
import { ElectionController } from '../controllers/electionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createElectionSchema, updateElectionStatusSchema } from '../utils/validation.js';

const router = Router();

const ADMIN_ROLES = ['SUPER_ADMIN', 'STATE_ELECTION_ADMIN', 'DISTRICT_ELECTION_OFFICER', 'RETURNING_OFFICER'];

// Public routes
router.get('/', ElectionController.getElections);
router.get('/districts', ElectionController.getDistricts);
router.get('/constituencies', ElectionController.getConstituencies);
router.get('/:id', ElectionController.getElectionById);

// Admin-only routes
router.post(
  '/',
  authenticate,
  requireRole(ADMIN_ROLES),
  validate(createElectionSchema),
  ElectionController.createElection
);

router.patch(
  '/:id/status',
  authenticate,
  requireRole(ADMIN_ROLES),
  validate(updateElectionStatusSchema),
  ElectionController.updateElectionStatus
);

export default router;
