import { Metadata } from "next"

export const metadata: Metadata = {
  title: "상품 관리 | SalesOne",
  description: "SalesOne 상품을 관리하고 판매 상품을 등록, 수정, 삭제할 수 있습니다.",
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4">
      {children}
    </div>
  )
} 