"use client"

import dynamic from "next/dynamic"
import type { Invoice } from "@/types"

const DownloadPdfButton = dynamic(
  () => import("@/components/invoice/DownloadPdfButton").then((m) => m.DownloadPdfButton),
  {
    ssr: false,
    loading: () => (
      <span className="h-8 w-32 rounded-md bg-muted animate-pulse inline-block" />
    ),
  }
)

export function DownloadPdfButtonWrapper({ invoice }: { invoice: Invoice }) {
  return <DownloadPdfButton invoice={invoice} />
}
