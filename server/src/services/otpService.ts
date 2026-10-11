import { prisma } from '../prisma.js';
import { generateNumericOtp } from '../utils/security.js';
import { env } from '../config/env.js';

export interface OtpSimulatorEntry {
  identifier: string;
  code: string;
  purpose: string;
  expiresAt: Date;
  createdAt: Date;
}

// In-memory simulator cache for development UI inspector
const simulatorInbox: OtpSimulatorEntry[] = [];

export class OtpService {
  /**
   * Generates and stores a demo OTP challenge
   */
  static async createOtpChallenge(identifier: string, purpose: string = 'LOGIN'): Promise<{ success: boolean; simulatorOtp: string; expiresAt: Date }> {
    const code = generateNumericOtp();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Invalidate existing active OTPs for this identifier and purpose
    await prisma.oTPChallenge.updateMany({
      where: {
        identifier,
        purpose,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new challenge in DB
    await prisma.oTPChallenge.create({
      data: {
        identifier,
        otpCode: code,
        purpose,
        expiresAt,
        attempts: 0,
        maxAttempts: env.OTP_MAX_ATTEMPTS,
        isUsed: false,
      },
    });

    // Save to simulator inbox for developer inspection modal
    const entry: OtpSimulatorEntry = {
      identifier,
      code,
      purpose,
      expiresAt,
      createdAt: new Date(),
    };
    simulatorInbox.unshift(entry);
    if (simulatorInbox.length > 50) {
      simulatorInbox.pop();
    }

    return {
      success: true,
      simulatorOtp: code,
      expiresAt,
    };
  }

  /**
   * Verifies an OTP code against active challenges
   */
  static async verifyOtp(identifier: string, code: string, purpose: string = 'LOGIN'): Promise<{ valid: boolean; message: string }> {
    const challenge = await prisma.oTPChallenge.findFirst({
      where: {
        identifier,
        purpose,
        isUsed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!challenge) {
      return { valid: false, message: 'No active OTP found. Please request a new code.' };
    }

    if (new Date() > challenge.expiresAt) {
      await prisma.oTPChallenge.update({
        where: { id: challenge.id },
        data: { isUsed: true },
      });
      return { valid: false, message: 'OTP has expired. Please request a fresh code.' };
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      await prisma.oTPChallenge.update({
        where: { id: challenge.id },
        data: { isUsed: true },
      });
      return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
    }

    if (challenge.otpCode !== code.trim()) {
      await prisma.oTPChallenge.update({
        where: { id: challenge.id },
        data: { attempts: challenge.attempts + 1 },
      });
      const remaining = challenge.maxAttempts - (challenge.attempts + 1);
      return { valid: false, message: `Invalid OTP. ${remaining} attempt(s) remaining.` };
    }

    // Success - mark OTP as consumed
    await prisma.oTPChallenge.update({
      where: { id: challenge.id },
      data: { isUsed: true },
    });

    return { valid: true, message: 'OTP verified successfully.' };
  }

  /**
   * Retrieves latest simulator inbox entries for the frontend dev simulator widget
   */
  static getSimulatorInbox(): OtpSimulatorEntry[] {
    const now = new Date();
    return simulatorInbox.filter((item) => item.expiresAt > now);
  }
}
