import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import useSWR from "swr"
import { fetcher } from "@/lib/utils"

interface WorkflowExecutionFormProps {
  workflowId: string
}

interface Client {
  id: string
  name: string
  representative_name: string
  emails: string[]
  phones: string[]
}

interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: {
    configOptions?: Array<{
      id: string
      name: string
      type: string
      description: string
    }>
  }
}

interface Workflow {
  id: string
  name: string
  nodes: Record<string, WorkflowNode>
  edges: any[]
}

interface ClientsResponse {
  results: Client[]
  count: number
}

export function WorkflowExecutionForm({ workflowId }: WorkflowExecutionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [triggerData, setTriggerData] = useState<Record<string, any>>({})

  // Fetch workflow details to get trigger node configuration
  const { data: workflow, error: workflowError } = useSWR<Workflow>(
    `/api/workflows/workflows/${workflowId}/`,
    fetcher
  )

  // Fetch clients for client selection
  const { data: clientsData, error: clientsError } = useSWR<ClientsResponse>(
    "/api/clients/clients/",
    fetcher
  )

  // Extract clients array from response
  const clients = clientsData?.results || []

  // Find trigger node from workflow nodes
  const triggerNode = workflow?.nodes ? 
    Object.values(workflow.nodes).find((node) => 
      node.type === "triggerNode" || node.type === "clientTrigger" || node.type === "eventTrigger"
    ) : undefined

  const handleClientChange = (value: string) => {
    setSelectedClient(value)
  }

  const handleInputChange = (key: string, value: any) => {
    setTriggerData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/workflows/workflows/${workflowId}/execute/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input_data: {
            client_id: selectedClient,
            ...triggerData
          }
        }),
      })

      if (!response.ok) {
        throw new Error("워크플로우 실행에 실패했습니다.")
      }

      const result = await response.json()

      toast.success("워크플로우 실행 성공", {
        description: "워크플로우가 성공적으로 실행되었습니다.",
      })

      // Navigate back to workflow detail page
      router.push(`/dashboard/workflows/${workflowId}`)
    } catch (error) {
      toast.error("오류", {
        description: error instanceof Error ? error.message : "워크플로우 실행 중 오류가 발생했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (workflowError || clientsError) {
    return <div>데이터를 불러오는 중 오류가 발생했습니다.</div>
  }

  if (!workflow || !clientsData) {
    return <div>로딩 중...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>고객 선택</Label>
          <Select value={selectedClient} onValueChange={handleClientChange}>
            <SelectTrigger>
              <SelectValue placeholder="고객을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} ({client.representative_name})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {triggerNode?.data?.configOptions?.map((option: any) => (
          <div key={option.id}>
            <Label>{option.name}</Label>
            {option.type === "text" ? (
              <Textarea
                value={triggerData[option.id] || ""}
                onChange={(e) => handleInputChange(option.id, e.target.value)}
                placeholder={option.description}
              />
            ) : (
              <Input
                type={option.type === "number" ? "number" : "text"}
                value={triggerData[option.id] || ""}
                onChange={(e) => handleInputChange(option.id, e.target.value)}
                placeholder={option.description}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/workflows/${workflowId}`)}
        >
          취소
        </Button>
        <Button type="submit" disabled={!selectedClient || isLoading}>
          {isLoading ? "실행 중..." : "실행"}
        </Button>
      </div>
    </form>
  )
} 