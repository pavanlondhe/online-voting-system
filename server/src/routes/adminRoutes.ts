import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewNominationSchema } from '../utils/validation.js';

const router = Router();

const ADMIN_ALL = [
  'SUPER_ADMIN',
  'STATE_ELECTION_ADMIN',
  'DISTRICT_ELECTION_OFFICER',
  'RETURNING_OFFICER',
  'AUDITOR',
];

const RO_AND_ADMIN = [
  'SUPER_ADMIN',
  'STATE_ELECTION_ADMIN',
  'DISTRICT_ELECTION_OFFICER',
  'RETURNING_OFFICER',
];

router.get('/metrics', authenticate, requireRole(ADMIN_ALL), AdminController.getDashboardMetrics);
router.get('/nominations', authenticate, requireRole(ADMIN_ALL), AdminController.getNominations);
router.post(
  '/nominations/:id/review',
  authenticate,
  requireRole(RO_AND_ADMIN),
  validate(reviewNominationSchema),
  AdminController.reviewNomination
);
router.get('/users', authenticate, requireRole(ADMIN_ALL), AdminController.getUsers);
router.get('/audit-logs', authenticate, requireRole(ADMIN_ALL), AdminController.getAuditLogs);
router.get('/audit-logs/export', authenticate, requireRole(ADMIN_ALL), AdminController.exportAuditLogsCsv);

export default router;
