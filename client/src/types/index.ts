export type UserRole =
  | 'SUPER_ADMIN'
  | 'STATE_ELECTION_ADMIN'
  | 'DISTRICT_ELECTION_OFFICER'
  | 'RETURNING_OFFICER'
  | 'AUDITOR'
  | 'CANDIDATE'
  | 'VOTER';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  voterProfile?: VoterProfile;
  candidateProfile?: CandidateProfile;
}

export interface District {
  id: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  code: string;
  division: string;
  state: string;
  constituencies?: Constituency[];
}

export interface Constituency {
  id: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  code: string;
  type: 'ASSEMBLY' | 'PARLIAMENTARY' | 'MUNICIPAL' | 'PANCHAYAT' | 'STUDENT';
  districtId: string;
  district?: District;
}

export interface VoterProfile {
  id: string;
  userId: string;
  voterUid: string;
  dateOfBirth?: string;
  gender?: string;
  districtId: string;
  district: District;
  constituencyId: string;
  constituency: Constituency;
  address?: string;
  isVerified: boolean;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  partyAffiliation: string;
  symbolName: string;
  symbolIcon?: string;
  photoUrl?: string;
  manifesto?: string;
  biography?: string;
  education?: string;
  assetsDeclaration?: string;
  constituencyId?: string;
  constituency?: Constituency;
  nominations?: Nomination[];
}

export type ElectionType =
  | 'ASSEMBLY'
  | 'PARLIAMENTARY'
  | 'MUNICIPAL_CORP'
  | 'MUNICIPAL_COUNCIL'
  | 'GRAM_PANCHAYAT'
  | 'STUDENT';

export type ElectionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'CLOSED'
  | 'RESULTS_DECLARED';

export interface Election {
  id: string;
  title: string;
  titleMr?: string;
  titleHi?: string;
  description?: string;
  electionType: ElectionType;
  status: ElectionStatus;
  startDate: string;
  endDate: string;
  districtId?: string;
  district?: District;
  constituencyId?: string;
  constituency?: Constituency;
  totalEligibleVoters: number;
  candidates?: {
    id: string;
    ballotOrder: number;
    status: string;
    candidate: CandidateProfile;
  }[];
  _count?: {
    participations: number;
    candidates?: number;
  };
  results?: ElectionResult;
}

export interface Nomination {
  id: string;
  electionId: string;
  election?: Election;
  candidateId: string;
  candidate?: CandidateProfile;
  nominationDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  affidavitSummary?: string;
  reviewedByUserId?: string;
  reviewedBy?: { fullName: string; role: string };
  reviewRemarks?: string;
  reviewedAt?: string;
}

export interface CandidateTally {
  candidateId: string | null;
  candidateName: string;
  party: string;
  symbol: string;
  votes: number;
  percentage: number;
  isWinner: boolean;
}

export interface ElectionResult {
  id: string;
  electionId: string;
  totalVotesCast: number;
  notaCount: number;
  turnoutPercentage: number;
  talliesJson: string;
  winnerSummary?: string;
  declaredAt: string;
}

export interface VoteReceipt {
  receiptNumber: string;
  electionTitle: string;
  electionType: string;
  timestamp: string;
  verificationHash: string;
  status?: string;
  privacyNotice?: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  user?: {
    email: string;
    fullName: string;
    role: string;
  };
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export interface OtpSimulatorEntry {
  identifier: string;
  code: string;
  purpose: string;
  expiresAt: string;
  createdAt: string;
}
