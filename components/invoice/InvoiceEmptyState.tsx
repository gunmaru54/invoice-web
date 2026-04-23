// 빈 상태 컴포넌트 — 견적서 목록이 없을 때 표시
import { FileTextIcon } from "lucide-react"

interface InvoiceEmptyStateProps {
  message?: string
  description?: string
  action?: React.ReactNode
}

export function InvoiceEmptyState({
  message = "등록된 견적서가 없습니다",
  description = "Notion 데이터베이스에 견적서를 추가하면 자동으로 표시됩니다",
  action,
}: InvoiceEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 min-h-[240px] text-center gap-3">
      <FileTextIcon className="size-12 text-muted-foreground/40" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
      {action}
    </div>
  )
}
