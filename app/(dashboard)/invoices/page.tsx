import type { Metadata } from "next"

// Notion API rate limit 대응: 60초마다 재검증
export const revalidate = 60

import { getInvoices } from "@/lib/notion"
import { InvoiceFilters } from "@/components/invoice/InvoiceFilters"
import { InvoiceListView } from "@/components/invoice/InvoiceListView"

export const metadata: Metadata = {
  title: "견적서 목록",
}

// Next.js 16: searchParams는 Promise
interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>
}

// 견적서 목록 페이지 (어드민 F001, F004)
export default async function InvoicesPage({ searchParams }: PageProps) {
  const { status, q, sort } = await searchParams
  const allInvoices = await getInvoices()

  // 상태 필터링
  let invoices = status
    ? allInvoices.filter((inv) => inv.status === status)
    : allInvoices

  // 검색 필터링 (견적서명 또는 고객사명)
  if (q) {
    invoices = invoices.filter(
      (inv) => inv.title.includes(q) || inv.clientName.includes(q)
    )
  }

  // 정렬 (기본: 최신순 descending)
  if (sort === "asc") {
    invoices = [...invoices].sort((a, b) => a.issueDate.localeCompare(b.issueDate))
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">견적서 목록</h1>
        <p className="text-sm text-muted-foreground">
          Notion에 등록된 견적서를 관리합니다.
        </p>
      </div>

      {/* 필터 / 검색 / 뷰 토글 */}
      <InvoiceFilters currentStatus={status} currentQ={q} currentSort={sort} />

      {/* 견적서 리스트 또는 그리드 — viewMode는 클라이언트에서 처리 */}
      <InvoiceListView invoices={invoices} />
    </div>
  )
}
