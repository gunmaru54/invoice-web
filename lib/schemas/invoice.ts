/**
 * Zod 기반 견적서 검증 스키마
 * 런타임 데이터 검증 및 타입 추론에 사용합니다.
 * types/index.ts와 혼용 금지 — z.infer 타입은 이 파일 내부에서만 사용
 */
import { z } from "zod"

// 견적서 항목 스키마
export const InvoiceItemSchema = z.object({
  itemName: z.string().min(1, "항목명은 필수입니다"),
  quantity: z.number().nonnegative("수량은 0 이상이어야 합니다"),
  unitPrice: z.number().nonnegative("단가는 0 이상이어야 합니다"),
  amount: z.number().nonnegative("금액은 0 이상이어야 합니다"),
  note: z.string().optional(),
})

// 견적서 요약 스키마 (목록 표시용)
export const InvoiceSummarySchema = z.object({
  id: z.string().min(1, "ID는 필수입니다"),
  title: z.string().min(1, "제목은 필수입니다"),
  slug: z.string().min(1, "슬러그는 필수입니다"),
  clientName: z.string().min(1, "고객사명은 필수입니다"),
  clientEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional(),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD여야 합니다"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "날짜 형식은 YYYY-MM-DD여야 합니다")
    .optional(),
  status: z.enum(["draft", "sent", "viewed", "accepted", "rejected"]),
  totalAmount: z.number().nonnegative("총 금액은 0 이상이어야 합니다"),
  note: z.string().optional(),
})

// 견적서 전체 스키마 (items 포함)
export const InvoiceSchema = InvoiceSummarySchema.extend({
  items: z.array(InvoiceItemSchema),
})

// 스키마 내부 전용 타입 추론 (types/index.ts와 혼용 금지)
export type InvoiceItemSchemaType = z.infer<typeof InvoiceItemSchema>
export type InvoiceSummarySchemaType = z.infer<typeof InvoiceSummarySchema>
export type InvoiceSchemaType = z.infer<typeof InvoiceSchema>
