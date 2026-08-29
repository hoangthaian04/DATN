export type ApplicationStatus = 'NEW' | 'IN_PROGRESS' | 'PASSED' | 'REJECTED';
export type EvaluationResult = 'PASS' | 'FAIL';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
}

export interface RoundSummary {
  id: string;
  name: string;
  orderIndex: number;
}

export interface AIAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

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
  id: string;
  candidate: Candidate;
  status: ApplicationStatus;
  currentRound?: RoundSummary;
  aiScore?: number;
  appliedAt: string;
  cvUrl?: string;
}

export interface ApplicationDetail extends ApplicationSummary {
  job: { id: string; title: string };
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
