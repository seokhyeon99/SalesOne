"use client";

import { Task } from "@/hooks/use-client-tasks";
import { TaskStatus } from "@/hooks/use-tasks-kanban";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onSelect: (taskId: string) => void;
  count: number;
  isActive?: boolean;
}

// Map status to color
const statusColors: Record<TaskStatus, string> = {
  'not_started': 'bg-blue-500',
  'in_progress': 'bg-amber-500',
  'completed': 'bg-green-500',
  'failed': 'bg-red-500',
};

export function TaskColumn({
  title,
  status,
  tasks,
  onSelect,
  count,
  isActive = false,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  return (
    <Card 
      className={cn(
        "min-h-[80vh] border-0 shadow-lg bg-white bg-opacity-90 backdrop-blur-sm transition-all",
        isOver && "ring-2 ring-primary",
        isActive && !isOver && "ring-2 ring-primary/50"
      )}
      ref={setNodeRef}
    >
      <div className={`h-1.5 w-full ${statusColors[status]} rounded-t-lg`} />
      <CardHeader className="pb-2 pt-5">
        <CardTitle className="text-base font-medium flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${statusColors[status]} mr-2`} />
            <span className="text-gray-800">{title}</span>
          </div>
          <span className="text-sm font-normal py-0.5 px-2 rounded-full bg-gray-100 text-gray-600">
            {count}개
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {count === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            이 단계에 작업이 없습니다.<br />
            카드를 드래그하여 이동할 수 있습니다.
          </div>
        ) : (
          <div className="space-y-3 max-h-[calc(80vh-140px)] overflow-y-auto pr-1 -mr-1 pt-1">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onSelect(task.id)}
                status={status}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 