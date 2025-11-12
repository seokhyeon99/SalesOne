export type OpportunityStatus = '상담 전' | '온보딩' | '협상' | '구매';

export interface Opportunity {
  id: string;
  name: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  value: number;
  status: OpportunityStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
} 