import { z } from 'zod';

export const registerVoterSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  districtId: z.string().min(1, 'District is required'),
  constituencyId: z.string().min(1, 'Constituency is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
});

export const registerCandidateSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  partyAffiliation: z.string().default('Independent'),
  symbolName: z.string().min(2, 'Symbol name is required'),
  symbolIcon: z.string().optional(),
  constituencyId: z.string().optional(),
  manifesto: z.string().min(10, 'Manifesto summary must be at least 10 characters'),
  biography: z.string().min(10, 'Biography must be at least 10 characters'),
  education: z.string().min(2, 'Educational qualifications required'),
  assetsDeclaration: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or mobile number is required'),
  password: z.string().min(6, 'Password is required'),
});

export const requestOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or mobile number is required'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'VOTE_AUTH']).default('LOGIN'),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or mobile number is required'),
  code: z.string().length(6, 'OTP must be exactly 6 digits'),
  purpose: z.enum(['LOGIN', 'REGISTER', 'VOTE_AUTH']).default('LOGIN'),
});

export const createElectionSchema = z.object({
  title: z.string().min(5, 'Election title must be at least 5 characters'),
  titleMr: z.string().optional(),
  titleHi: z.string().optional(),
  description: z.string().optional(),
  electionType: z.enum([
    'ASSEMBLY',
    'PARLIAMENTARY',
    'MUNICIPAL_CORP',
    'MUNICIPAL_COUNCIL',
    'GRAM_PANCHAYAT',
    'STUDENT',
  ]),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid start date format' }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid end date format' }),
  districtId: z.string().optional().nullable(),
  constituencyId: z.string().optional().nullable(),
  totalEligibleVoters: z.number().int().nonnegative().optional(),
});

export const updateElectionStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'CLOSED', 'RESULTS_DECLARED']),
});

export const submitNominationSchema = z.object({
  electionId: z.string().min(1, 'Election ID is required'),
  affidavitSummary: z.string().min(10, 'Affidavit declaration must be at least 10 characters'),
});

export const reviewNominationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewRemarks: z.string().min(3, 'Administrative review remarks are required'),
});

export const castVoteSchema = z.object({
  electionId: z.string().min(1, 'Election ID is required'),
  candidateId: z.string().nullable().optional(),
  isNota: z.boolean().default(false),
});
