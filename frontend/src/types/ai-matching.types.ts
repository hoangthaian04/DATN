export type AiMatchingRunStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type AiSuggestionContactStatus = 'NOT_CONTACTED' | 'CONTACTED';

export interface AiMatchingRun {
  jobId: number;
  matchingJobId: number;
  status: AiMatchingRunStatus;
  minScore: number;
  limit: number;
  errorMessage?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface AiSuggestion {
  suggestionId: number;
  candidateId: number;
  candidateName: string;
  email: string;
  matchingScore: number;
  matchedSkills: string[];
  strengths: string[];
  contactStatus: AiSuggestionContactStatus;
  contactedAt?: string | null;
  recentApplicationAt: string;
  createdAt: string;
}

export interface AiMatchingContactTemplate {
  suggestionId: number;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
}

export interface AiMatchingContactResult {
  suggestionId: number;
  emailLogId: number;
  contactStatus: 'CONTACTED';
  contactedAt: string;
}
