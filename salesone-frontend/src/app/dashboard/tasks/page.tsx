"use client";

import { useState, useEffect, useRef } from "react";
import { useTasksKanban, STATUS_COLUMNS, TaskStatus } from "@/hooks/use-tasks-kanban";
import { TaskColumn } from "@/components/tasks/task-column";
import { TaskDragOverlay } from "@/components/tasks/task-drag-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/hooks/use-client-tasks";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { 
  DndContext, 
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay 
} from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

// Task detail drawer component to be implemented
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

// Helper type to track workflow task status
type WorkflowTaskState = {
  [taskId: string]: {
    name: string;
    status: TaskStatus;
  }
};

export default function TasksPage() {
  const { statusGroups, isLoading, updateTaskStatus, deleteTask } = useTasksKanban();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentOverId, setCurrentOverId] = useState<string | null>(null);
  
  // Store the previous workflow task states to detect changes
  const workflowTasksRef = useRef<WorkflowTaskState>({});

  // Monitor status changes in workflow tasks
  useEffect(() => {
    if (isLoading || !statusGroups) return;
    
    // Create a map of current workflow tasks
    const currentWorkflowTasks: WorkflowTaskState = {};
    
    // Find all workflow tasks across all status groups
    Object.values(statusGroups).flat().forEach(task => {
      if (task.workflow_ids && task.workflow_ids.length > 0) {
        currentWorkflowTasks[task.id] = {
          name: task.name,
          status: task.status as TaskStatus
        };
      }
    });
    
    // Check for workflow tasks that have changed from in_progress to completed
    Object.entries(currentWorkflowTasks).forEach(([taskId, currentState]) => {
      const prevState = workflowTasksRef.current[taskId];
      
      if (
        prevState && 
        prevState.status === 'in_progress' && 
        currentState.status === 'completed'
      ) {
        // This task has changed from in_progress to completed
        toast.success(`${currentState.name} 워크플로우가 실행되었습니다`, {
          duration: 5000,
          position: 'top-center'
        });
      }
    });
    
    // Update the reference for next comparison
    workflowTasksRef.current = currentWorkflowTasks;
  }, [statusGroups, isLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    
    setActiveId(id);
    
    // Find the task being dragged
    let foundTask = null;
    for (const status in statusGroups) {
      const task = statusGroups[status as TaskStatus].find(t => t.id === id);
      if (task) {
        foundTask = task;
        break;
      }
    }
    
    if (foundTask) {
      setActiveTask(foundTask);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Only update status if dropped over a column and it's different from the current status
    if (over && activeTask) {
      const activeId = active.id as string;
      const overId = over.id as string;
      
      // Check if the over element is a column
      const isOverAColumn = STATUS_COLUMNS.some(col => col.key === overId);
      
      if (isOverAColumn && activeTask.status !== overId) {
        // Update the task status on drag end (mouse release)
        updateTaskStatus(activeId, overId as TaskStatus);
      }
    }
    
    // Reset state
    setActiveId(null);
    setActiveTask(null);
    setCurrentOverId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    // Just track what we're over, but don't update status yet
    if (over) {
      setCurrentOverId(over.id as string);
    } else {
      setCurrentOverId(null);
    }
  };

  const handleTaskSelected = (taskId: string) => {
    setSelectedTaskId(taskId);
    setDetailDialogOpen(true);
  };
  
  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    
    if (!confirm('정말로 이 작업을 삭제하시겠습니까?')) {
      return;
    }
    
    setDeleting(true);
    try {
      const success = await deleteTask(selectedTaskId);
      if (success) {
        setDetailDialogOpen(false);
        setSelectedTaskId(null);
      }
    } finally {
      setDeleting(false);
    }
  };

  // Find the selected task across all status groups
  const selectedTask = selectedTaskId ? 
    Object.values(statusGroups).flat().find(task => task.id === selectedTaskId) : 
    null;

  // Status icon map for the detail dialog
  const statusIconMap = {
    'not_started': <CircleDashed className="h-4 w-4 text-blue-500" />,
    'in_progress': <Clock className="h-4 w-4 text-amber-500" />,
    'completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
    'failed': <XCircle className="h-4 w-4 text-red-500" />
  };

  return (
    <div 
      className="py-10 min-h-screen" 
      style={{ 
        backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0',
      }}
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8 px-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">할 일 관리</h1>
            <p className="text-gray-500 mt-1">할 일을 단계별로 관리하고 진행 상황을 추적할 수 있습니다.</p>
          </div>
          <AddTaskDialog clientId="" />
        </div>

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <div className="grid grid-cols-4 gap-6 px-4">
            {isLoading
              ? STATUS_COLUMNS.map((column, index) => (
                  <Card key={index} className="min-h-[80vh] border-0 shadow-lg bg-white bg-opacity-70 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">
                        <Skeleton className="h-6 w-28" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <Skeleton className="h-4 w-full" />
                      </div>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full mb-3" />
                      ))}
                    </CardContent>
                  </Card>
                ))
              : STATUS_COLUMNS.map((column) => (
                  <SortableContext key={column.key} items={statusGroups[column.key].map(task => task.id)}>
                    <TaskColumn
                      title={column.title}
                      status={column.key}
                      tasks={statusGroups[column.key]}
                      onSelect={handleTaskSelected}
                      count={statusGroups[column.key].length}
                      isActive={currentOverId === column.key}
                    />
                  </SortableContext>
                ))}
          </div>
          
          <DragOverlay>
            {activeTask && <TaskDragOverlay task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedTask.name}</DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                {/* Status + Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIconMap[selectedTask.status as TaskStatus]}
                    <span className="font-medium">
                      {STATUS_COLUMNS.find(col => col.key === selectedTask.status)?.title || selectedTask.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedTask.is_repetitive && (
                      <Badge variant="outline">반복</Badge>
                    )}
                    {selectedTask.workflow_ids && selectedTask.workflow_ids.length > 0 && (
                      <Badge variant="secondary">워크플로우</Badge>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium mb-2">설명</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTask.body}</p>
                </div>
                
                {/* Metadata */}
                <div className="border-t pt-4 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">담당자</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedTask.assignee.email}</span>
                    </div>
                  </div>
                  
                  {selectedTask.due_date && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">기한</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(selectedTask.due_date)}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">생성일</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(selectedTask.created_at)}</span>
                    </div>
                  </div>
                  
                  {selectedTask.client && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">연결된 고객</h3>
                      <div className="flex items-center gap-2 text-sm">
                        <span>
                          {typeof selectedTask.client === 'object' 
                            ? (selectedTask.client as any).name || (selectedTask.client as any).representative_name 
                            : selectedTask.client}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleDeleteTask}
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deleting ? '삭제 중...' : '삭제'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 