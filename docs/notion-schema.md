# Notion 데이터베이스 스키마

> 이 문서는 견적서 웹 뷰어와 연동할 Notion 데이터베이스를 구성하는 기준 문서입니다.
> **속성명과 타입을 정확히 일치시켜야 합니다.** 오타 발생 시 해당 필드가 빈 값으로 표시됩니다.

---

## 1. Notion Integration 설정

1. [Notion 개발자 페이지](https://www.notion.so/my-integrations)에서 새 Integration 생성
2. 생성된 **Internal Integration Token**을 `.env.local`의 `NOTION_API_KEY`에 입력
3. 견적서 데이터베이스 페이지 우상단 **...** → **연결** → 생성한 Integration 추가
4. 데이터베이스 URL에서 **Database ID** 추출 → `.env.local`의 `NOTION_DATABASE_ID`에 입력

> Database ID 추출 방법: `https://www.notion.so/{workspace}/{DATABASE_ID}?v=...` 형식에서 `?` 앞 32자리 문자열입니다.

---

## 2. 데이터베이스 속성 목록

아래 속성명과 타입을 **정확히** 동일하게 생성해야 합니다. 속성명은 **영문**으로 입력하며, 대소문자·언더스코어까지 일치해야 합니다.

| 속성명 | 타입 | TS 필드 | 필수 | 예시값 | 설명 |
|---|---|---|---|---|---|
| `Name` | Title | `title` | 필수 | 웹사이트 리뉴얼 견적서 | 견적서 제목 |
| `client_name` | Text | `clientName` | 필수 | 주식회사 ABC | 고객사명 |
| `client_email` | Email | `clientEmail` | 선택 | client@example.com | 고객 이메일 |
| `issue_date` | Date | `issueDate` | 필수 | 2026-04-23 | 발행일 (YYYY-MM-DD) |
| `expiry_date` | Date | `expiryDate` | 선택 | 2026-05-23 | 유효기간 (YYYY-MM-DD) |
| `status` | Select | `status` | 필수 | draft | 견적서 상태 (허용값 5종) |
| `total_amount` | Number | `totalAmount` | 필수 | 5500000 | 총 견적 금액 (원화 정수) |
| `note` | Text | `note` | 선택 | 부가세 포함 금액입니다. | 비고 |

### status 선택 허용값

`status` 속성의 Select 옵션은 아래 5가지만 허용합니다. **영문 소문자로 정확히 입력해야 합니다.**

| 값 | 화면 표시 (어드민) | 화면 표시 (공개 뷰어) | 의미 |
|---|---|---|---|
| `draft` | 초안 | 초안 | 작성 중인 견적서 |
| `sent` | 발송됨 | 검토 중 | 고객에게 URL 발송 완료 |
| `viewed` | 열람됨 | 열람됨 | 고객이 URL을 열람함 |
| `accepted` | 수락됨 | 수락됨 | 고객이 견적을 수락함 |
| `rejected` | 거절됨 | 거절됨 | 고객이 견적을 거절함 |

> `status` 값이 위 목록에 없으면 자동으로 `draft`로 처리됩니다.

---

## 3. 견적 항목 — 관계형 데이터베이스 (items DB)

견적 항목은 `Invoice` DB와 별도로 구성된 **`items` 관계형 데이터베이스**에서 관리합니다.
`Invoice` DB의 `items` 속성(Relation)을 통해 각 견적서와 해당 항목들이 연결됩니다.

### 연동 구조

```
Invoice DB
  └─ items : Relation → items DB

items DB
  └─ 각 행 = 견적 항목 1건
```

### items DB 속성 목록

| 속성명 | 타입 | 필수 | 예시값 | 설명 |
|---|---|---|---|---|
| `item_name` | Title | 필수 | Frontend Development | 견적 항목명. 비어 있으면 해당 항목 무시 |
| `qty` | Number | 필수 | 1 | 수량 (양의 정수) |
| `unit_price` | Number | 필수 | 1000000 | 단가 (원화 정수) |
| `amount` | Number | 필수 | 1000000 | qty × unit_price (원화 정수) |
| `note` | Text | 선택 | Responsive web | 항목별 비고 |

### 주의사항

- `Invoice` DB의 `items` 속성 타입은 반드시 **Relation**이어야 합니다.
- `items` DB 속성명은 위 목록과 **정확히** 일치해야 합니다 (대소문자 포함).
- `item_name`이 비어 있는 항목은 자동으로 무시됩니다.

### 예시

| item_name | qty | unit_price | amount | note |
|---|---|---|---|---|
| Planning & Design | 1 | 1000000 | 1000000 | Requirements analysis, wireframe |
| UI/UX Design | 1 | 1500000 | 1500000 | |
| Frontend Development | 1 | 2000000 | 2000000 | Responsive web |
| Backend API Development | 1 | 800000 | 800000 | |
| QA & Deployment | 1 | 200000 | 200000 | |

---

## 4. 공개 URL 구조

공개 견적서 URL은 `https://{도메인}/quote/{pageId}` 형식입니다.

- `pageId`는 Notion 페이지 ID (UUID)를 그대로 사용합니다.
- 예: `https://example.com/quote/34ad7b22-089b-8027-a5b5-dbadb6e10036`
- 어드민 상세 페이지의 **URL 복사** 버튼을 통해 공개 URL을 클립보드에 복사할 수 있습니다.

---

## 5. 연동 흐름 요약

```
Notion DB 속성 입력
  └─ Name, slug, client_name, ... (섹션 2의 속성 기반)
  └─ 본문 테이블 (섹션 3의 견적 항목)
        ↓
lib/notion.ts
  └─ getInvoices()         → 목록 조회 (속성만, 테이블 미조회)
  └─ getInvoiceBySlug()    → 공개 뷰어 (속성 + 테이블)
  └─ getInvoiceById()      → 어드민 상세 (속성 + 테이블)
        ↓
웹 뷰어 / 어드민 대시보드
```
