import useSWR from 'swr';
import { fetcher } from '@/lib/utils';
import { Task } from './use-client-tasks';
import { toast } from 'sonner';

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'failed';

export interface StatusGroup {
  [key: string]: Task[];
}

export const STATUS_COLUMNS = [
  { key: 'not_started', title: '해야할 일' },
  { key: 'in_progress', title: '진행중' },
  { key: 'completed', title: '완료' },
  { key: 'failed', title: '실패' }
] as const;

export function useTasksKanban() {
  const { 
    data: statusGroups,
    error, 
    mutate
  } = useSWR<StatusGroup>('/api/tasks/tasks/kanban', fetcher, {
    refreshInterval: 10000, // Refresh data every 10 seconds
  });

  // Update task status when dragged to a new column
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/tasks/${taskId}/change_status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        let errorMessage = '작업 상태 변경에 실패했습니다';
        
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

      // Optimistically update the local data
      const updatedTask = await response.json();
      
      // Update the local state for smoother user experience
      mutate((prev) => {
        if (!prev) return prev;
        
        // First, create a deep copy of the previous state
        const updatedGroups = { ...prev };
        
        // Find the task in the old status group and remove it
        Object.keys(updatedGroups).forEach(status => {
          updatedGroups[status] = updatedGroups[status].filter(task => task.id !== taskId);
        });
        
        // Add the task to the new status group
        updatedGroups[newStatus] = [...(updatedGroups[newStatus] || []), updatedTask];
        
        return updatedGroups;
      }, false);
      
      // Refresh data to ensure consistency with the server
      mutate();
      
      toast.success(`작업 상태가 '${getStatusTitle(newStatus)}'(으)로 변경되었습니다`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error(error instanceof Error ? error.message : '작업 상태 변경에 실패했습니다');
      // Refresh data to reset any optimistic updates
      mutate();
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = '작업 삭제에 실패했습니다';
        
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

      // Update the local state optimistically
      mutate((prev) => {
        if (!prev) return prev;
        
        // Create a deep copy of the previous state
        const updatedGroups = { ...prev };
        
        // Remove the task from all status groups
        Object.keys(updatedGroups).forEach(status => {
          updatedGroups[status] = updatedGroups[status].filter(task => task.id !== taskId);
        });
        
        return updatedGroups;
      }, false);
      
      // Refresh data to ensure consistency with the server
      mutate();
      
      toast.success('작업이 삭제되었습니다');
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error(error instanceof Error ? error.message : '작업 삭제에 실패했습니다');
      // Refresh data to reset any optimistic updates
      mutate();
      return false;
    }
  };

  const getStatusTitle = (status: TaskStatus): string => {
    const column = STATUS_COLUMNS.find(col => col.key === status);
    return column ? column.title : status;
  };

  return {
    statusGroups: statusGroups || {
      not_started: [],
      in_progress: [],
      completed: [],
      failed: []
    },
    isLoading: !error && !statusGroups,
    error,
    updateTaskStatus,
    deleteTask,
    getStatusTitle
  };
} 