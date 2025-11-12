import { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useClientActions } from "@/hooks/use-client-actions"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ClientDialog } from "./client-dialog"
import { useState } from "react"
import { ClientEditDialog } from './client-edit-dialog'

interface ClientHeaderProps {
  client: Client
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const router = useRouter()
  const { deleteClient } = useClientActions()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleDelete = async () => {
    try {
      await deleteClient(client.id)
      toast.success("고객이 삭제되었습니다")
      router.push("/clients")
    } catch (error) {
      toast.error("고객 삭제에 실패했습니다")
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>대표자: {client.representative_name}</p>
              {client.business_number && <p>사업자등록번호: {client.business_number}</p>}
              {client.address && <p>주소: {client.address}</p>}
              {client.website && (
                <p>
                  웹사이트:
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {client.website}
                  </a>
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">더보기 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600"
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <ClientEditDialog
        client={client}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
    </Card>
  )
} 