'use client';

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { WorkflowCard } from "./workflow-card";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WorkflowsPage() {
  const { data: workflows, error, isLoading, mutate } = useSWR("/api/workflows/workflows", fetcher);

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="text-destructive">워크플로우를 불러오는데 실패했습니다</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>로딩 중...</div>
      </div>
    );
  }

  const handleExecute = async (id: string) => {
    try {
      toast.info("워크플로우 실행 요청을 처리하고 있습니다...");
      
      const response = await fetch(`/api/workflows/workflows/${id}/execute`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success("워크플로우가 성공적으로 실행되었습니다");
        return result;
      } else {
        toast.error("워크플로우 실행에 실패했습니다");
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error("워크플로우 실행 중 오류가 발생했습니다");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말로 이 워크플로우를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/workflows/workflows/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Update local data after successful deletion
          mutate(
            workflows.filter((workflow: any) => workflow.id !== id),
            false
          );
          toast.success("워크플로우가 삭제되었습니다");
        } else {
          toast.error("워크플로우 삭제에 실패했습니다");
        }
      } catch (error) {
        console.error('Error deleting workflow:', error);
        toast.error("워크플로우 삭제 중 오류가 발생했습니다");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">워크플로우</h1>
          <p className="text-muted-foreground">
            업무를 자동화하는 워크플로우를 생성하고 관리하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/workflows/new">
            <Plus className="w-4 h-4 mr-2" />
            새 워크플로우
          </Link>
        </Button>
      </div>

      {workflows && workflows.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">등록된 워크플로우가 없습니다</p>
          <Button asChild>
            <Link href="/dashboard/workflows/new">
              <Plus className="w-4 h-4 mr-2" />
              워크플로우 만들기
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows && workflows.map((workflow: any) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onExecute={handleExecute}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
} 