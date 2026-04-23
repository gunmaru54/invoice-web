import { Sidebar } from "@/components/layout/sidebar"
import { MobileSidebar } from "@/components/layout/mobile-sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { FileTextIcon } from "lucide-react"
import Link from "next/link"

// 어드민 대시보드 공통 레이아웃 (사이드바 + 메인 콘텐츠)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 접근성: 키보드 사용자가 반복 내비게이션을 건너뛸 수 있도록 Skip Navigation 링크 제공 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:text-sm focus:font-medium"
      >
        본문으로 바로 가기
      </a>

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="flex h-14 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <FileTextIcon className="size-5 text-primary" />
            <span>견적서 관리</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileSidebar />
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
