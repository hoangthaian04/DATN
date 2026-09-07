export interface HiringRound {
  id: number;
  name: string;
  description?: string | null;
  orderIndex: number;
  passEmailTemplateId?: number | null;
  failEmailTemplateId?: number | null;
  testLink?: string | null;
  isFinalRound: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HiringRoundRequest {
  id?: number | null;
  name: string;
  description?: string;
  passEmailTemplateId?: number | null;
  failEmailTemplateId?: number | null;
  testLink?: string;
  isFinalRound?: boolean;
}
