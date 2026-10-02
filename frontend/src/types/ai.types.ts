/** Canonical AI contracts for the Gemini-backed MVP endpoints. */

export type AIProviderSource = 'CUSTOM' | 'SYSTEM_DEFAULT';
export type AIProviderStatus = 'ACTIVE' | 'INACTIVE';
export type CvAnalysisStatus = 'COMPLETED' | 'FAILED';

export interface JobDescriptionSuggestionRequest {
  title: string;
  categoryId: number;
  experienceLevel?: string;
  workingType?: string;
  prompt?: string;
}

export interface JobDescriptionSuggestion {
  suggestedDescription: string;
  suggestedRequirements: string;
  suggestedBenefits: string;
  provider: string;
  providerSource: AIProviderSource;
  model?: string;
}

export interface CvAnalysisRequest {
  rerun?: boolean;
}

export interface CvAnalysisResult {
  id: number;
  applicationId: number;
  matchingScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  summary: string;
  provider: string;
  providerSource: AIProviderSource;
  status: CvAnalysisStatus;
  errorMessage?: string;
}

export interface AIProviderSummary {
  id: number;
  providerCode: string;
  providerName: string;
  isActive: boolean;
  isConfigured: boolean;
  maskedKey: string | null;
  updatedAt: string | null;
}

export interface AIProviderListData {
  /** Effective provider after custom-active -> system-default resolution. */
  activeProviderId: number | null;
  activeProviderSource: AIProviderSource | null;
  providers: AIProviderSummary[];
}

export interface UpdateAIProviderKeyRequest {
  apiKey?: string;
  isActive: boolean;
}
