// 견적서 카드 컴포넌트 — 그리드 레이아웃에서 단일 견적서를 표시할 때 사용

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatKRW } from "@/lib/format"
import type { InvoiceSummary } from "@/types"

interface InvoiceCardProps {
  invoice: InvoiceSummary
  href?: string
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

export function InvoiceCard({ invoice, href }: InvoiceCardProps) {
  const badge = STATUS_BADGE_MAP[invoice.status]
  const detailHref = href ?? `/invoices/${invoice.id}`

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold line-clamp-2 leading-snug">
            {invoice.title}
          </CardTitle>
          <Badge variant={badge.variant} className="shrink-0">
            {badge.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <p className="text-xs text-muted-foreground">{invoice.clientName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{invoice.issueDate}</p>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <span className="text-base font-bold tabular-nums">
          {formatKRW(invoice.totalAmount)}
        </span>
        <Link
          href={detailHref}
          aria-label={`${invoice.title} 상세 보기`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
        >
          상세 보기
        </Link>
      </CardFooter>
    </Card>
  )
}
