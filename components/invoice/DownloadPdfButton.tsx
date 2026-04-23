"use client"

import { PDFDownloadLink } from "@react-pdf/renderer"
import { DownloadIcon, LoaderIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InvoiceDocument } from "@/components/invoice/InvoicePDF"
import type { Invoice } from "@/types"

interface DownloadPdfButtonProps {
  invoice: Invoice
}

export function DownloadPdfButton({ invoice }: DownloadPdfButtonProps) {
  const fileName = `${invoice.slug}-${invoice.clientName}.pdf`

  return (
    <PDFDownloadLink
      document={<InvoiceDocument invoice={invoice} />}
      fileName={fileName}
      className={cn(buttonVariants({ variant: "default", size: "sm" }))}
    >
      {({ loading }) =>
        loading ? (
          <>
            <LoaderIcon className="size-3.5 mr-1.5 animate-spin" />
            PDF 생성 중...
          </>
        ) : (
          <>
            <DownloadIcon className="size-3.5 mr-1.5" />
            PDF 다운로드
          </>
        )
      }
    </PDFDownloadLink>
  )
}
