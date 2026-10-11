import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  registerVoterSchema,
  registerCandidateSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
} from '../utils/validation.js';

const router = Router();

// Registration
router.post('/register/voter', authLimiter, validate(registerVoterSchema), AuthController.registerVoter);
router.post('/register/candidate', authLimiter, validate(registerCandidateSchema), AuthController.registerCandidate);

// Password Login
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);

// OTP Simulator Authentication
router.post('/otp/request', authLimiter, validate(requestOtpSchema), AuthController.requestOtp);
router.post('/otp/verify', authLimiter, validate(verifyOtpSchema), AuthController.verifyOtp);
router.get('/otp/simulator-inbox', AuthController.getSimulatorInbox);

// Token Refresh
router.post('/refresh-token', AuthController.refreshToken);

// Profile & Logout
router.get('/me', authenticate, AuthController.getMe);
router.post('/logout', authenticate, AuthController.logout);

export default router;
