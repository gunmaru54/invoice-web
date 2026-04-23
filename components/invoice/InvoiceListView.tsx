"use client"

import { InvoiceList } from "@/components/invoice/InvoiceList"
import { InvoiceCard } from "@/components/invoice/InvoiceCard"
import { InvoiceEmptyState } from "@/components/invoice/InvoiceEmptyState"
import { useViewStore } from "@/store/useViewStore"
import type { InvoiceSummary } from "@/types"

interface InvoiceListViewProps {
  invoices: InvoiceSummary[]
}

// 클라이언트에서 viewMode를 읽어 리스트/그리드 전환
export function InvoiceListView({ invoices }: InvoiceListViewProps) {
  const { viewMode } = useViewStore()

  if (viewMode === "grid") {
    // 그리드 모드: 카드 레이아웃 렌더링
    return (
      <>
        {invoices.length === 0 ? (
          <InvoiceEmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </>
    )
  }

  return <InvoiceList invoices={invoices} />
}
