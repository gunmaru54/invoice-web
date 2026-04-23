/**
 * Notion API 클라이언트 초기화 및 견적서 데이터 조회 함수
 *
 * 환경 변수:
 *   NOTION_API_KEY       — Notion Integration 토큰
 *   NOTION_DATABASE_ID   — 견적서 데이터베이스 ID
 *
 * Notion API rate limit: 초당 3 req
 * 각 page.tsx에서 아래 설정으로 Next.js 캐시를 활용하여 rate limit 대응:
 *   - 목록/대시보드 페이지 (getInvoices):       export const revalidate = 60  // 1분
 *   - 뷰어/상세 페이지 (getInvoiceBySlug/ById): export const revalidate = 30  // 30초
 */
import { Client, isFullPage, APIResponseError, APIErrorCode } from "@notionhq/client"
import type {
  PageObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints"
import type { Invoice, InvoiceSummary, InvoiceItem, InvoiceStatus } from "@/types"
import { NotionApiError, toUserMessage } from "@/lib/errors"
import { InvoiceSummarySchema } from "@/lib/schemas/invoice"

// 환경 변수 검증 (서버 실행 시 누락되면 즉시 오류 발생)
function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`환경 변수 ${key}가 설정되지 않았습니다.`)
  }
  return value
}

// Notion 클라이언트 싱글턴 (서버 컴포넌트에서만 호출됨)
function getNotionClient(): Client {
  return new Client({ auth: getRequiredEnv("NOTION_API_KEY") })
}

// ─────────────────────────────────────────────
// Notion 속성 파싱 헬퍼 함수
// ─────────────────────────────────────────────

/** title 속성 → string */
function parseTitleProperty(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "title") return ""
  return prop.title.map((t) => t.plain_text).join("")
}

/** rich_text 속성 → string */
function parseRichTextProperty(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "rich_text") return ""
  return prop.rich_text.map((t) => t.plain_text).join("")
}

/** select 속성 → string */
function parseSelectProperty(prop: PageObjectResponse["properties"][string]): string {
  if (prop.type !== "select") return ""
  return prop.select?.name ?? ""
}

/** number 속성 → number */
function parseNumberProperty(prop: PageObjectResponse["properties"][string]): number {
  if (prop.type !== "number") return 0
  return prop.number ?? 0
}

/** date 속성 → string (YYYY-MM-DD) */
function parseDateProperty(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "date") return undefined
  return prop.date?.start ?? undefined
}

/** email 속성 → string | undefined */
function parseEmailProperty(
  prop: PageObjectResponse["properties"][string]
): string | undefined {
  if (prop.type !== "email") return undefined
  return prop.email ?? undefined
}

/**
 * Invoice 페이지의 items relation 속성에서 연결된 아이템 페이지들을 조회하여 InvoiceItem[] 반환
 * items DB 속성: item_name(Title), qty(Number), unit_price(Number), amount(Number), note(Text)
 */
async function fetchInvoiceItemsFromRelation(
  notion: Client,
  page: PageObjectResponse
): Promise<InvoiceItem[]> {
  try {
    const itemsProp = page.properties["items"]
    if (!itemsProp || itemsProp.type !== "relation") return []

    const relationIds = itemsProp.relation.map((r) => r.id)
    if (relationIds.length === 0) return []

    const items: InvoiceItem[] = []

    for (const id of relationIds) {
      const itemPage = await notion.pages.retrieve({ page_id: id })
      if (!isFullPage(itemPage)) continue

      const props = itemPage.properties
      const itemName = parseTitleProperty(
        props["item_name"] ?? { type: "title", id: "", title: [] }
      )
      if (!itemName) continue

      const quantity = parseNumberProperty(
        props["qty"] ?? { type: "number", id: "", number: null }
      )
      const unitPrice = parseNumberProperty(
        props["unit_price"] ?? { type: "number", id: "", number: null }
      )
      const amount = quantity * unitPrice
      const note =
        parseRichTextProperty(
          props["note"] ?? { type: "rich_text", id: "", rich_text: [] }
        ) || undefined

      items.push({ itemName, quantity, unitPrice, amount, note })
    }

    return items
  } catch (err) {
    console.error("[Notion] items 관계 조회 오류:", err)
    return []
  }
}

