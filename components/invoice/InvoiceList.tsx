// 견적서 목록 컴포넌트 (재사용 가능한 리스트 UI)
// 추후 서버 컴포넌트에서 데이터를 받아 렌더링하는 용도로 사용

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceEmptyState } from "@/components/invoice/InvoiceEmptyState"
import { formatKRW } from "@/lib/format"
import type { InvoiceSummary } from "@/types"

interface InvoiceListProps {
  invoices: InvoiceSummary[]
  // 어드민 상세 페이지 링크 생성 함수 (대시보드용)
  getDetailHref?: (invoice: InvoiceSummary) => string
}

// 견적서 상태 배지 레이블 및 변형
const STATUS_BADGE_MAP: Record<
  InvoiceSummary["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "초안", variant: "secondary" },
  sent: { label: "발송됨", variant: "default" },
  viewed: { label: "열람됨", variant: "outline" },
  accepted: { label: "수락됨", variant: "default" },
  rejected: { label: "거절됨", variant: "destructive" },
}

export function InvoiceList({ invoices, getDetailHref }: InvoiceListProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <InvoiceEmptyState />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">전체 {invoices.length}건</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {invoices.map((invoice) => {
            const badge = STATUS_BADGE_MAP[invoice.status]
            const href = getDetailHref ? getDetailHref(invoice) : `/invoices/${invoice.id}`

            return (
              <Link
                key={invoice.id}
                href={href}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{invoice.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {invoice.clientName} · {invoice.issueDate}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                  <span className="text-sm font-medium tabular-nums">
                    {formatKRW(invoice.totalAmount)}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
