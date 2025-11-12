"use client"

import { useEffect, useState } from "react"
import { Header } from "./header"
import { AppSidebar } from "./sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
// Define CSS variables for header height and sidebar width
import "@/styles/layout.css"

interface MainLayoutProps {
  children: React.ReactNode
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar()
  
  return (
    <div className={`transition-all duration-200 ease-in-out ${state === "expanded" ? "pl-[var(--sidebar-width)]" : "pl-[var(--sidebar-collapsed-width)]"}`}>
      <Header />
      <main className="min-h-[calc(100vh-var(--header-height))] px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-t-2 border-b-2 border-primary animate-spin mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="group/sidebar-wrapper w-full">
        <AppSidebar className="fixed bottom-0 left-0 top-0 z-30" />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  )
} 