/**
 * Notion 페이지를 InvoiceSummary로 변환
 *
 * Notion 데이터베이스 속성명 매핑:
 *   Name          → title (견적서 제목)
 *   slug          → rich_text (공개 URL 슬러그)
 *   client_name   → rich_text (고객사명)
 *   client_email  → email (고객 이메일)
 *   issue_date    → date (발행일)
 *   expiry_date   → date (유효기간)
 *   status        → select (draft/sent/viewed/accepted/rejected)
 *   total_amount  → number (총 금액)
 *   note          → rich_text (비고)
 */
function mapPageToSummary(page: PageObjectResponse): InvoiceSummary {
  const props = page.properties

  const rawStatus = parseSelectProperty(
    props["status"] ?? { type: "select", id: "", select: null }
  )
  const validStatuses: InvoiceStatus[] = ["draft", "sent", "viewed", "accepted", "rejected"]
  const status: InvoiceStatus = validStatuses.includes(rawStatus as InvoiceStatus)
    ? (rawStatus as InvoiceStatus)
    : "draft"

  const summary: InvoiceSummary = {
    id: page.id,
    title: parseTitleProperty(props["Name"] ?? { type: "title", id: "", title: [] }),
    slug: page.id,
    clientName: parseRichTextProperty(
      props["client_name"] ?? { type: "rich_text", id: "", rich_text: [] }
    ),
    clientEmail: parseEmailProperty(
      props["client_email"] ?? { type: "email", id: "", email: null }
    ),
    issueDate:
      parseDateProperty(props["issue_date"] ?? { type: "date", id: "", date: null }) ?? "",
    expiryDate: parseDateProperty(
      props["expiry_date"] ?? { type: "date", id: "", date: null }
    ),
    status,
    totalAmount: parseNumberProperty(
      props["total_amount"] ?? { type: "number", id: "", number: null }
    ),
    note:
      parseRichTextProperty(
        props["note"] ?? { type: "rich_text", id: "", rich_text: [] }
      ) || undefined,
  }

  // Notion 응답 데이터 스키마 불일치 경고 (데이터 차단 없이 계속 반환)
  const result = InvoiceSummarySchema.safeParse(summary)
  if (!result.success) {
    console.warn("[Notion] 스키마 불일치:", result.error.flatten())
  }

  return summary
}

// ─────────────────────────────────────────────
// Public API 함수
// ─────────────────────────────────────────────

/**
 * Notion 데이터베이스에서 모든 견적서 목록을 조회합니다.
 * 환경 변수가 없으면 개발용 목업 데이터를 반환합니다.
 */
export async function getInvoices(): Promise<InvoiceSummary[]> {
  // 환경 변수 없으면 목업 데이터 사용 (로컬 개발용)
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return getMockInvoices()
  }

  const notion = getNotionClient()
  const databaseId = getRequiredEnv("NOTION_DATABASE_ID")

  try {
    // @notionhq/client v5에서는 dataSources.query()로 데이터베이스 쿼리
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: databaseId,
      sorts: [{ property: "issue_date", direction: "descending" }],
    })
    return response.results.filter(isFullPage).map(mapPageToSummary)
  } catch (err) {
    console.error("[Notion] API 오류 (getInvoices):", err)
    throw new NotionApiError(toUserMessage(err))
  }
}

/**
 * slug로 특정 견적서를 조회합니다.
 * 공개 견적서 뷰어(quote/[slug])에서 사용합니다.
 */
