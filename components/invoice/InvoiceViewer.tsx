// 공개 견적서 뷰어 컴포넌트
// quote/[slug]/page.tsx (public) 및 (dashboard)/invoices/[id]/page.tsx (preview) 에서 사용

import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatKRW } from "@/lib/format"
import { CopyUrlButton } from "@/components/invoice/CopyUrlButton"
import type { Invoice } from "@/types"

interface InvoiceViewerProps {
  invoice: Invoice
  // "public": 클라이언트 공개 뷰어, "preview": 어드민 미리보기 (액션 바 표시)
  mode?: "public" | "preview"
}

// 견적서 상태 배지 레이블 및 변형
const STATUS_BADGE_MAP: Record<
  Invoice["status"],
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  draft: { label: "초안", variant: "secondary" },
  sent: { label: "검토 중", variant: "default" },
  viewed: { label: "열람됨", variant: "outline" },
  accepted: { label: "수락됨", variant: "default" },
  rejected: { label: "거절됨", variant: "destructive" },
}

export function InvoiceViewer({ invoice, mode = "public" }: InvoiceViewerProps) {
  const badge = STATUS_BADGE_MAP[invoice.status]

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 sm:p-8">
        {/* 어드민 미리보기 액션 바 */}
        {mode === "preview" && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <span className="text-sm text-muted-foreground">어드민 미리보기</span>
            <div className="flex items-center gap-2">
              <CopyUrlButton slug={invoice.slug} />
              <Link
                href={`/quote/${invoice.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <ExternalLinkIcon className="size-3.5 mr-1" />
                공개 URL
              </Link>
            </div>
          </div>
        )}

        {/* 제목 + 상태 */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{invoice.title}</h1>
          <Badge variant={badge.variant} aria-label={`견적서 상태: ${badge.label}`}>{badge.label}</Badge>
        </div>

        {/* 수신 + 발행 정보 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm mb-8">
          <div>
            <p className="text-muted-foreground mb-1">수신</p>
            <p className="font-semibold text-base">{invoice.clientName}</p>
            {invoice.clientEmail && (
              <p className="text-muted-foreground">{invoice.clientEmail}</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-muted-foreground mb-1">발행일</p>
            <p className="font-medium">{invoice.issueDate}</p>
            {invoice.expiryDate && (
              <>
                <p className="text-muted-foreground mt-2 mb-1">유효기간</p>
                <p className="font-medium">{invoice.expiryDate}</p>
              </>
            )}
          </div>
        </div>

        <Separator className="mb-6" />

        {/* 견적 항목 — 모바일 가로 스크롤 지원 */}
        <section aria-labelledby="invoice-items-heading" className="mb-6">
          <h2 id="invoice-items-heading" className="text-sm font-semibold text-muted-foreground mb-3">견적 내역</h2>

          <div className="overflow-x-auto">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 bg-muted/50 rounded-md px-4 py-2 text-xs text-muted-foreground mb-1 min-w-[400px]">
              <span>항목</span>
              <span className="text-right">수량</span>
              {/* 단가 컬럼: 모바일 숨김 */}
              <span className="text-right hidden sm:block">단가</span>
              <span className="text-right">금액</span>
            </div>

            {/* 항목 목록 */}
            <div className="divide-y min-w-[400px]">
              {invoice.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 text-sm invoice-item-row"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{item.itemName}</span>
                    {item.note && (
                      <span className="text-xs text-muted-foreground">{item.note}</span>
                    )}
                  </div>
                  <span className="text-right tabular-nums">{item.quantity}</span>
                  {/* 단가: 모바일 숨김 */}
                  <span className="text-right tabular-nums hidden sm:block">
                    {formatKRW(item.unitPrice)}
                  </span>
                  <span
                    className="text-right tabular-nums font-medium"
                    aria-label={`금액: ${formatKRW(item.amount)}`}
                  >
                    {formatKRW(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="mb-6" />

        {/* 합계 */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">총 견적 금액</span>
          <span className="text-2xl font-bold tabular-nums">
            {formatKRW(invoice.totalAmount)}
          </span>
        </div>

        {/* 비고 */}
        {invoice.note && (
          <>
            <Separator className="my-6" />
            <section aria-labelledby="invoice-note-heading">
              <h2 id="invoice-note-heading" className="text-sm font-semibold text-muted-foreground mb-2">비고</h2>
              <p className="text-sm whitespace-pre-line text-muted-foreground">{invoice.note}</p>
            </section>
          </>
        )}
      </CardContent>
    </Card>
  )
}
