"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  SaveIcon, 
  TrashIcon, 
  XIcon,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
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

// Simple API fetcher
const useApi = () => {
  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error("Failed to fetch data")
    return res.json()
  }
  
  const update = async (url: string, data: any) => {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Failed to update data")
    return res.json()
  }
  
  const remove = async (url: string) => {
    const res = await fetch(url, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error("Failed to delete data")
    return res.ok
  }
  
  return { fetcher, update, remove }
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const api = useApi()
  const { id } = params
  
  // States
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    plan_type: "",
    price: 0,
    currency: "KRW",
    description: "",
    is_active: true
  })
  
  // Fetch product data
  const { data: product, error, isLoading, mutate } = useSWR<Product>(
    `/api/products/${id}/`,
    api.fetcher
  )
  
  // Update form data when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        plan_type: product.plan_type,
        price: product.price,
        currency: product.currency,
        description: product.description,
        is_active: product.is_active
      })
    }
  }, [product])
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    })
  }
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    })
  }
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name?.trim()) {
      errors.name = "상품명을 입력해주세요."
    }
    
    if (!formData.plan_type) {
      errors.plan_type = "결제 유형을 선택해주세요."
    }
    
    if (formData.price === undefined || formData.price <= 0) {
      errors.price = "유효한 가격을 입력해주세요."
    }
    
    if (!formData.currency) {
      errors.currency = "통화를 선택해주세요."
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Save product changes
  const handleSaveChanges = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      await api.update(`/api/products/${id}/`, formData)
      mutate()
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Delete product
  const handleDeleteProduct = async () => {
    setIsSubmitting(true)
    try {
      await api.remove(`/api/products/${id}/`)
      router.push('/dashboard/products')
    } catch (error) {
      console.error("Error deleting product:", error)
      setIsDeleteDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
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
      hour: "2-digit",
      minute: "2-digit"
    })
  }
  
  // Loading and error states
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>상품 정보를 불러오는 중...</p>
      </div>
    )
  }
  
  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XIcon className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-semibold mb-2">상품 정보를 불러오는데 실패했습니다</p>
        <Link href="/dashboard/products">
          <Button>상품 목록으로 돌아가기</Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">
              상품 ID: {product.id}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button 
                onClick={handleSaveChanges}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    저장
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                삭제
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                <PencilIcon className="mr-2 h-4 w-4" />
                수정
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isEditing ? "상품 정보 수정" : "상품 정보"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">상품명 <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={formErrors.name ? "border-destructive" : ""}
                    />
                    {formErrors.name && (
                      <p className="text-destructive text-sm">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="plan_type">결제 유형 <span className="text-destructive">*</span></Label>
                    <Select 
                      value={formData.plan_type} 
                      onValueChange={(value) => handleSelectChange("plan_type", value)}
                    >
                      <SelectTrigger id="plan_type" className={formErrors.plan_type ? "border-destructive" : ""}>
                        <SelectValue placeholder="결제 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {PLAN_TYPES.map((plan) => (
                          <SelectItem key={plan.value} value={plan.value}>
                            {plan.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.plan_type && (
                      <p className="text-destructive text-sm">{formErrors.plan_type}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price">가격 <span className="text-destructive">*</span></Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        className={formErrors.price ? "border-destructive" : ""}
                      />
                      {formErrors.price && (
                        <p className="text-destructive text-sm">{formErrors.price}</p>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="currency">통화 <span className="text-destructive">*</span></Label>
                      <Select 
                        value={formData.currency} 
                        onValueChange={(value) => handleSelectChange("currency", value)}
                      >
                        <SelectTrigger id="currency" className={formErrors.currency ? "border-destructive" : ""}>
                          <SelectValue placeholder="통화 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.currency && (
                        <p className="text-destructive text-sm">{formErrors.currency}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">상품 설명</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">상품명</p>
                      <p className="font-medium">{product.name}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">결제 유형</p>
                      <p className="font-medium">
                        {PLAN_TYPES.find(p => p.value === product.plan_type)?.label || product.plan_type}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">가격</p>
                      <p className="font-medium">{formatPrice(product.price, product.currency)}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">상태</p>
                      <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                        product.is_active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {product.is_active ? "활성" : "비활성"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">상품 설명</p>
                    <p className="whitespace-pre-wrap">
                      {product.description || "상품 설명이 없습니다."}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Product Info Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">추가 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">상품 ID</p>
                <p className="font-mono text-sm">{product.id}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">등록자</p>
                <p>{product.created_by.username}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">등록 일시</p>
                <p>{formatDate(product.created_at)}</p>
              </div>
              
              <Separator />
              
              {!isEditing && (
                <div className="pt-2">
                  <Button 
                    variant={product.is_active ? "destructive" : "default"}
                    className="w-full"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        is_active: !product.is_active
                      })
                      handleSaveChanges()
                    }}
                  >
                    {product.is_active ? "상품 비활성화" : "상품 활성화"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 이 상품을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 상품과 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 