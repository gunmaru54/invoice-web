# Development Guidelines

## 프로젝트 개요

- **목적**: Notion 기반 견적서 웹 뷰어 — 사업자가 Notion DB에 입력한 견적서를 고객이 고유 URL로 열람하는 서비스
- **스택**: Next.js 16 / React 19 / TypeScript / Tailwind v4 / shadcn-ui v4(@base-ui/react) / @notionhq/client v5
- **배포 환경**: Vercel 가정 (서버 컴포넌트 기반 SSR)

---

## ⚠️ 핵심 파괴적 변경사항 (반드시 숙지)

### Next.js 16 — params는 Promise

- `params`는 **반드시 `await`** 해야 한다. 직접 구조분해 절대 금지.

```ts
// ✅ 올바름
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ❌ 금지
export default async function Page({ params }: { params: { id: string } }) {
  const { id } = params  // Next.js 16에서 런타임 오류 발생
}
```

- `generateMetadata`도 동일하게 `await params` 적용 필수

### @notionhq/client v5 — dataSources API

- `databases.query()` 는 **폐기됨**. 반드시 `dataSources.query()` 사용.

```ts
// ✅ 올바름
const response = await notion.dataSources.query({
  data_source_id: databaseId,
  sorts: [{ property: "issue_date", direction: "descending" }],
})

// ❌ 금지
await notion.databases.query({ database_id: databaseId })  // v5에서 제거됨
```

- import 경로: `import { Client, isFullPage } from "@notionhq/client"`
- 타입 경로: `import type { PageObjectResponse, QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints"`

### Tailwind v4 — 설정 파일 없음

- `tailwind.config.js` / `tailwind.config.ts` **생성 금지** — v4는 CSS 기반 설정
- Tailwind 커스터마이징은 `app/globals.css` 에서 CSS 변수(`@theme` 블록)로 처리
- 플러그인 추가 시: `postcss.config.mjs` 수정

### shadcn/ui v4 + @base-ui/react — render prop 패턴

- `asChild` prop **사용 금지** — `@base-ui/react` 기반 컴포넌트는 `render` prop 사용

```tsx
// ✅ 올바름 (CopyUrlButton.tsx 참고)
<TooltipTrigger render={<Button variant="ghost" size="sm" onClick={handleCopy} />}>

// ❌ 금지
<TooltipTrigger asChild>
  <Button>...</Button>
</TooltipTrigger>
```

- 새 shadcn 컴포넌트 추가: `npx shadcn@latest add <component>` (설치 전 `@base-ui/react` 호환 여부 확인)

---

## 프로젝트 아키텍처

### 라우팅 구조

```
app/
├── layout.tsx                         # 루트: ThemeProvider + TooltipProvider
├── not-found.tsx                      # 전역 404
├── (dashboard)/                       # 어드민 (Sidebar 포함 레이아웃)
│   ├── layout.tsx
│   ├── page.tsx                       # 대시보드 홈 (통계 + 최근 견적서)
│   └── invoices/
│       ├── page.tsx                   # 견적서 목록
│       └── [id]/page.tsx              # 견적서 상세 미리보기
└── quote/
    └── [slug]/page.tsx                # 공개 견적서 뷰어 (레이아웃 없음)
```

### 컴포넌트 계층

| 디렉토리 | 역할 |
|---|---|
| `components/ui/` | shadcn/ui 기본 컴포넌트 (수정 최소화) |
| `components/layout/` | `sidebar.tsx`, `mobile-sidebar.tsx` — 어드민 전용 |
| `components/invoice/` | 견적서 전용 재사용 컴포넌트 |
| `components/providers/` | `theme-provider.tsx` |

### 데이터 레이어

- **`lib/notion.ts` 단일 파일**에서만 Notion API 호출
- 서버 컴포넌트에서만 호출 (`"use client"` 파일에서 호출 금지)
- 공개 함수: `getInvoices()`, `getInvoiceBySlug(slug)`, `getInvoiceById(id)`

### 타입 시스템

- **모든 공유 타입은 `types/index.ts` 단일 파일**에 정의
- 컴포넌트 내부 전용 타입만 해당 파일에 인라인 선언 허용
- `any` 타입 **절대 금지**

---

## 기능 구현 규칙

### 새 어드민 페이지 추가 시 (3파일 동시 수정)

1. `components/layout/sidebar.tsx` → `sidebarItems` 배열에 항목 추가
2. `app/(dashboard)/<경로>/page.tsx` → 페이지 파일 생성
3. `types/index.ts` → 필요한 타입 추가

```ts
// sidebar.tsx에 항목 추가 예시
export const sidebarItems: SidebarNavItem[] = [
  { title: "대시보드", href: "/", icon: LayoutDashboardIcon },
  { title: "견적서 목록", href: "/invoices", icon: FileTextIcon },
  { title: "새 메뉴", href: "/new-menu", icon: SomeIcon },  // 추가
]
```

