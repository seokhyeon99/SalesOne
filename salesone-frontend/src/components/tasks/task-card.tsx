"use client";

import { Task } from "@/hooks/use-client-tasks";
import { TaskStatus } from "@/hooks/use-tasks-kanban";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, Clock, CheckCircle2, XCircle, CircleDashed } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ReactNode } from "react";

// Define colors and classes for each status
const statusConfig: Record<TaskStatus, { 
  borderClass: string, 
  hoverBorderClass: string, 
  hoverTextClass: string,
  icon: ReactNode
}> = {
  'not_started': {
    borderClass: 'border-blue-200',
    hoverBorderClass: 'group-hover:border-blue-300',
    hoverTextClass: 'group-hover:text-blue-700',
    icon: <CircleDashed className="h-3.5 w-3.5 text-blue-500" />
  },
  'in_progress': {
    borderClass: 'border-amber-200',
    hoverBorderClass: 'group-hover:border-amber-300',
    hoverTextClass: 'group-hover:text-amber-700',
    icon: <Clock className="h-3.5 w-3.5 text-amber-500" />
  },
  'completed': {
    borderClass: 'border-green-200',
    hoverBorderClass: 'group-hover:border-green-300',
    hoverTextClass: 'group-hover:text-green-700',
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
  },
  'failed': {
    borderClass: 'border-red-200',
    hoverBorderClass: 'group-hover:border-red-300',
    hoverTextClass: 'group-hover:text-red-700',
    icon: <XCircle className="h-3.5 w-3.5 text-red-500" />
  },
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  status: TaskStatus;
}

export function TaskCard({ task, onClick, status }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: {
      task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  // Get the configuration for this status
  const config = statusConfig[status];

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`p-4 mb-3 cursor-pointer border ${config.borderClass} ${config.hoverBorderClass} group transition-all 
                hover:shadow-md ${isDragging ? 'shadow-lg opacity-75' : 'shadow'} bg-white`}
      onClick={(e) => {
        // Only trigger onClick if the card is clicked, not when being dragged
        if (!isDragging) onClick();
      }}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className={`font-medium text-gray-800 truncate ${config.hoverTextClass} transition-colors`}>
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
        
        <div className="flex flex-col items-start justify-between text-xs border-t border-gray-100 pt-2 mt-2">
          <div className="flex items-center text-gray-600 gap-1">
            {config.icon}
            <span className="font-medium">{task.assignee?.email}</span>
          </div>
          
          {task.due_date && (
            <div className="flex items-center text-gray-400 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(task.due_date)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
} 