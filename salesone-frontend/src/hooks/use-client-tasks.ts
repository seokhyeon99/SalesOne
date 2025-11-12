import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export interface Task {
  id: string;
  name: string;
  body: string;
  status: "not_started" | "in_progress" | "completed" | "failed" | "cancelled";
  client: string;
  due_date?: string;
  workflow_ids?: string[];
  workflow_data?: Record<string, any>;
  is_repetitive: boolean;
  repetition_interval?: number;
  repetition_end_date?: string;
  created_at: string;
  updated_at: string;
  created_by: {
    id: string;
    email: string;
  };
  assignee: {
    id: string;
    email: string;
  };
}

export type CreateTaskData = {
  name: string;
  body: string;
  due_date?: string;
  workflow_ids?: string[];
  is_repetitive?: boolean;
  repetition_interval?: number;
  repetition_end_date?: string;
  client_id?: string;
  status?: string;
};

export function useClientTasks(clientId?: string) {
  // Only include client_id in the URL if it's provided
  const url = clientId ? `/api/tasks/tasks?client_id=${clientId}` : `/api/tasks/tasks`;
  
  const { data: tasks, error, mutate } = useSWR<Task[]>(
    url,
    fetcher
  );

  const createTask = async (taskData: CreateTaskData) => {
    const response = await fetch(`/api/tasks/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create task";
      
      try {
        // Try to parse error response as JSON
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object') {
          // Format Django REST framework validation errors
          const errorDetails = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
            
          if (errorDetails) {
            errorMessage += `: ${errorDetails}`;
          }
        }
      } catch (e) {
        // If we can't parse JSON, use status text
        errorMessage += `: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const newTask = await response.json();
    await mutate();
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, status: Task["status"]) => {
    const response = await fetch(`/api/tasks/tasks/${taskId}/update_status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      let errorMessage = "Failed to update task status";
      
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object') {
          const errorDetails = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
            
          if (errorDetails) {
            errorMessage += `: ${errorDetails}`;
          }
        }
      } catch (e) {
        errorMessage += `: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    await mutate();
  };

  const deleteTask = async (taskId: string) => {
    const response = await fetch(`/api/tasks/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = "Failed to delete task";
      
      try {
        const errorData = await response.json();
        if (errorData && typeof errorData === 'object') {
          const errorDetails = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
            
          if (errorDetails) {
            errorMessage += `: ${errorDetails}`;
          }
        }
      } catch (e) {
        errorMessage += `: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    await mutate();
  };

  return {
    tasks,
    isLoading: !error && !tasks,
    error,
    createTask,
    updateTaskStatus,
    deleteTask,
  };
} 