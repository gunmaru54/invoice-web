import type { Metadata } from "next"
import Link from "next/link"

// Notion API rate limit 대응: 60초마다 재검증
export const revalidate = 60

import {
  FileTextIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInvoices } from "@/lib/notion"
import { formatKRW } from "@/lib/format"
import type { InvoiceSummary } from "@/types"

export const metadata: Metadata = {
  title: "대시보드",
}

// 견적서 상태에 따른 Badge 변형 반환
function getStatusBadge(status: InvoiceSummary["status"]) {
  const statusMap: Record<
    InvoiceSummary["status"],
    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
  > = {
    draft: { label: "초안", variant: "secondary" },
    sent: { label: "발송됨", variant: "default" },
    viewed: { label: "열람됨", variant: "outline" },
    accepted: { label: "수락됨", variant: "default" },
    rejected: { label: "거절됨", variant: "destructive" },
  }
  return statusMap[status]
}

// 어드민 대시보드 홈 페이지 (F006)
export default async function DashboardPage() {
  const invoices = await getInvoices()

  // 통계 계산
  const totalCount = invoices.length
  const sentCount = invoices.filter(
    (inv) => inv.status === "sent" || inv.status === "viewed"
  ).length
  const acceptedCount = invoices.filter((inv) => inv.status === "accepted").length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  // 이번 달 견적서 집계
  const currentMonth = new Date().toISOString().slice(0, 7)
  const thisMonthInvoices = invoices.filter((inv) => inv.issueDate.startsWith(currentMonth))
  const thisMonthAmount = thisMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

  // 최근 5개 견적서
  const recentInvoices = invoices.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">대시보드</h1>
          <p className="text-sm text-muted-foreground">견적서 현황을 한눈에 확인하세요.</p>
        </div>
        <Link href="/invoices">
          <Button>
            견적서 목록 보기
            <ArrowRightIcon className="ml-1 size-4" />
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 견적서
            </CardTitle>
            <FileTextIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCount}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              발송 대기 중
            </CardTitle>
            <ClockIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sentCount}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              수락된 견적서
            </CardTitle>
            <CheckCircleIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{acceptedCount}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 견적 금액
            </CardTitle>
            <TrendingUpIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold break-all">{formatKRW(totalAmount)}</p>
          </CardContent>
        </Card>

        {/* 이번 달 견적 집계 카드 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              이번 달 견적
            </CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold break-all">{formatKRW(thisMonthAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{thisMonthInvoices.length}건</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 견적서 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">최근 견적서</CardTitle>
          <Link
            href="/invoices"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            전체 보기
          </Link>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              등록된 견적서가 없습니다.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {recentInvoices.map((invoice) => {
                const statusBadge = getStatusBadge(invoice.status)
                return (
                  <Link
                    key={invoice.id}
                    href={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-md transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-medium truncate">{invoice.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {invoice.clientName} · {invoice.issueDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      <span className="text-sm font-medium tabular-nums">
                        {formatKRW(invoice.totalAmount)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
