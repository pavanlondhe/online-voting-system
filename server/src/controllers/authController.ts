import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateDemoVoterUid,
} from '../utils/security.js';
import { OtpService } from '../services/otpService.js';
import { AuditService } from '../services/auditService.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class AuthController {
  /**
   * Voter Registration
   */
  static async registerVoter(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, phone, password, districtId, constituencyId, dateOfBirth, gender, address } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address or mobile number already exists.',
        });
        return;
      }

      const passwordHash = await hashPassword(password);
      const voterUid = generateDemoVoterUid();

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          role: 'VOTER',
          voterProfile: {
            create: {
              voterUid,
              districtId,
              constituencyId,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              gender: gender || null,
              address: address || null,
              isVerified: true,
            },
          },
        },
        include: { voterProfile: true },
      });

      await AuditService.log({
        userId: user.id,
        action: 'VOTER_REGISTERED',
        resource: 'VoterProfile',
        details: { voterUid, constituencyId },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const tokenPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.status(201).json({
        success: true,
        message: 'Demo voter registered successfully.',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            voterUid,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }

  /**
   * Candidate Registration
   */
  static async registerCandidate(req: Request, res: Response): Promise<void> {
    try {
      const {
        fullName,
        email,
        phone,
        password,
        partyAffiliation,
        symbolName,
        symbolIcon,
        constituencyId,
        manifesto,
        biography,
        education,
        assetsDeclaration,
      } = req.body;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'An account with this email address or mobile number already exists.',
        });
        return;
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          fullName,
          email,
          phone,
          passwordHash,
          role: 'CANDIDATE',
          candidateProfile: {
            create: {
              partyAffiliation: partyAffiliation || 'Independent',
              symbolName,
              symbolIcon: symbolIcon || 'flag',
              constituencyId: constituencyId || null,
              manifesto,
              biography,
              education,
              assetsDeclaration,
            },
          },
        },
        include: { candidateProfile: true },
      });

      await AuditService.log({
        userId: user.id,
        action: 'CANDIDATE_REGISTERED',
        resource: 'CandidateProfile',
        details: { partyAffiliation, symbolName },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const tokenPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.status(201).json({
        success: true,
        message: 'Candidate account created successfully.',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Candidate registration failed' });
    }
  }

  /**
   * Universal Login (Voter, Candidate, Admin)
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
        include: {
          voterProfile: { include: { district: true, constituency: true } },
          candidateProfile: { include: { constituency: true } },
        },
      });

      if (!user || !(await comparePassword(password, user.passwordHash))) {
        await AuditService.log({
          action: 'AUTH_FAILURE_PASSWORD',
          resource: 'User',
          details: { identifier },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          severity: 'WARNING',
        });

        res.status(401).json({
          success: false,
          message: 'Invalid email/mobile number or password.',
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({ success: false, message: 'This account has been deactivated.' });
        return;
      }

      await AuditService.log({
        userId: user.id,
        action: 'USER_LOGIN_SUCCESS',
        resource: 'User',
        details: { role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const tokenPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000,
        sameSite: 'lax',
      });

      res.json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            voterProfile: user.voterProfile,
            candidateProfile: user.candidateProfile,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Login failed' });
    }
  }

  /**
   * Request Demo OTP
   */
  static async requestOtp(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, purpose = 'LOGIN' } = req.body;

      // Find user if exists
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { phone: identifier }] },
      });

      const otpResult = await OtpService.createOtpChallenge(identifier, purpose);

      await AuditService.log({
        userId: user?.id,
        action: 'OTP_REQUESTED',
        resource: 'OTPChallenge',
        details: { identifier, purpose },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Demo OTP generated successfully. Use the OTP Simulator below to inspect the code.',
        data: {
          identifier,
          purpose,
          simulatorOtp: otpResult.simulatorOtp, // Provided for convenience in educational demo
          expiresAt: otpResult.expiresAt,
          isRegistered: !!user,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'OTP generation failed' });
    }
  }

  /**
   * Verify Demo OTP and Sign In
   */
  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { identifier, code, purpose = 'LOGIN' } = req.body;

      const verification = await OtpService.verifyOtp(identifier, code, purpose);

      if (!verification.valid) {
        await AuditService.log({
          action: 'AUTH_FAILURE_OTP',
          resource: 'OTPChallenge',
          details: { identifier, reason: verification.message },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          severity: 'WARNING',
        });

        res.status(400).json({ success: false, message: verification.message });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { phone: identifier }] },
        include: {
          voterProfile: { include: { district: true, constituency: true } },
          candidateProfile: true,
        },
      });

      if (!user) {
        // OTP verified for unregistered user (e.g. during pre-registration step)
        res.json({
          success: true,
          message: 'OTP verified successfully.',
          data: { verified: true, isRegistered: false, identifier },
        });
        return;
      }

      await AuditService.log({
        userId: user.id,
        action: 'OTP_LOGIN_SUCCESS',
        resource: 'User',
        details: { role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      const tokenPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      res.json({
        success: true,
        message: 'OTP verified and signed in successfully.',
        data: {
          verified: true,
          isRegistered: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            voterProfile: user.voterProfile,
            candidateProfile: user.candidateProfile,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'OTP verification failed' });
    }
  }

  /**
   * Refresh Token Rotation
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ success: false, message: 'Refresh token is required.' });
        return;
      }

      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        res.status(401).json({ success: false, message: 'User account not found or deactivated.' });
        return;
      }

      const newPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        fullName: user.fullName,
      };

      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Token refresh failed' });
    }
  }

  /**
   * Get Current User Profile
   */
  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthenticated.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          isActive: true,
          createdAt: true,
          voterProfile: {
            include: {
              district: true,
              constituency: true,
            },
          },
          candidateProfile: {
            include: {
              constituency: true,
              nominations: {
                include: { election: true },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch user' });
    }
  }

  /**
   * Get Developer OTP Simulator Inbox
   */
  static getSimulatorInbox(_req: Request, res: Response): void {
    const inbox = OtpService.getSimulatorInbox();
    res.json({ success: true, data: inbox });
  }

  /**
   * Logout
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (req.user) {
      await AuditService.log({
        userId: req.user.userId,
        action: 'USER_LOGOUT',
        resource: 'User',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
    }

    res.clearCookie('access_token');
    res.json({ success: true, message: 'Logged out successfully.' });
  }
}
