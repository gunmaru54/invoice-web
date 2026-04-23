@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 주요 명령어

```bash
npm run dev      # 개발 서버 실행 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

테스트 설정은 없습니다.

## 프로젝트 개요

**Notion 기반 견적서 웹 뷰어** — 사업자가 Notion에 입력한 견적서를 고객이 고유 URL로 웹에서 확인하고 PDF로 다운로드할 수 있는 서비스.

## 아키텍처 개요

Next.js 16 App Router 기반. Route Group으로 어드민 레이아웃과 공개 뷰어를 분리하는 구조입니다.

### 라우팅 구조

```
app/
├── layout.tsx                          # 루트 레이아웃: ThemeProvider + TooltipProvider
├── page.tsx                            # 어드민 대시보드 (견적서 현황 요약)
├── not-found.tsx                       # 전역 404 에러 페이지 (F008)
├── (dashboard)/                        # 어드민 영역 — Sidebar + 모바일 헤더 레이아웃
│   ├── layout.tsx
│   └── invoices/
│       ├── page.tsx                    # 견적서 목록 (F001, F004)
│       └── [id]/
│           └── page.tsx                # 견적서 상세 미리보기 (F002, F007)
└── quote/                              # 클라이언트 공개 영역 (레이아웃 없음)
    └── [slug]/
        └── page.tsx                    # 견적서 뷰어 (F002, F003, F005)
```

사이드바에 메뉴를 추가할 때는 `components/layout/sidebar.tsx`의 `sidebarItems` 배열에 항목을 추가하고, 대응하는 `app/(dashboard)/<경로>/page.tsx` 파일을 함께 생성해야 합니다.

### 컴포넌트 계층

- `components/ui/` — shadcn/ui 기반 기본 UI (Button, Card, Badge, Tabs 등)
- `components/layout/` — Sidebar, MobileSidebar (어드민 전용)
- `components/invoice/` — 견적서 관련 재사용 컴포넌트
  - `InvoiceList.tsx` — 견적서 목록 리스트 UI
  - `InvoiceCard.tsx` — 견적서 카드 UI (그리드 레이아웃용)
  - `InvoiceViewer.tsx` — 공개 견적서 뷰어 UI
  - `InvoicePDF.tsx` — PDF 렌더링 (`@react-pdf/renderer` v4 기반, `"use client"` 전용)
- `components/providers/` — ThemeProvider (next-themes)

### 타입

공유 타입은 `types/index.ts`에 정의합니다.
- `Invoice` — 견적서 전체 데이터 (items 포함)
- `InvoiceSummary` — 견적서 요약 데이터 (목록 표시용, items 제외)
- `InvoiceItem` — 견적서 항목
- `InvoiceStatus` — 견적서 상태 유니온 타입
- `NotionInvoiceProperties` — Notion API 응답 매핑용 타입
- `NavItem` — 사이드바 네비게이션 아이템

### 데이터 레이어

`lib/notion.ts`에서 Notion API 연동을 관리합니다.
- `getInvoices()` — 견적서 목록 조회 (InvoiceSummary[])
- `getInvoiceBySlug(slug)` — slug로 견적서 조회 (공개 뷰어용)
- `getInvoiceById(id)` — id로 견적서 조회 (어드민 상세용)

**현재 상태**: 환경 변수 설정 시 실제 Notion API 호출, 미설정 시 목업 데이터 폴백.

### 유틸리티

`lib/utils.ts`의 `cn()` 함수로 Tailwind 클래스를 조합합니다 (clsx + tailwind-merge).

### 다크모드

`next-themes`로 구현되어 있으며, `ThemeProvider`가 루트 레이아웃에서 `attribute="class"`로 설정됩니다. `<html>` 태그에 `suppressHydrationWarning`이 필요합니다.

### 메타데이터

루트 레이아웃에서 `title.template: "%s | 견적서 관리"`로 설정되어 있어, 각 페이지에서 `export const metadata: Metadata = { title: "페이지명" }`만 선언하면 됩니다.

## 환경 변수

`.env.local.example` 파일을 참고하여 `.env.local`을 생성하세요:

```
NOTION_API_KEY=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
NEXT_PUBLIC_APP_ORIGIN=http://localhost:3000
```

## 설치된 주요 패키지

- `@notionhq/client` v5 — Notion API 클라이언트 (서버 컴포넌트 전용)
- `@react-pdf/renderer` v4 — PDF 생성 (`"use client"` 컴포넌트에서만 사용)
- `zustand` v5 — 클라이언트 뷰 상태 관리 (`store/useViewStore.ts`)
- `zod` v4 — 런타임 스키마 검증 (`lib/schemas/invoice.ts`)
