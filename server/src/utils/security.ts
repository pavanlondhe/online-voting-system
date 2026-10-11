import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  role: string;
  email: string;
  fullName: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token operations
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Generates a random 6-digit numeric OTP
export function generateNumericOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generates unique demo Voter UID: MH-VTR-2026-XXXX
export function generateDemoVoterUid(): string {
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `MH-VTR-2026-${rand}`;
}

// Generates unique Vote Receipt Number: MV-2026-XXXX-XXXX
export function generateReceiptNumber(): string {
  const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `MV-2026-${part1}-${part2}`;
}

// Generates anonymous ballot hash token (zero linkage to voter)
export function generateBallotHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Calculates SHA-256 verification hash for the receipt
export function calculateReceiptVerificationHash(receiptNumber: string, electionId: string, timestamp: Date): string {
  const data = `${receiptNumber}:${electionId}:${timestamp.toISOString()}:MAHAVOTE_SECURE_SALT`;
  return crypto.createHash('sha256').update(data).digest('hex');
}
