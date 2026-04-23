"use client"

import { useRouter } from "next/navigation"
import { LayoutListIcon, LayoutGridIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useViewStore } from "@/store/useViewStore"

interface InvoiceFiltersProps {
  currentStatus?: string
  currentQ?: string
  currentSort?: string
}

// 상태 필터 옵션
const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "전체", value: "" },
  { label: "초안", value: "draft" },
  { label: "발송됨", value: "sent" },
  { label: "열람됨", value: "viewed" },
  { label: "수락됨", value: "accepted" },
  { label: "거절됨", value: "rejected" },
]

// 정렬 옵션
const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "최신순", value: "desc" },
  { label: "과거순", value: "asc" },
]

export function InvoiceFilters({ currentStatus, currentQ, currentSort }: InvoiceFiltersProps) {
  const router = useRouter()
  const { viewMode, setViewMode } = useViewStore()

  // URL searchParams 업데이트 헬퍼
  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const current: Record<string, string | undefined> = {
      status: currentStatus,
      q: currentQ,
      sort: currentSort,
      ...updates,
    }
    Object.entries(current).forEach(([key, val]) => {
      if (val) params.set(key, val)
    })
    const query = params.toString()
    router.replace(query ? `/invoices?${query}` : "/invoices")
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* 상태 필터 버튼 그룹 */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="상태 필터">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = (currentStatus ?? "") === opt.value
          return (
            <Button
              key={opt.value}
              size="sm"
              variant={isActive ? "default" : "outline"}
              onClick={() => updateParams({ status: opt.value || undefined })}
              aria-pressed={isActive}
            >
              {opt.label}
            </Button>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        {/* 검색 입력 */}
        <Input
          type="search"
          placeholder="견적서명 / 고객사 검색"
          className="w-full sm:w-48 h-9 text-sm"
          defaultValue={currentQ ?? ""}
          onChange={(e) => updateParams({ q: e.target.value || undefined })}
          aria-label="견적서 검색"
        />

        {/* 정렬 선택 */}
        <label className="sr-only" htmlFor="sort-select">정렬 기준</label>
        <select
          id="sort-select"
          className={cn(
            "h-9 rounded-md border border-input bg-background px-3 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          value={currentSort ?? "desc"}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 뷰 모드 토글 */}
        <div className="flex items-center border rounded-md overflow-hidden" role="group" aria-label="뷰 모드">
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "ghost"}
            className="rounded-none border-0 h-9 px-2.5"
            onClick={() => setViewMode("list")}
            aria-label="리스트 보기"
            aria-pressed={viewMode === "list"}
          >
            <LayoutListIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "ghost"}
            className="rounded-none border-0 border-l h-9 px-2.5"
            onClick={() => setViewMode("grid")}
            aria-label="그리드 보기"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGridIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
