"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

type Industry = {
  id: number;
  code: string;
  name: string;
};

export default function NewLeadPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    corporation_number: "",
    business_number: "",
    owner: "",
    email: "",
    phone: "",
    homepage: "",
    employee: "",
    revenue: "",
    address: "",
    si_nm: "",
    sgg_nm: "",
    established_date: "",
    industry: "",
  });

  // Fetch industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const response = await fetch("/api/leads/industries");
        const data = await response.json();
        setIndustries(data.results);
      } catch (error) {
        toast.error("산업 목록을 불러오는데 실패했습니다");
      }
    };

    fetchIndustries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create lead and add to list in one request
      const response = await fetch("/api/leads/leads/create_and_add_to_list/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lead_list_id: params.id,
          // Convert string values to numbers where needed
          employee: formData.employee ? parseInt(formData.employee) : null,
          revenue: formData.revenue ? parseInt(formData.revenue) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "리드 생성에 실패했습니다");
      }

      toast.success("리드가 생성되었습니다");
      router.push(`/dashboard/leads/${params.id}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("리드 생성에 실패했습니다");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/leads/${params.id}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">새 리드 추가</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid gap-4">
          <div>
            <Label htmlFor="name">회사명 *</Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="corporation_number">법인번호 *</Label>
              <Input
                id="corporation_number"
                name="corporation_number"
                required
                value={formData.corporation_number}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="business_number">사업자등록번호</Label>
              <Input
                id="business_number"
                name="business_number"
                value={formData.business_number}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="owner">대표자</Label>
            <Input
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="homepage">웹사이트</Label>
            <Input
              id="homepage"
              name="homepage"
              type="url"
              value={formData.homepage}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">직원 수</Label>
              <Input
                id="employee"
                name="employee"
                type="number"
                value={formData.employee}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="revenue">매출 (원)</Label>
              <Input
                id="revenue"
                name="revenue"
                type="number"
                value={formData.revenue}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="industry">산업</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, industry: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="산업 선택" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry.code} value={industry.code}>
                    {industry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="established_date">설립일</Label>
            <Input
              id="established_date"
              name="established_date"
              type="date"
              value={formData.established_date}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="si_nm">시/도</Label>
              <Input
                id="si_nm"
                name="si_nm"
                value={formData.si_nm}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="sgg_nm">구/군</Label>
              <Input
                id="sgg_nm"
                name="sgg_nm"
                value={formData.sgg_nm}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/leads/${params.id}`)}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
} 