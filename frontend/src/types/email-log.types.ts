import type { BasePagination } from './api.types';

export type EmailLogStatus = 'SUCCESS' | 'FAILED';

export interface EmailLog {
  id: number;
  applicationId?: number | null;
  recipientEmail: string;
  templateCode: string;
  status: EmailLogStatus;
  subject: string;
  bodyHtml: string;
  sentAt?: string | null;
  retriedAt?: string | null;
  errorMessage?: string | null;
  attemptCount: number;
  createdAt: string;
}

export type EmailLogPage = BasePagination<EmailLog>;
