"use client"

import Link from "next/link"
import { 
  IconBoxSeam,
  IconBuildingStore,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconMail,
  IconPlus,
  IconSettings, 
  IconUsers,
  IconUserCircle,
  IconListCheck,
  IconBrandCodecov
} from "@tabler/icons-react"

import {
  Sidebar as UISidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

const navItems = [
  {
    title: "대시보드",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "상품",
    url: "/dashboard/products",
    icon: IconBoxSeam,
  },
  {
    title: "리드",
    url: "/dashboard/leads",
    icon: IconUsers,
  },
  {
    title: "캠페인",
    url: "/dashboard/campaigns",
    icon: IconMail,
  },
  {
    title: "잠재고객",
    url: "/dashboard/opportunities",
    icon: IconUserCircle,
  },
  {
    title: "고객",
    url: "/dashboard/clients", 
    icon: IconBuildingStore,
  },
  {
    title: "할일",
    url: "/dashboard/tasks",
    icon: IconListCheck,
  },
  {
    title: "워크플로우",
    url: "/dashboard/workflows",
    icon: IconBrandCodecov,
  },
]

const secondaryNavItems = [
  {
    title: "설정",
    url: "/dashboard/settings",
    icon: IconSettings,
  },
  {
    title: "도움말",
    url: "/help",
    icon: IconHelp,
  },
]

const userData = {
  name: "사용자",
  email: "user@example.com",
  avatar: "/avatars/user.png",
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof UISidebar>) {
  const { isMobile } = useSidebar();
  
  return (
    <UISidebar 
      variant="sidebar" 
      collapsible={isMobile ? "offcanvas" : "icon"} 
      className="sidebar-transition"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconInnerShadowTop className="h-5 w-5" />
                <span className="text-base font-semibold">세일즈원</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-2 px-3 py-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                >
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
        
        <div className="mt-auto px-3 py-2">
          <SidebarMenu>
            {secondaryNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </UISidebar>
  )
} 