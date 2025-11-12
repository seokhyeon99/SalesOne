import { ColumnDef } from "@tanstack/react-table"
import { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ClientDialog } from "@/components/clients/client-dialog"
import { useClientActions } from "@/hooks/use-client-actions"
import { formatDate } from "@/lib/utils"

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "회사명",
  },
  {
    accessorKey: "representative_name",
    header: "대표자명",
  },
  {
    accessorKey: "emails",
    header: "이메일",
    cell: ({ row }) => row.original.emails[0],
  },
  {
    accessorKey: "phones",
    header: "전화번호",
    cell: ({ row }) => row.original.phones[0],
  },
  {
    accessorKey: "created_at",
    header: "등록일",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original
      const { deleteClient } = useClientActions()

      const handleDelete = async () => {
        if (confirm("정말로 이 고객을 삭제하시겠습니까?")) {
          try {
            await deleteClient(client.id)
          } catch (error) {
            console.error("Failed to delete client:", error)
          }
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>작업</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <ClientDialog
                mode="edit"
                client={client}
                trigger={
                  <button className="w-full text-left">수정</button>
                }
              />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleDelete}
            >
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
] 