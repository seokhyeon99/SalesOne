import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/layout.css";
import { AppProviders } from "@/contexts";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ui/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | SalesOne',
    default: 'SalesOne - 통합 영업 자동화 플랫폼',
  },
  description: "세일즈원으로 DB 확보부터 이메일 아웃리치, CRM 연동, 워크플로우 자동화까지 아우르는 End-to-End 영업 플랫폼을 경험하세요.",
  keywords: ["영업 자동화", "CRM", "이메일 캠페인", "워크플로우 자동화", "리드 관리", "영업 플랫폼", "세일즈원"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={cn(inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            {children}
          </AppProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
