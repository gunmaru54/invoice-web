"use client"

import { useState } from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CopyUrlButtonProps {
  slug: string
  className?: string
}

// 견적서 공개 URL을 클립보드에 복사하는 버튼 (F004)
export function CopyUrlButton({ slug, className }: CopyUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  // 공개 URL을 클립보드에 복사
  async function handleCopy() {
    const url = `${window.location.origin}/quote/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      // 2초 후 복사 완료 상태 초기화
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API 미지원 환경 폴백
      const input = document.createElement("input")
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={copied ? "URL 복사됨" : "공유 URL 복사"}
            className={cn("flex items-center gap-1", className)}
          />
        }
      >
        {copied ? (
          <CheckIcon className="size-3.5 text-green-500" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        <span className="sr-only md:not-sr-only">
          {copied ? "복사됨" : "URL 복사"}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {copied ? "클립보드에 복사되었습니다!" : "공개 URL을 복사합니다"}
      </TooltipContent>
    </Tooltip>
  )
}
