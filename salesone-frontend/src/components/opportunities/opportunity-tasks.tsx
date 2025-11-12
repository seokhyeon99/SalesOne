"use client";

import { useState } from "react";
import { useOpportunityTasks } from "@/hooks/use-opportunity-tasks";
import { OpportunityTask } from "@/types/opportunity-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Check, Clock, Loader2, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OpportunityTasksProps {
  opportunityId: string;
}

export function OpportunityTasks({ opportunityId }: OpportunityTasksProps) {
  const { tasks, isLoading, updateTaskStatus, createTask, deleteTask } = useOpportunityTasks(opportunityId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", body: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  const handleStatusChange = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleAddTask = () => {
    setIsSubmitting(true);
    createTask(newTask.title, newTask.body);
    setNewTask({ title: "", body: "" });
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
  };

  const handleDeleteTask = () => {
    if (selectedTaskId) {
      deleteTask(selectedTaskId);
      setSelectedTaskId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status (pending first, then in_progress, then completed)
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    const statusDiff = statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
    if (statusDiff !== 0) return statusDiff;
    
    // Then sort by date (newest first)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">업무</h3>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              업무 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 업무 추가</DialogTitle>
              <DialogDescription>
                새로운 업무를 추가하세요. 완료 후 저장을 클릭하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="업무 제목을 입력하세요"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">내용</Label>
                <Textarea
                  id="body"
                  placeholder="업무 내용을 입력하세요"
                  rows={4}
                  value={newTask.body}
                  onChange={(e) => setNewTask({...newTask, body: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAddTask}
                disabled={!newTask.title || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          등록된 업무가 없습니다.
        </div>
      ) : (
        sortedTasks.map((task) => (
          <div
            key={task.id}
            className="flex gap-4 p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-shrink-0 mt-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full"
                onClick={() => handleStatusChange(task.id)}
              >
                {task.status === 'completed' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : task.status === 'in_progress' ? (
                  <Clock className="h-5 w-5 text-amber-500" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </Button>
            </div>
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-2">
                  <time className="text-sm text-gray-500">
                    {formatDate(task.created_at)}
                  </time>
                  <AlertDialog open={isDeleteDialogOpen && selectedTaskId === task.id} onOpenChange={(open) => {
                    setIsDeleteDialogOpen(open);
                    if (!open) setSelectedTaskId(null);
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-red-500"
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>업무 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          이 업무를 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTask}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {task.body && (
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {task.body}
                </p>
              )}
              <p className="text-sm text-gray-500">
                담당자: {task.created_by}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 