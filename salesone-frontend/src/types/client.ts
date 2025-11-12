export interface Client {
  id: string;
  name: string;
  representative_name: string;
  business_number?: string;
  emails: string[];
  phones: string[];
  address?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNote {
  id: string;
  client: string;
  title: string;
  content: string;
  user: {
    id: string;
    email: string;
  };
  created_at: string;
}

export interface ClientFile {
  id: string;
  client: string;
  name: string;
  size: number;
  type: string;
  url: string;
  description?: string;
  user: {
    id: string;
    email: string;
  };
  created_at: string;
}

export interface TimelineItem {
  id: string;
  type: 'note' | 'file';
  title?: string;
  content?: string;
  name?: string;
  description?: string;
  file_url?: string;
  created_at: string;
  created_by: string;
}

export interface Task {
  id: string;
  name: string;
  body: string;
  workflow_ids?: string[];
  workflow_data?: Record<string, any>;
  due_date: string;
  assignee: {
    id: string;
    email: string;
  };
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  client?: string;
  created_by: {
    id: string;
    email: string;
  };
  is_repetitive: boolean;
  repetition_interval?: number;
  repetition_end_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
}

export interface EmailAttachment {
  id: string;
  name: string;
  url: string;
  size?: number;
  type?: string;
}

export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  content: string;
  created_at: string;
  attachments?: EmailAttachment[];
} 