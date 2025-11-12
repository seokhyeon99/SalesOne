import { Metadata } from "next"
import { MainLayout } from "@/components/layout/main-layout"

export const metadata: Metadata = {
  title: "SalesOne - 영업 자동화 플랫폼",
  description: "SalesOne으로 영업의 전 과정을 통합하고 자동화하여 영업 성과를 극대화하세요.",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MainLayout>
      <div className="flex-1 p-6">
        {children}
      </div>
    </MainLayout>
  )
} 