### 새 공개 페이지 추가 시

- `app/quote/` 하위에 생성
- `(dashboard)/layout.tsx`를 **상속하지 않음** (사이드바 없음)
- `components/layout/sidebar.tsx` 수정 불필요

### Notion 데이터베이스 속성명 매핑

| Notion 속성명 | 타입 | TypeScript 필드 |
|---|---|---|
| `Name` | title | `title` |
| `slug` | rich_text | `slug` |
| `client_name` | rich_text | `clientName` |
| `client_email` | email | `clientEmail` |
| `issue_date` | date | `issueDate` |
| `expiry_date` | date | `expiryDate` |
| `status` | select | `status` |
| `total_amount` | number | `totalAmount` |
| `note` | rich_text | `note` |

- 견적 항목 테이블 컬럼 순서: **항목명(0) | 수량(1) | 단가(2) | 금액(3) | 비고(4)**
- 첫 행은 헤더로 건너뜀 (`isFirstRow` 패턴)

### 환경 변수 처리 패턴

```ts
// 환경 변수 없으면 목업 반환 (로컬 개발용) — 이 패턴 유지
if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
  return getMockInvoices()
}
```

- 목업 데이터는 `lib/notion.ts` 하단의 `getMockInvoices()`, `getMockInvoiceItems()` 함수에서 관리
- 환경 변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID` (`.env.local`)

---

## UI/UX 구현 규칙

### 금액 포맷 (반드시 동일 패턴 사용)

```ts
new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(amount)
```

### 견적서 상태 배지 패턴

```ts
const statusMap: Record<Invoice["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "초안", variant: "secondary" },
  sent: { label: "발송됨", variant: "default" },
  viewed: { label: "열람됨", variant: "outline" },
  accepted: { label: "수락됨", variant: "default" },
  rejected: { label: "거절됨", variant: "destructive" },
}
```

- 어드민(`sent` → "발송됨") vs 공개 뷰어(`sent` → "검토 중") 레이블 상이 — 맥락에 맞게 사용

### 클라이언트 컴포넌트 전환 기준

- 기본: **서버 컴포넌트** (async, 데이터 직접 fetch)
- `"use client"` 추가 조건: `useState`, `useEffect`, 브라우저 API(`navigator.clipboard`, `window`) 사용 시
- 예: `CopyUrlButton.tsx` (클립보드), `sidebar.tsx` (usePathname)

### Tailwind 클래스 조합

```ts
import { cn } from "@/lib/utils"  // clsx + tailwind-merge
cn("base-class", condition && "conditional-class")
```

### 다크모드

- `next-themes` 기반, `ThemeProvider`가 루트에서 `attribute="class"` 설정
- `<html>`에 `suppressHydrationWarning` 필수 (이미 적용됨)
- 색상은 CSS 변수 토큰 사용: `text-foreground`, `bg-background`, `text-muted-foreground` 등

### 반응형 레이아웃

- 사이드바: `hidden md:flex` (모바일에서 숨김)
- 모바일 헤더: `md:hidden` (데스크탑에서 숨김)
- 테이블/그리드: `grid-cols-1 md:grid-cols-[...]` 패턴

### 메타데이터

```ts
export const metadata: Metadata = { title: "페이지명" }
// 자동으로 "페이지명 | 견적서 관리" 로 렌더링 (template 설정됨)
```

---

## 파일 간 동시 수정 규칙

| 작업 | 수정 필요 파일 |
|---|---|
| 어드민 사이드바 메뉴 추가 | `components/layout/sidebar.tsx` + `app/(dashboard)/<경로>/page.tsx` |
| 새 타입 추가 | `types/index.ts` |
| Notion 속성 추가 | `lib/notion.ts` (`mapPageToSummary` + 파서 함수) + `types/index.ts` |
| 전역 스타일 변경 | `app/globals.css` (tailwind.config 없음) |
| 새 shadcn 컴포넌트 | `components/ui/<name>.tsx` (npx shadcn add로 생성) |

---

## 금지 사항

- `any` 타입 사용 금지
- `params`를 `await` 없이 직접 구조분해 금지 (Next.js 16)
- `notion.databases.query()` 사용 금지 (@notionhq/client v5에서 제거)
- `tailwind.config.js` / `tailwind.config.ts` 파일 생성 금지 (Tailwind v4)
- `asChild` prop 사용 금지 (base-ui render prop 패턴 사용)
- `lib/notion.ts` 함수를 클라이언트 컴포넌트(`"use client"`)에서 직접 호출 금지
- Notion API 호출 코드를 `lib/notion.ts` 외부에 작성 금지
- `types/index.ts` 외부에 공유 타입 정의 금지
- `@react-pdf/renderer` 미설치 상태에서 PDF 기능 구현 금지 (설치 후 구현)
