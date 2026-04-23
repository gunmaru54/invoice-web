import { Skeleton } from "@/components/ui/skeleton"

// 견적서 목록 페이지 로딩 스켈레톤
export default function InvoicesLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* 페이지 헤더 스켈레톤 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-52" />
      </div>

      {/* 목록 카드 스켈레톤 */}
      <div className="rounded-lg border bg-card">
        <div className="p-6 pb-4">
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="divide-y border-t">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-6 py-4"
            >
              {/* 제목 + 부제 — InvoiceList 좌측 영역 */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              {/* 배지 + 금액 — InvoiceList 우측 영역 */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
