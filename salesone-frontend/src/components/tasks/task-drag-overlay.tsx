"use client";

import { Task } from "@/hooks/use-client-tasks";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface TaskDragOverlayProps {
  task: Task;
}

export function TaskDragOverlay({ task }: TaskDragOverlayProps) {
  return (
    <Card className="p-4 shadow-lg bg-white w-[300px] border-2 border-primary border-dashed">
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-800 truncate">
            {task.name}
          </h3>
          <div className="flex gap-1">
            {task.is_repetitive && (
              <Badge variant="outline" className="shrink-0 font-medium border-gray-200 bg-gray-50">
                반복
              </Badge>
            )}
            {task.workflow_ids && task.workflow_ids.length > 0 && (
              <Badge variant="secondary" className="shrink-0 font-medium">
                워크플로우
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2">{task.body}</p>
        
        <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2 mt-2">
          <div className="text-gray-600 font-medium">
            {task.assignee?.email}
          </div>
          
          {task.due_date && (
            <div className="flex items-center text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 