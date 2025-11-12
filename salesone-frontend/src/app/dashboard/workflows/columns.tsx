import { ColumnDef } from "@tanstack/react-table";
import { Workflow } from "@/types/workflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Play, Trash } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { mutate } from "swr";

async function deleteWorkflow(id: string) {
  const response = await fetch(`/api/workflows/workflows/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("워크플로우 삭제에 실패했습니다");
  }

  // Revalidate the workflows list
  mutate("/api/workflows/workflows");
}

export const columns: ColumnDef<Workflow>[] = [
  {
    accessorKey: "name",
    header: "이름",
    cell: ({ row }) => {
      return (
        <Link 
          href={`/dashboard/workflows/${row.original.id}`}
          className="hover:underline"
        >
          {row.getValue("name")}
        </Link>
      );
    },
  },
  {
    accessorKey: "description",
    header: "설명",
  },
  {
    accessorKey: "is_active",
    header: "상태",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "활성화" : "비활성화"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "생성일",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const workflow = row.original;

      const handleDelete = async () => {
        try {
          if (confirm("워크플로우를 삭제하시겠습니까?")) {
            await deleteWorkflow(workflow.id);
          }
        } catch (error) {
          console.error("Error deleting workflow:", error);
          alert("워크플로우 삭제에 실패했습니다");
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/workflows/${workflow.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                수정
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/workflows/${workflow.id}/execute`}>
                <Play className="mr-2 h-4 w-4" />
                실행
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={handleDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 