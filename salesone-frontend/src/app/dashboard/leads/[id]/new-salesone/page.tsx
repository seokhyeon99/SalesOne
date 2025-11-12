"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Industry = {
  id: number;
  code: string;
  name: string;
};

type Lead = {
  id: number;
  name: string;
  owner: string;
  email: string;
  phone: string;
  homepage: string[];
  finance_revenue: number | null;
  employee: number;
  address: string;
  industry: Industry;
  corporation_number: string;
  business_number: string;
  industry_name: string;
  name_eng: string;
  handle_goods: string[];
  si_nm: string;
  sgg_nm: string;
  established_date: string;
  keywords: string[];
};

type Filters = {
  industry: string;
  has_email: boolean;
  has_homepage: boolean;
  has_phone: boolean;
  employee_min: string;
  employee_max: string;
  revenue_range: string;
  established_after: string;
  established_before: string;
  search: string;
  si_nm: string;
  sgg_nm: string;
};

type SearchResponse = {
  results: Lead[];
  count: number;
}

const initialFilters: Filters = {
  industry: "",
  has_email: false,
  has_homepage: false,
  has_phone: false,
  employee_min: "",
  employee_max: "",
  revenue_range: "",
  established_after: "",
  established_before: "",
  search: "",
  si_nm: "all",
  sgg_nm: "all",
};

