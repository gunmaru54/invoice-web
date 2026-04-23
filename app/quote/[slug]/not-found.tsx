import { FileXIcon } from "lucide-react"

export default function QuoteNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <FileXIcon className="size-16 text-muted-foreground/30" />
        <p className="text-7xl font-bold tracking-tighter text-muted-foreground/20">404</p>
        <h1 className="text-2xl font-bold">잘못된 주소입니다</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          견적서를 찾을 수 없습니다. 발급자에게 새 URL을 요청해주세요.
        </p>
      </div>
    </div>
  )
}
