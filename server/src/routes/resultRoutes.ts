import { Router } from 'express';
import { ResultController } from '../controllers/resultController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const RESULT_ADMINS = ['SUPER_ADMIN', 'STATE_ELECTION_ADMIN', 'DISTRICT_ELECTION_OFFICER', 'RETURNING_OFFICER'];

// Public results (only shown when election is closed)
router.get('/election/:electionId', ResultController.getResults);

// Admin declare results
router.post('/election/:electionId/declare', authenticate, requireRole(RESULT_ADMINS), ResultController.declareResults);

export default router;
