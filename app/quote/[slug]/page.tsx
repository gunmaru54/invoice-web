import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

// Notion API rate limit 대응: 30초마다 재검증
export const revalidate = 30

import { FileTextIcon } from "lucide-react"
import { getInvoiceBySlug } from "@/lib/notion"
import { formatKRW } from "@/lib/format"
import { InvoiceViewer } from "@/components/invoice/InvoiceViewer"
import { DownloadPdfButtonWrapper } from "@/components/invoice/DownloadPdfButtonWrapper"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const invoice = await getInvoiceBySlug(slug)
  if (!invoice) return { title: "견적서를 찾을 수 없음" }
  return {
    title: `${invoice.title}`,
    description: `${invoice.clientName} 앞 견적서 — ${formatKRW(invoice.totalAmount)}`,
    // 공개 견적서는 검색엔진 인덱싱 차단
    robots: { index: false, follow: false },
    openGraph: {
      title: invoice.title,
      description: `${invoice.clientName} 앞 견적서 — ${formatKRW(invoice.totalAmount)}`,
      url: `${process.env.NEXT_PUBLIC_APP_ORIGIN}/quote/${slug}`,
      type: "website",
    },
  }
}

// 클라이언트 공개 견적서 뷰어 페이지 (F002, F003, F005)
export default async function QuoteViewerPage({ params }: PageProps) {
  const { slug } = await params
  const headersList = await headers()
  console.log(
    "[viewer]",
    slug,
    headersList.get("user-agent")?.slice(0, 60) ?? "-",
    headersList.get("referer") ?? "-"
  )

  const invoice = await getInvoiceBySlug(slug)

  if (!invoice) {
    notFound()
  }

  return (
    <main aria-label="견적서 뷰어" className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        {/* 헤더 — 인쇄 시 숨김 */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground print-hidden">
          <FileTextIcon className="size-4" />
          <span>견적서</span>
        </div>

        {/* PDF 다운로드 버튼 — 인쇄 시 숨김 */}
        <div className="mb-4 flex justify-end print-hidden">
          <DownloadPdfButtonWrapper invoice={invoice} />
        </div>

        {/* 견적서 본문 — public 모드 (액션 바 없음) */}
        <InvoiceViewer invoice={invoice} mode="public" />
      </div>
    </main>
  )
}
