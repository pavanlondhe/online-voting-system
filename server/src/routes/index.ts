import { Router } from 'express';
import authRoutes from './authRoutes.js';
import electionRoutes from './electionRoutes.js';
import candidateRoutes from './candidateRoutes.js';
import ballotRoutes from './ballotRoutes.js';
import adminRoutes from './adminRoutes.js';
import resultRoutes from './resultRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/elections', electionRoutes);
router.use('/candidates', candidateRoutes);
router.use('/ballot', ballotRoutes);
router.use('/admin', adminRoutes);
router.use('/results', resultRoutes);

export default router;
