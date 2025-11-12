import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddTaskDialog } from "../tasks/add-task-dialog";
import { useClientTasks, type Task } from "@/hooks/use-client-tasks";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Circle, Calendar, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ClientTasksProps {
  clientId: string;
}

export function ClientTasks({ clientId }: ClientTasksProps) {
  const { tasks, isLoading, error, updateTaskStatus, deleteTask } = useClientTasks(clientId);

  const handleDelete = async (taskId: string) => {
    if (!confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteTask(taskId);
      toast.success('작업이 삭제되었습니다.');
    } catch (error) {
      toast.error('작업 삭제에 실패했습니다.');
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p>작업을 불러오는데 실패했습니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-muted-foreground">등록된 작업이 없습니다</p>
        <AddTaskDialog clientId={clientId} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddTaskDialog clientId={clientId} />
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-start justify-between gap-4 rounded-lg border p-4"
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => updateTaskStatus(task.id, task.status === "completed" ? "not_started" : "completed")}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </Button>
                <h4 className="font-medium">{task.name}</h4>
                
                {task.is_repetitive && (
                  <Badge variant="outline" className="ml-2">
                    반복
                  </Badge>
                )}
                
                {task.workflow_ids && task.workflow_ids.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    워크플로우
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{task.body}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>기한: {formatDate(task.due_date)}</span>
                    <span>•</span>
                  </div>
                )}
                <span>생성일: {formatDate(task.created_at)}</span>
                <span>•</span>
                <span>담당자: {task.assignee.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(task.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 