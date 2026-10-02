import type { CvAnalysisResult } from './ai.types';

export type ApplicationStatus = 'ACTIVE' | 'REJECTED' | 'HIRED';
export type EvaluationResult = 'PASS' | 'FAIL';

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
}

export interface RoundSummary {
  id: number;
  name: string;
  orderIndex: number;
}

export type CvAnalysis = CvAnalysisResult;

/** Backward-compatible name for consumers that still use the old UI type. */
export type AIAnalysis = CvAnalysis;

export interface RoundHistoryItem {
  roundName: string;
  result: EvaluationResult | 'PENDING';
  evaluatedAt?: string;
}

export interface EmailHistoryItem {
  subject: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export interface InterviewSchedule {
  scheduledAt: string;
  durationMins: number;
  location: string;
  meetingLink?: string;
  responseStatus: 'PENDING' | 'CONFIRMED' | 'RESCHEDULE_REQUESTED';
}

export interface ApplicationSummary {
  id: number;
  candidate: Candidate;
  status: ApplicationStatus;
  currentRound?: RoundSummary;
  aiScore?: number;
  appliedAt: string;
  cvUrl?: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  job: { id: number; title: string };
  roundHistory: RoundHistoryItem[];
  aiAnalysis?: AIAnalysis;
  emailHistory: EmailHistoryItem[];
  interviews: InterviewSchedule[];
}

export interface ApplicationListResponse {
  content: ApplicationSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface ApplicationListDTO {
  applicationId: number;
  candidateId: number;
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  applicationStatus: ApplicationStatus;
  requiresCv?: boolean;
  hasCv?: boolean;
}
