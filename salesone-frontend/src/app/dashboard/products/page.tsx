"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PlusIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon, Loader2 } from "lucide-react"
import Link from "next/link"

// Custom heading component since it seems to be missing
const Heading = ({ title, description }: { title: string, description: string }) => (
  <div>
    <h1 className="text-2xl font-bold">{title}</h1>
    <p className="text-muted-foreground">{description}</p>
  </div>
)

interface Product {
  id: string
  name: string
  plan_type: string
  price: number
  currency: string
  description: string
  is_active: boolean
  created_at: string
  created_by: {
    id: string
    username: string
  }
}

const PLAN_TYPES = [
  { value: "monthly", label: "매월결제" },
  { value: "weekly", label: "매주결제" },
  { value: "one_time", label: "일반결제" },
]

const CURRENCIES = [
  { value: "krw", label: "원화 (KRW)" },
  { value: "usd", label: "미국 달러 (USD)" },
  { value: "eur", label: "유로 (EUR)" },
  { value: "jpy", label: "일본 엔 (JPY)" },
]

// Simple API fetcher since useApi is missing
const useApi = () => {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
  }
  
  const patch = async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Failed to update data")
    return res.json()
  }
  
  return { fetcher, patch }
}

export default function ProductsPage() {
  const api = useApi()
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("")
  const [planTypeFilter, setPlanTypeFilter] = useState<string>("all")
  const [currencyFilter, setCurrencyFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [sortBy, setSortBy] = useState<string>("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Build query string based on filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams()
    
    if (searchQuery) params.append("search", searchQuery)
    if (planTypeFilter && planTypeFilter !== "all") params.append("plan_type", planTypeFilter)
    if (currencyFilter && currencyFilter !== "all") params.append("currency", currencyFilter)
    if (activeFilter !== null) params.append("is_active", activeFilter.toString())
    
    params.append("ordering", sortOrder === "asc" ? sortBy : `-${sortBy}`)
    
    return params.toString()
  }, [searchQuery, planTypeFilter, currencyFilter, activeFilter, sortBy, sortOrder])
  
  // Fetch products with SWR
  const { data, error, isLoading, mutate } = useSWR<{ results: Product[], count: number }>(
    `/api/products/?${buildQueryString()}`,
    api.fetcher
  )
  
  // Handle filter reset
  const resetFilters = () => {
    setSearchQuery("")
    setPlanTypeFilter("all")
    setCurrencyFilter("all")
    setActiveFilter(null)
    setSortBy("created_at")
    setSortOrder("desc")
  }

  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    const currencyUpper = currency.toUpperCase();
    if (currencyUpper === "KRW") {
      return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(price)
    } else if (currencyUpper === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
    } else if (currencyUpper === "EUR") {
      return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(price)
    } else if (currencyUpper === "JPY") {
      return new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }).format(price)
    }
    return `${price} ${currencyUpper}`
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Toggle product active status
  const toggleProductStatus = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/api/products/${id}/toggle_active/`, {})
      mutate()
    } catch (error) {
      console.error("Error toggling product status:", error)
    }
  }

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Heading title="상품 관리" description="판매 상품을 등록하고 관리합니다" />
        <Link href="/dashboard/products/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            신규 상품 등록
          </Button>
        </Link>
      </div>
      
      <Separator />
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            필터 및 정렬
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">상품명 검색</Label>
              <Input
                id="search"
                placeholder="상품명 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-type">결제 유형</Label>
              <Select value={planTypeFilter} onValueChange={setPlanTypeFilter}>
                <SelectTrigger id="plan-type">
                  <SelectValue placeholder="모든 결제 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 결제 유형</SelectItem>
                  {PLAN_TYPES.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">통화</Label>
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="모든 통화" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 통화</SelectItem>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="active"
                checked={activeFilter === true}
                onCheckedChange={(checked) => {
                  if (checked) setActiveFilter(true)
                  else if (activeFilter === true) setActiveFilter(null)
                  else setActiveFilter(true)
                }}
              />
              <Label htmlFor="active">활성 상품만</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="inactive"
                checked={activeFilter === false}
                onCheckedChange={(checked) => {
                  if (checked) setActiveFilter(false)
                  else if (activeFilter === false) setActiveFilter(null)
                  else setActiveFilter(false)
                }}
              />
              <Label htmlFor="inactive">비활성 상품만</Label>
            </div>
            
            <Button variant="outline" onClick={resetFilters} className="ml-auto">
              필터 초기화
            </Button>
          </div>
          
          <div className="mt-4">
            <Label>정렬 기준</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                variant={sortBy === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("name")}
                className="flex items-center"
              >
                상품명
                {sortBy === "name" && (
                  sortOrder === "asc" ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant={sortBy === "price" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("price")}
                className="flex items-center"
              >
                가격
                {sortBy === "price" && (
                  sortOrder === "asc" ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant={sortBy === "created_at" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("created_at")}
                className="flex items-center"
              >
                등록일
                {sortBy === "created_at" && (
                  sortOrder === "asc" ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Products List */}
      <div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">상품 목록을 불러오는 중...</span>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-destructive">
                <p>상품 목록을 불러오는 중 오류가 발생했습니다.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => mutate()}
                >
                  다시 시도
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : data?.results.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">등록된 상품이 없습니다.</p>
                <Link href="/dashboard/products/new">
                  <Button className="mt-4">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    신규 상품 등록
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.results.map((product) => (
              <Card key={product.id} className={product.is_active ? "" : "opacity-70"}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{product.name}</CardTitle>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {product.is_active ? "활성" : "비활성"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="text-sm text-muted-foreground">결제 유형</div>
                      <div className="text-sm font-medium">
                        {PLAN_TYPES.find(p => p.value === product.plan_type)?.label || product.plan_type}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="text-sm text-muted-foreground">가격</div>
                      <div className="text-sm font-medium">
                        {formatPrice(product.price, product.currency)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="text-sm text-muted-foreground">등록자</div>
                      <div className="text-sm font-medium truncate">
                        {product.created_by.username}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-2">
                      <div className="text-sm text-muted-foreground">등록일</div>
                      <div className="text-sm font-medium">
                        {formatDate(product.created_at)}
                      </div>
                    </div>
                    
                    {product.description && (
                      <div className="mt-2 pt-2 border-t">
                        <div className="text-sm text-muted-foreground mb-1">설명</div>
                        <p className="text-sm line-clamp-2">{product.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleProductStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? "비활성화" : "활성화"}
                    </Button>
                    
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button size="sm">상세 보기</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {data && data.results.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              총 {data.count}개의 상품
            </div>
            
            {/* Add pagination here if needed */}
          </div>
        )}
      </div>
    </div>
  )
} 