"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  Plus,
  Search,
  Trash2,
  Check,
  ChevronsUpDown,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface Lead {
  id: string
  corporation_number: string
  business_number: string
  name: string
  owner: string
  email: string
  phone: string
  homepage: string[]
  employee: number
  revenue: number
  address: string
  si_nm: string
  sgg_nm: string
  established_date: string
  industry: {
    id: string
    code: string
    name: string
  } | null
  created_at: string
  updated_at: string
  created_by?: {
    id: string
    username: string
  }
}

type LeadList = {
  id: number
  name: string
  description?: string
  leads: Lead[]
  count: number
}

// Format revenue
const formatRevenue = (revenue: number) => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW"
  }).format(revenue)
}

export default function LeadListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { id } = resolvedParams
  
  // States
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(100)
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch lead list details with SWR
  const { data: leadList, error, isLoading, mutate } = useSWR<LeadList>(
    `/api/leads/lists/${id}?page=${pageIndex + 1}&page_size=${pageSize}&search=${debouncedSearchQuery}`,
    async (url: string) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch data")
      return res.json()
    }
  )

  // Remove lead from list
  const handleRemoveLead = async (leadId: string) => {
    try {
      const response = await fetch(`/api/leads/lists/${id}/remove_leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: [leadId] }),
      })

      if (!response.ok) throw new Error("리드 제거에 실패했습니다")

      toast.success("리드가 제거되었습니다")
      mutate()
    } catch (error) {
      toast.error("리드 제거에 실패했습니다")
    }
    setIsDeleteDialogOpen(false)
    setSelectedLead(null)
  }

  // Bulk remove leads
  const handleBulkRemoveLeads = async () => {
    if (!selectedLeads.length) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/leads/lists/${id}/remove_leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: selectedLeads }),
      })

      if (!response.ok) throw new Error("리드 제거에 실패했습니다")

      toast.success(`${selectedLeads.length}개의 리드가 제거되었습니다`)
      setSelectedLeads([])
      mutate()
    } catch (error) {
      toast.error("리드 제거에 실패했습니다")
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value)
            const rowIds = table.getRowModel().rows.map(row => row.original.id)
            if (value) {
              setSelectedLeads(prev => [...new Set([...prev, ...rowIds])])
            } else {
              setSelectedLeads(prev => prev.filter(id => !rowIds.includes(id)))
            }
          }}
          aria-label="전체 선택"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedLeads.includes(row.original.id)}
          onCheckedChange={(value) => {
            if (value) {
              setSelectedLeads(prev => [...prev, row.original.id])
            } else {
              setSelectedLeads(prev => prev.filter(id => id !== row.original.id))
            }
            row.toggleSelected(!!value)
          }}
          aria-label="행 선택"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "회사명",
    },
    {
      accessorKey: "owner",
      header: "대표자",
    },
    {
      accessorKey: "email",
      header: "이메일",
    },
    {
      accessorKey: "homepage",
      header: "웹사이트",
      cell: ({ row }) => {
        const homepages = row.original.homepage
        if (!homepages || homepages.length === 0) return "-"
        
        // Clean up the homepage URL (remove quotes and trailing slashes)
        const homepage = homepages[0].replace(/^"|"$/g, '').replace(/\/$/, '')
        if (!homepage) return "-"
        
        return (
          <a 
            href={homepage.includes('://') ? homepage : `https://${homepage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {homepage}
          </a>
        )
      },
    },
    {
      accessorKey: "phone",
      header: "전화번호",
    },
    {
      accessorKey: "revenue",
      header: "매출액",
      cell: ({ row }) => row.original.revenue ? formatRevenue(row.original.revenue) : "-",
    },
    {
      accessorKey: "employee",
      header: "직원수",
      cell: ({ row }) => `${row.original.employee}명`,
    },
    {
      accessorKey: "address",
      header: "주소",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate">
          {row.original.address}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedLead(row.original)
            setIsDeleteDialogOpen(true)
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      ),
    },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4">리드 정보를 불러오는 중...</p>
      </div>
    )
  }

  // Error state
  if (error || !leadList) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive font-semibold mb-2">리드 정보를 불러오는데 실패했습니다</p>
        <Link href="/dashboard/leads">
          <Button>리드 목록으로 돌아가기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/leads">
            <ArrowLeftIcon className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{leadList.name}</h1>
          {leadList.description && (
            <p className="text-sm text-muted-foreground">{leadList.description}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mb-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="리드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          {selectedLeads.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {selectedLeads.length}개 삭제
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/leads/${id}/new`}>
              <Plus className="w-4 h-4 mr-2" />
              수동 추가
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/leads/${id}/new-salesone`}>
              <Plus className="w-4 h-4 mr-2" />
              SalesOne DB에서 추가
            </Link>
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={leadList.leads}
        pageCount={Math.ceil(leadList.count / pageSize)}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPaginationChange={(newPageIndex, newPageSize) => {
          setPageIndex(newPageIndex)
          setPageSize(newPageSize)
        }}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리드 제거</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedLeads.length > 0 ? (
                <>
                  선택한 {selectedLeads.length}개의 리드를 리스트에서 제거하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </>
              ) : (
                <>
                  정말로 이 리드를 리스트에서 제거하시겠습니까?
                  <br />
                  이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedLeads.length > 0) {
                  handleBulkRemoveLeads()
                } else if (selectedLead) {
                  handleRemoveLead(selectedLead.id)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              제거
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 