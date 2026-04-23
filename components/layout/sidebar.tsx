"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export interface SidebarNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// 어드민 사이드바 네비게이션 메뉴 항목
export const sidebarItems: SidebarNavItem[] = [
  { title: "대시보드", href: "/", icon: LayoutDashboardIcon },
  { title: "견적서 목록", href: "/invoices", icon: FileTextIcon },
  { title: "설정", href: "/settings", icon: SettingsIcon },
]

// 어드민 사이드바 네비게이션 컴포넌트
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside aria-label="사이드바 내비게이션" className="hidden md:flex w-60 flex-col border-r bg-muted/30 min-h-full">
      {/* 로고 */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <FileTextIcon className="size-5 text-primary" />
          <span>견적서 관리</span>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav aria-label="주 내비게이션" className="flex flex-col gap-1 p-3 flex-1">
        {sidebarItems.map((item) => {
          // /invoices 경로는 하위 경로(예: /invoices/123)에서도 활성 표시
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* 테마 전환 */}
      <div className="border-t p-3">
        <ThemeToggle />
      </div>
    </aside>
  )
}
