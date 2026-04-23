# MVP PRD 생성 메타 프롬프트
# Notion 견적서 → 웹 뷰 + PDF 다운로드 시스템

> **사용법**: 아래 프롬프트를 Claude Code에 그대로 붙여넣으면 MVP PRD 문서(`docs/PRD.md`)를 자동 생성합니다.

---

## 메타 프롬프트 (복사하여 사용)

```
당신은 시니어 프로덕트 매니저 겸 풀스택 아키텍트입니다.
아래 컨텍스트와 요구사항을 바탕으로 MVP PRD 문서를 `docs/PRD.md`에 작성하세요.

---

## 프로젝트 컨텍스트

- 프로젝트: invoice-web (Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui)
- 워크스페이스: C:\Users\gunma\workspace\invoice-web
- 작업 기준일: 오늘 날짜를 currentDate로 사용
- 스택 제약:
  - Next.js 15 App Router (Route Group 구조 유지)
  - TypeScript (any 타입 금지)
  - Tailwind CSS + shadcn/ui
  - Zustand (상태관리)
  - React Hook Form + Zod (폼 검증)
  - 레이어드 아키텍처: Controller → Service → Repository

---

## 제품 개요

**한 줄 요약**: 노션(Notion)에서 입력한 견적서 데이터를 고객이 전용 웹 URL로 확인하고 PDF로 다운로드할 수 있는 서비스.

**핵심 사용자 여정**:
1. 사업자(Admin)가 노션 데이터베이스에 견적서 항목을 입력한다.
2. 시스템이 노션 API를 통해 데이터를 읽어 웹 견적서 페이지를 자동 생성한다.
3. 고객(Client)은 공유받은 URL(`/invoice/[id]`)에서 견적서를 확인한다.
4. 고객이 "PDF 다운로드" 버튼을 누르면 브라우저에서 PDF 파일이 생성·저장된다.

---

## PRD 작성 지시사항

현재 프로젝트 파일 구조(`app/`, `components/`, `types/`, `lib/`)를 먼저 탐색한 뒤,
아래 섹션을 **한국어**로 작성하세요.
각 섹션은 구체적이고 개발자가 바로 구현할 수 있는 수준으로 작성합니다.

### 섹션 목록

#### 1. 제품 목표 및 성공 지표
- MVP 목표 (3가지 이내)
- 성공 지표 (측정 가능한 KPI, 예: 고객 PDF 다운로드 전환율 > 80%)
- MVP 범위 밖 항목 (Out of Scope) 명시

#### 2. 사용자 및 페르소나
- Admin (견적서 작성자): 역할, 기술 수준, 주요 Pain Point
- Client (견적서 수신자): 역할, 기술 수준, 주요 Pain Point

#### 3. 핵심 기능 명세 (Feature Spec)

각 기능마다 아래 형식으로 작성:
```
**F-{번호}: {기능명}**
- 우선순위: P0 / P1 / P2
- 설명: (1~2문장)
- 수락 기준 (Acceptance Criteria):
  - [ ] AC1
  - [ ] AC2
- 기술 노트: (구현 힌트, 사용 라이브러리 등)
```

반드시 포함할 기능:
- F-01: 노션 API 연동 및 견적서 데이터 동기화
- F-02: 공개 견적서 페이지 (`/invoice/[id]`)
- F-03: PDF 생성 및 다운로드
- F-04: 견적서 상태 표시 (발행됨 / 만료됨 / 취소됨)
- F-05: 관리자 대시보드 (기존 `/dashboard` 활용)
- F-06: 공유 링크 복사 기능

#### 4. 데이터 모델
- 노션 데이터베이스 스키마 (필드명, 타입, 필수 여부)
- `types/index.ts`에 추가할 TypeScript 인터페이스 정의 (코드 블록으로 작성)
- 예시:
  ```typescript
  export interface Invoice {
    id: string;
    notionPageId: string;
    // ...
  }
  ```

#### 5. API 설계
- 라우트 목록 (Next.js Route Handler 기준)
  | Method | Endpoint | 설명 | Auth |
  |--------|----------|------|------|
  | GET | /api/invoices/[id] | 견적서 단건 조회 | 없음 |
  | POST | /api/invoices/sync | 노션 동기화 트리거 | Admin |
  | GET | /api/invoices/[id]/pdf | PDF 스트림 반환 | 없음 |

#### 6. 라우팅 및 페이지 구조
기존 Route Group 구조를 확장하여 추가할 경로:
```
app/
├── (public)/
│   └── invoice/
│       └── [id]/
│           └── page.tsx   # 공개 견적서 뷰
└── (dashboard)/
    └── dashboard/
        └── invoices/
            └── page.tsx   # 관리자 견적서 목록
