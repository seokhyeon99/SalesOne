"use client"

import { use } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { WorkflowExecutionForm } from "@/components/workflow-builder/workflow-execution-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WorkflowExecutePage({ params }: PageProps) {
  const resolvedParams = use(params)
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">워크플로우 실행</h1>
      </div>
      
      <Card className="p-6">
        <WorkflowExecutionForm workflowId={resolvedParams.id} />
      </Card>
    </div>
  )
} 