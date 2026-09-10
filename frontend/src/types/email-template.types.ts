export type EmailTemplateType = 'APPLICATION_RECEIVED' | 'PASS' | 'FAIL' | 'INTERVIEW_INVITE' | 'OFFER';
export type TemplateScope = 'SYSTEM' | 'CUSTOM';

export interface EmailTemplateApi {
  id: number;
  templateName: string;
  type: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  variables: string[];
  templateScope: TemplateScope;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplatePayload {
  templateName: string;
  type: EmailTemplateType;
  subject: string;
  bodyHtml: string;
  isActive?: boolean;
}
