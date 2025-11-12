'use client';

import { notFound } from "next/navigation";
import { WorkflowEditor } from "@/components/workflow-builder/workflow-editor";
import useSWR from "swr";
import { use } from "react";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("워크플로우를 불러오는데 실패했습니다");
  }
  return res.json();
});

export default function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { data: workflow, error, isLoading } = useSWR(
    `/api/workflows/workflows/${resolvedParams.id}`,
    fetcher
  );

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

  if (!workflow) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{workflow.name}</h1>
        <p className="text-muted-foreground">{workflow.description}</p>
      </div>
      
      <WorkflowEditor initialWorkflow={workflow} />
    </div>
  );
} 