```

#### 7. UI/UX 요구사항
- 공개 견적서 페이지 레이아웃 설명 (헤더, 항목 테이블, 합계, 액션 버튼)
- 반응형 중단점 (모바일 우선)
- PDF 출력 시 페이지 여백·폰트·색상 규칙
- 다크모드 지원 여부 (공개 페이지는 라이트 고정 권장)

#### 8. 기술 스택 및 외부 의존성
- 신규 추가 패키지 목록 (패키지명, 버전, 용도)
  - 예: `@notionhq/client`, `puppeteer` or `@react-pdf/renderer`, `qrcode`
- 환경 변수 목록 (`.env.local` 키 이름과 설명)

#### 9. 구현 로드맵 (스프린트 계획)
- Sprint 1 (1주): 노션 API 연동 + 데이터 모델 확정
- Sprint 2 (1주): 공개 견적서 페이지 UI
- Sprint 3 (1주): PDF 생성 기능
- Sprint 4 (1주): 관리자 대시보드 연동 + 배포

각 스프린트마다 완료 정의(Definition of Done) 포함.

#### 10. 보안 및 엣지 케이스
- 공개 URL 추측 방지 방안 (UUID v4, 단기 토큰 등)
- 만료된 견적서 접근 시 처리
- 노션 API 레이트 리밋 대응
- PDF 생성 실패 시 폴백 UX

---

## 출력 형식 규칙

- 파일: `docs/PRD.md`
- 언어: 한국어 (코드·변수명·파일명은 영어 유지)
- 마크다운 사용 (GFM 호환)
- 섹션 번호 유지
- 코드 블록은 언어 태그 명시 (`typescript`, `bash` 등)
- 표는 GFM 테이블 형식
- 이모지 사용 금지
- 총 분량: 600줄 이상 (충분한 개발 가이드 포함)

작성 전에 `app/`, `components/`, `types/index.ts`, `lib/` 구조를 Read/Glob 툴로 탐색하여
기존 코드와 충돌 없이 일관성 있는 PRD를 작성하세요.
```

---

## 사용 가이드

### 1단계: 프롬프트 실행
위 코드 블록 안의 텍스트를 Claude Code 프롬프트 입력창에 붙여넣습니다.

### 2단계: 생성 결과 검토
`docs/PRD.md` 파일이 생성되면 아래 항목을 검토하세요.

| 체크 항목 | 확인 방법 |
|-----------|-----------|
| 노션 DB 스키마가 실제 사용 필드와 일치하는가 | 직접 수정 |
| TypeScript 인터페이스가 기존 `types/index.ts`와 충돌 없는가 | 코드 리뷰 |
| PDF 라이브러리 선택이 Next.js 15 Edge Runtime과 호환되는가 | 호환성 확인 |
| 공개 URL 보안 방식이 비즈니스 요건에 맞는가 | 팀 협의 |

### 3단계: 구현 시작
PRD 검토 후 Claude Code에게 다음과 같이 요청:
```
docs/PRD.md를 기반으로 Sprint 1 구현을 시작해주세요.
노션 API 연동부터 시작하겠습니다.
```

---

## 커스터마이징 힌트

필요에 따라 메타 프롬프트의 아래 부분을 수정하세요.

- **PDF 라이브러리 변경**: `puppeteer` (서버 렌더링) vs `@react-pdf/renderer` (React 컴포넌트) vs `html2canvas + jspdf` (클라이언트)
- **인증 추가**: Admin 대시보드에 NextAuth.js 또는 Clerk 인증 추가 원하면 섹션 3에 F-07로 명시
- **다국어 지원**: 견적서 언어(한/영) 전환이 필요하면 섹션 8에 `next-intl` 추가
- **이메일 알림**: 견적서 발송 기능 원하면 섹션 3에 F-08 (Resend / Nodemailer) 추가
