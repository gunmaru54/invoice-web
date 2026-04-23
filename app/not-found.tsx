import Link from "next/link"
import { FileXIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// 전역 404 에러 페이지 (F008)
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      {/* 404 표시 */}
      <div className="flex flex-col items-center gap-3">
        <FileXIcon className="size-16 text-muted-foreground/30" />
        <p className="text-7xl font-bold tracking-tighter text-muted-foreground/20">404</p>
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          요청하신 견적서 또는 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
      </div>

      {/* 액션 버튼 */}
      <Link href="/" className={cn(buttonVariants())}>
        대시보드로 돌아가기
      </Link>
    </div>
  )
}
