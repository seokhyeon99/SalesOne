"use client";

import { WorkflowEditor } from "@/components/workflow-builder/workflow-editor";

export default function NewWorkflowPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">새 워크플로우</h1>
        <p className="text-muted-foreground">
          새로운 워크플로우를 생성하세요
        </p>
      </div>
      
      <WorkflowEditor />
    </div>
  );
} 