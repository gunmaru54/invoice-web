// 사이드바 네비게이션 아이템 타입
export interface NavItem {
  title: string
  href: string
  description?: string
  disabled?: boolean
  external?: boolean
  icon?: string
}

// 견적서 항목 타입 (Notion 데이터베이스의 각 행)
export interface InvoiceItem {
  itemName: string
  quantity: number
  unitPrice: number
  amount: number
  note?: string
}

// 견적서 상태 타입
export type InvoiceStatus = "draft" | "sent" | "viewed" | "accepted" | "rejected"

// 견적서 타입 (Notion 견적서 데이터베이스 레코드)
export interface Invoice {
  id: string
  title: string
  // 클라이언트가 접근하는 고유 URL 슬러그
  slug: string
  clientName: string
  clientEmail?: string
  issueDate: string
  expiryDate?: string
  status: InvoiceStatus
  totalAmount: number
  items: InvoiceItem[]
  note?: string
}

// 견적서 목록 조회용 요약 타입 (items 제외)
export type InvoiceSummary = Omit<Invoice, "items">

// Notion API 응답을 Invoice로 변환할 때 사용하는 원시 속성 타입
export interface NotionInvoiceProperties {
  title: string
  slug: string
  clientName: string
  clientEmail?: string
  issueDate: string
  expiryDate?: string
  status: InvoiceStatus
  totalAmount: number
  note?: string
}
