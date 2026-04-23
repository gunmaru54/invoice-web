# 견적서 관리 — Notion 기반 견적서 웹 뷰어

사업자가 Notion 데이터베이스에 입력한 견적서를 고객이 고유 URL로 웹에서 확인하고 PDF로 다운로드할 수 있는 서비스입니다.

## 빠른 시작

```bash
npm install
cp .env.local.example .env.local
# .env.local 파일에 환경 변수 입력 후 실행
npm run dev
```

개발 서버: http://localhost:3000

## 기술 스택

- **프레임워크**: Next.js 16 App Router + React 19
- **언어**: TypeScript (strict 모드)
- **스타일**: Tailwind CSS v4, shadcn/ui
- **데이터**: Notion API (`@notionhq/client` v5)
- **PDF**: `@react-pdf/renderer` v4
- **상태 관리**: Zustand v5
- **검증**: Zod v4
- **배포**: Vercel

## 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local`을 생성하고 실제 값을 입력하세요.

```bash
cp .env.local.example .env.local
```

| 변수명 | 필수 | 설명 |
|---|---|---|
| `NOTION_API_KEY` | ✅ | Notion Integration Token |
| `NOTION_DATABASE_ID` | ✅ | 견적서 Notion 데이터베이스 ID |
| `NEXT_PUBLIC_APP_ORIGIN` | ✅ | 공개 URL 생성에 사용하는 도메인 (예: `http://localhost:3000`) |

### Notion API Key 발급 방법

1. [Notion 개발자 페이지](https://www.notion.so/my-integrations) 접속
2. **새 Integration 생성** → Internal Integration Token 복사 → `NOTION_API_KEY`에 입력
3. 견적서 데이터베이스 페이지 우상단 **...** → **연결** → 생성한 Integration 추가

### Database ID 추출 방법

Notion 데이터베이스 URL: `https://www.notion.so/{workspace}/{DATABASE_ID}?v=...`

`?v=` 앞의 32자리 문자열이 Database ID입니다.

> 환경 변수가 없으면 자동으로 목업 데이터로 동작합니다 (로컬 개발용).
> Notion DB 스키마 구성 방법은 `docs/notion-schema.md`를 참고하세요.

## 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 주요 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

## 프로젝트 구조

```
app/
├── (dashboard)/          # 어드민 영역 (사이드바 포함)
│   ├── page.tsx          # 대시보드
│   └── invoices/         # 견적서 목록 및 상세
└── quote/[slug]/         # 공개 견적서 뷰어 (레이아웃 없음)

lib/
└── notion.ts             # Notion API 연동 (데이터 레이어)

types/
└── index.ts              # 공유 타입 정의

docs/
├── notion-schema.md      # Notion DB 구성 기준 문서
└── adr/                  # 아키텍처 결정 기록
```

## 라우팅

| URL | 대상 | 설명 |
|---|---|---|
| `/` | 어드민 | 대시보드 (견적서 현황 요약) |
| `/invoices` | 어드민 | 견적서 목록 |
| `/invoices/{id}` | 어드민 | 견적서 상세 미리보기 |
| `/quote/{slug}` | 공개 | 고객용 견적서 뷰어 |

## 배포 (Vercel)

1. GitHub 저장소를 Vercel 대시보드에서 Import
2. **Settings → Environment Variables**에서 환경 변수 3종 등록
3. `main` 브랜치 push 시 자동 배포