export async function getInvoiceBySlug(slug: string): Promise<Invoice | null> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    const summary = getMockInvoices().find((inv) => inv.slug === slug)
    if (!summary) return null
    return { ...summary, items: getMockInvoiceItems() }
  }

  const notion = getNotionClient()

  try {
    // slug = page ID로 직접 조회
    const page = await notion.pages.retrieve({ page_id: slug })
    if (!isFullPage(page)) return null

    const summary = mapPageToSummary(page)
    const items = await fetchInvoiceItemsFromRelation(notion, page)

    return { ...summary, items }
  } catch (err) {
    // 페이지 없음(404) 또는 UUID 형식 오류(400) → null 반환 → 404 페이지로 처리
    if (APIResponseError.isAPIResponseError(err)) {
      if (err.code === APIErrorCode.ObjectNotFound || err.status === 404 || err.status === 400) {
        return null
      }
    }
    if (err instanceof Error && err.message.includes("path failed validation")) {
      return null
    }
    console.error("[Notion] API 오류 (getInvoiceBySlug):", err)
    throw new NotionApiError(toUserMessage(err))
  }
}

/**
 * Notion 페이지 ID로 특정 견적서를 조회합니다.
 * 어드민 상세 미리보기((dashboard)/invoices/[id])에서 사용합니다.
 */
export async function getInvoiceById(id: string): Promise<Invoice | null> {
  if (!process.env.NOTION_API_KEY) {
    const summary = getMockInvoices().find((inv) => inv.id === id)
    if (!summary) return null
    return { ...summary, items: getMockInvoiceItems() }
  }

  const notion = getNotionClient()

  try {
    const page = await notion.pages.retrieve({ page_id: id })
    if (!isFullPage(page)) return null

    const summary = mapPageToSummary(page)
    const items = await fetchInvoiceItemsFromRelation(notion, page)

    return { ...summary, items }
  } catch (err) {
    console.error("[Notion] API 오류 (getInvoiceById):", err)
    throw new NotionApiError(toUserMessage(err))
  }
}

// ─────────────────────────────────────────────
// 개발용 목업 데이터 (환경 변수 미설정 시 사용)
// ─────────────────────────────────────────────

function getMockInvoices(): InvoiceSummary[] {
  return [
    {
      id: "mock-001",
      title: "웹사이트 리뉴얼 프로젝트 견적서",
      slug: "web-renewal-2026-001",
      clientName: "주식회사 ABC",
      clientEmail: "contact@abc.co.kr",
      issueDate: "2026-04-01",
      expiryDate: "2026-04-30",
      status: "sent",
      totalAmount: 5500000,
      note: "부가세 포함 금액입니다.",
    },
    {
      id: "mock-002",
      title: "모바일 앱 개발 견적서",
      slug: "mobile-app-2026-002",
      clientName: "스타트업 XYZ",
      clientEmail: "ceo@xyz.io",
      issueDate: "2026-04-10",
      expiryDate: "2026-05-10",
      status: "draft",
      totalAmount: 12000000,
    },
    {
      id: "mock-003",
      title: "브랜딩 디자인 견적서",
      slug: "branding-2026-003",
      clientName: "개인사업자 홍길동",
      issueDate: "2026-03-15",
      status: "accepted",
      totalAmount: 2200000,
    },
  ]
}

function getMockInvoiceItems(): InvoiceItem[] {
  return [
    {
      itemName: "기획 및 설계",
      quantity: 1,
      unitPrice: 1000000,
      amount: 1000000,
      note: "요구사항 분석, 와이어프레임 제작 포함",
    },
    {
      itemName: "UI/UX 디자인",
      quantity: 1,
      unitPrice: 1500000,
      amount: 1500000,
    },
    {
      itemName: "프론트엔드 개발",
      quantity: 1,
      unitPrice: 2000000,
      amount: 2000000,
      note: "반응형 웹 개발",
    },
    {
      itemName: "백엔드 API 개발",
      quantity: 1,
      unitPrice: 800000,
      amount: 800000,
    },
    {
      itemName: "QA 및 배포",
      quantity: 1,
      unitPrice: 200000,
      amount: 200000,
    },
  ]
}
