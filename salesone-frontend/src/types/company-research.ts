export interface CompanyNews {
  id: string;
  title: string;
  content: string;
  date: string;
  source: string;
  url: string;
  imageUrl?: string;
}

export interface CompanyResearch {
  companyName: string;
  summary: string;
  details: {
    representative: string;
    businessNumber: string;
    postalCode: string;
    address: string;
    businessType: string;
    taxpayerStatus: string;
    taxationType: string;
    invoiceIssue: string;
    commerceRegistration?: string;
    items?: string;
    website?: string;
    establishment?: string;
    mainBusiness?: string;
    employees?: string;
    revenue?: string;
    otherDetails?: string;
  };
  news: CompanyNews[];
  isLoading: boolean;
} 