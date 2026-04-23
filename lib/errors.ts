import { APIResponseError, APIErrorCode } from "@notionhq/client"

export class NotionApiError extends Error {
  readonly code?: string
  readonly status?: number

  constructor(message: string, code?: string, status?: number) {
    super(message)
    this.name = "NotionApiError"
    this.code = code
    this.status = status
  }
}

export function toUserMessage(error: unknown): string {
  if (APIResponseError.isAPIResponseError(error)) {
    switch (error.code) {
      case APIErrorCode.RateLimited:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
      case APIErrorCode.Unauthorized:
        return "Notion API 인증에 실패했습니다. API Key를 확인해주세요."
      case APIErrorCode.ObjectNotFound:
        return "견적서를 찾을 수 없습니다."
      default:
        return "데이터를 불러오는 중 오류가 발생했습니다."
    }
  }
  return "데이터를 불러오는 중 오류가 발생했습니다."
}
