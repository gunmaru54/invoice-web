import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getInvoiceById } from "@/lib/notion"
import { InvoiceViewer } from "@/components/invoice/InvoiceViewer"
import type { Invoice } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const invoice = await getInvoiceById(id)
  if (!invoice) return { title: "견적서를 찾을 수 없음" }
  return { title: `${invoice.title} | 견적서 관리` }
}

// 견적서 상태 배지 정보
function getStatusBadge(status: Invoice["status"]) {
  const statusMap: Record<
    Invoice["status"],
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

// 어드민 견적서 상세 미리보기 페이지 (F002, F007)
export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params
  const invoice = await getInvoiceById(id)

  if (!invoice) {
    notFound()
  }

  const statusBadge = getStatusBadge(invoice.status)

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* 목록으로 돌아가기 아이콘 버튼 */}
          <Link
            href="/invoices"
            aria-label="목록으로 돌아가기"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <ArrowLeftIcon className="size-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{invoice.title}</h1>
            <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
          </div>
        </div>

        <Badge variant={statusBadge.variant} className="shrink-0">
          {statusBadge.label}
        </Badge>
      </div>

      {/* 견적서 뷰어 — mode="preview" 로 어드민 액션 바 표시 */}
      <InvoiceViewer mode="preview" invoice={invoice} />
    </div>
  )
}
