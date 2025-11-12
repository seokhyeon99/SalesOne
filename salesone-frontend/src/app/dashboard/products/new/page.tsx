"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, SaveIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    name: "",
    plan_type: "",
    price: 0,
    currency: "krw",
    description: "",
    is_active: true
  })
  
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
    
    if (formData.price <= 0) {
      errors.price = "유효한 가격을 입력해주세요."
    }
    
    if (!formData.currency) {
      errors.currency = "통화를 선택해주세요."
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  // Create product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error("Failed to create product")
      }
      
      const data = await response.json()
      router.push(`/dashboard/products/${data.id}`)
    } catch (error) {
      console.error("Error creating product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">신규 상품 등록</h1>
      </div>
      
      <Separator />
      
      <form onSubmit={handleCreateProduct}>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">상품 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">상품명 <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={formErrors.name ? "border-destructive" : ""}
                  placeholder="예: 네이버 CPC 광고"
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">가격 <span className="text-destructive">*</span></Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={formErrors.price ? "border-destructive" : ""}
                    placeholder="예: 500000"
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
                  placeholder="상품에 대한 자세한 설명을 입력하세요."
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  className="form-checkbox h-4 w-4 text-primary rounded"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({
                    ...formData,
                    is_active: e.target.checked
                  })}
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  상품 즉시 활성화
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/dashboard/products">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              취소
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 h-4 w-4" />
                상품 저장
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 