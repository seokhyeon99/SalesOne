import { OpportunityStatus } from './opportunity';

// Timeline item types
export type TimelineItemType = 'note' | 'file' | 'task' | 'status_change';

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  title?: string;
  content?: string;
  name?: string;
  description?: string;
  status?: string;
  oldStatus?: OpportunityStatus;
  newStatus?: OpportunityStatus;
  created_at: string;
  created_by: string;
  opportunity_id: string;
}

// Task types
export interface OpportunityTask {
  id: string;
  title: string;
  body: string;
  status: "pending" | "in_progress" | "completed";
  opportunity: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    email: string;
  };
}

// Note types
export interface OpportunityNote {
  id: string;
  title: string;
  content: string;
  opportunity: string;
  created_at: string;
  user: {
    id: string;
    email: string;
  };
}

// File types
export interface OpportunityFile {
  id: string;
  name: string;
  size: number;
  url: string;
  created_at: string;
  opportunity: string;
} 