export default function NewSalesOnePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [open, setOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [totalCount, setTotalCount] = useState(0);

  // Format currency
  const formatCurrency = (value: number | null) => {
    if (value === null || isNaN(value)) return "-";
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW"
    }).format(value);
  };

  // Fetch industries for filter
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch("/api/leads/industries");
        if (!response.ok) throw new Error("Failed to fetch industries");
        const data = await response.json();
        setIndustries(data.results);
      } catch (error) {
        toast.error("산업 목록을 불러오는데 실패했습니다");
      }
    };

    fetchIndustries();
  }, []);

  // Fetch regions for filter
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("/api/leads/leads/get_regions");
        if (!response.ok) throw new Error("Failed to fetch regions");
        const data = await response.json();
        setRegions(data.si_nm || []);
      } catch (error) {
        toast.error("지역 목록을 불러오는데 실패했습니다");
      }
    };

    fetchRegions();
  }, []);

  // Fetch districts when region changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (filters.si_nm === "all") {
        setDistricts([]);
        return;
      }

      try {
        const response = await fetch(`/api/leads/leads/get_regions?si_nm=${encodeURIComponent(filters.si_nm)}`);
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        setDistricts(data.sgg_nm || []);
      } catch (error) {
        toast.error("지역구 목록을 불러오는데 실패했습니다");
      }
    };

    fetchDistricts();
  }, [filters.si_nm]);

  // Search leads from SalesOne
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        page_size: pageSize.toString(),
      });
      
      // Add search parameter if it exists
      if (filters.search) {
        queryParams.append('company_name', filters.search);
      }
      
      // Handle region filters before adding other filters
      if (filters.si_nm && filters.si_nm !== "all") {
        queryParams.append('si_nm', filters.si_nm);
      }
      if (filters.sgg_nm && filters.sgg_nm !== "all") {
        queryParams.append('sgg_nm', filters.sgg_nm);
      }
      
      // Add other filters
      if (filters.has_email) queryParams.append('has_email', 'true');
      if (filters.has_homepage) queryParams.append('has_homepage', 'true');
      if (filters.has_phone) queryParams.append('has_phone', 'true');
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.employee_min) queryParams.append('employee_min', filters.employee_min);
      if (filters.employee_max) queryParams.append('employee_max', filters.employee_max);
      if (filters.established_after) queryParams.append('established_after', filters.established_after);
      if (filters.established_before) queryParams.append('established_before', filters.established_before);
      
      // Handle revenue range
      if (filters.revenue_range) {
        queryParams.append('revenue_range', filters.revenue_range);
      }

      const response = await fetch(`/api/leads/leads/search_salesone?${queryParams}`);
      if (!response.ok) throw new Error("Failed to search leads");
      const data: SearchResponse = await response.json();
      setLeads(data.results);
      setTotalCount(data.count);
    } catch (error) {
      toast.error("리드 검색에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to trigger search when pagination changes
  useEffect(() => {
    if (leads.length > 0 || Object.values(filters).some(value => value)) {
      handleSearch();
    }
  }, [pageIndex, pageSize]);

  // Import selected leads
  const handleImport = async () => {
    if (selectedLeads.length === 0) {
      toast.error("선택된 리드가 없습니다");
      return;
    }

    setIsImporting(true);
    try {
      // Import leads from SalesOne
      const importResponse = await fetch(`/api/leads/leads/import_from_salesone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: selectedLeads }),
      });

      if (!importResponse.ok) {
        const errorData = await importResponse.json();
        throw new Error(errorData.error || "Failed to import leads");
      }
      const importData = await importResponse.json();
      
      // Combine both new and existing leads
      const allLeadIds = [
        ...importData.results.map((lead: Lead) => lead.id),
        ...importData.existing_leads.map((lead: Lead) => lead.id)
      ];
      
      if (allLeadIds.length === 0) {
        throw new Error("No leads were imported or found.");
      }
      
      // Add all leads to the list
      const addResponse = await fetch(`/api/leads/lists/${resolvedParams.id}/add_leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: allLeadIds }),
      });

      if (!addResponse.ok) {
        const errorData = await addResponse.json();
        throw new Error(errorData.error || "Failed to add leads to list");
      }

      // Show appropriate success messages
      if (importData.count > 0) {
        toast.success(`${importData.count}개의 새로운 리드를 가져왔습니다`);
      }
      if (importData.existing_count > 0) {
        toast.success(`${importData.existing_count}개의 기존 리드를 리스트에 추가했습니다`);
      }
      if (importData.errors?.length > 0) {
        toast.warning(`${importData.errors.length}개의 리드는 가져오기에 실패했습니다`);
      }
      
      router.push(`/dashboard/leads/${resolvedParams.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "리드 가져오기에 실패했습니다");
    } finally {
      setIsImporting(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setLeads([]);
    setTotalCount(0);
    setPageIndex(0);
  };

  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              const pageRows = table.getRowModel().rows;
              if (value) {
                // Add all page rows to selectedLeads
                const pageLeadIds = pageRows.map((row) => row.original.id);
                setSelectedLeads((prev) => [...new Set([...prev, ...pageLeadIds])]);
              } else {
                // Remove all page rows from selectedLeads
                const pageLeadIds = new Set(pageRows.map((row) => row.original.id));
                setSelectedLeads((prev) => prev.filter((id) => !pageLeadIds.has(id)));
              }
            }}
            aria-label="전체 선택"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={selectedLeads.includes(row.original.id)}
            onCheckedChange={(value) => {
              if (value) {
                setSelectedLeads((prev) => [...prev, row.original.id]);
              } else {
                setSelectedLeads((prev) =>
                  prev.filter((id) => id !== row.original.id)
                );
              }
              row.toggleSelected(!!value);
            }}
            aria-label="행 선택"
          />
        </div>
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
      accessorKey: "finance_revenue",
      header: "매출액",
      cell: ({ row }) => formatCurrency(row.original.finance_revenue),
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
      accessorKey: "industry",
      header: "산업",
      cell: ({ row }) => row.original.industry?.name,
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/leads/${resolvedParams.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">SalesOne DB에서 리드 가져오기</h1>
      </div>

      <div className="space-y-6">
        {/* Search Field */}
        <div className="w-full">
          <Label>검색</Label>
          <Input
            type="text"
            placeholder="회사명으로 검색..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full"
          />
        </div>

        {/* Required Fields Checkboxes */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_email"
              checked={filters.has_email}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, has_email: checked as boolean })
              }
            />
            <Label htmlFor="has_email">이메일 있음</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_homepage"
              checked={filters.has_homepage}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, has_homepage: checked as boolean })
              }
            />
            <Label htmlFor="has_homepage">홈페이지 있음</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_phone"
              checked={filters.has_phone}
              onCheckedChange={(checked) =>
                setFilters({ ...filters, has_phone: checked as boolean })
              }
            />
            <Label htmlFor="has_phone">전화번호 있음</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>산업</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {filters.industry
                    ? industries.find((industry) => industry.code === filters.industry)?.name
                    : "산업 선택"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="산업 검색..." />
                  <CommandList>
                    <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setFilters({ ...filters, industry: "" });
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !filters.industry ? "opacity-100" : "opacity-0"
                          )}
                        />
                        전체
                      </CommandItem>
                      {industries.map((industry) => (
                        <CommandItem
                          key={industry.code}
                          onSelect={() => {
                            setFilters({ ...filters, industry: industry.code });
                            setOpen(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.industry === industry.code
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {industry.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Region Filters */}
          <div>
            <Label>지역</Label>
            <Select
              value={filters.si_nm}
              onValueChange={(value) => setFilters({ ...filters, si_nm: value, sgg_nm: "all" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>지역구</Label>
            <Select
              value={filters.sgg_nm}
              onValueChange={(value) => setFilters({ ...filters, sgg_nm: value })}
              disabled={filters.si_nm === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="지역구 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {districts.map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>직원 수</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="최소"
                value={filters.employee_min}
                onChange={(e) =>
                  setFilters({ ...filters, employee_min: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="최대"
                value={filters.employee_max}
                onChange={(e) =>
                  setFilters({ ...filters, employee_max: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <Label>매출 범위 (백만원)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="최소"
                value={filters.revenue_range.split(",")[0] || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    revenue_range: `${e.target.value},${
                      filters.revenue_range.split(",")[1] || ""
                    }`,
                  })
                }
              />
              <Input
                type="number"
                placeholder="최대"
                value={filters.revenue_range.split(",")[1] || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    revenue_range: `${
                      filters.revenue_range.split(",")[0] || ""
                    },${e.target.value}`,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>설립일</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.established_after}
                onChange={(e) =>
                  setFilters({ ...filters, established_after: e.target.value })
                }
              />
              <Input
                type="date"
                value={filters.established_before}
                onChange={(e) =>
                  setFilters({ ...filters, established_before: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center my-6">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            필터 초기화
          </Button>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            검색
          </Button>
        </div>
        <Button
          onClick={handleImport}
          disabled={selectedLeads.length === 0 || isImporting}
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          선택한 리드 가져오기 ({selectedLeads.length})
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <DataTable
            columns={columns}
            data={leads}
            pageCount={Math.ceil(totalCount / pageSize)}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onPaginationChange={(newPageIndex, newPageSize) => {
              setPageIndex(newPageIndex);
              setPageSize(newPageSize);
            }}
          />
        </div>
      </div>
    </div>
  );
} 