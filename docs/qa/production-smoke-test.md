# 프로덕션 스모크 테스트 체크리스트

> 테스트 환경: https://invoice-web-beta.vercel.app
> 테스트 일자: 2026-04-23
> 테스트자: Claude Sonnet 4.6 (Playwright CLI + curl)

---

## 사전 조건

- [x] Notion DB에 테스트용 견적서 1건 존재 (status: 초안)
- [x] 견적서에 items 1건 연결됨 (itm-9999-1)
- [x] `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `NEXT_PUBLIC_APP_ORIGIN` 환경 변수 Vercel에 등록 확인

---

## TC-01: 어드민 대시보드

| # | 시나리오 | 기대 결과 | 결과 |
|---|----------|-----------|------|
| 1 | `https://invoice-web-beta.vercel.app/` 접속 | 현황 카드(전체/상태별/이번달 금액) 실데이터 렌더링 | ✅ PASS |
| 2 | 사이드바 ThemeToggle 표시 | 데스크톱에서 사이드바 하단에 토글 노출 | ✅ PASS |

스크린샷: `docs/qa/screenshots/f407/tc01-dashboard.png`

---

## TC-02: 견적서 목록

| # | 시나리오 | 기대 결과 | 결과 |
|---|----------|-----------|------|
| 1 | `/invoices` 접속 | 견적서 목록 실데이터 표시 (전체 1건) | ✅ PASS |
| 2 | 상태 필터 표시 | 전체/초안/발송됨/열람됨/수락됨/거절됨 탭 렌더링 | ✅ PASS |
| 3 | 검색 입력창 | "견적서명 / 고객사 검색" 플레이스홀더 표시 | ✅ PASS |

스크린샷: `docs/qa/screenshots/f407/tc02-invoice-list.png`

---

## TC-03: 견적서 상세 미리보기

| # | 시나리오 | 기대 결과 | 결과 |
|---|----------|-----------|------|
| 1 | `/invoices/{id}` 접속 | 항목 테이블, 금액, 고객 정보 렌더링 | ✅ PASS |
| 2 | BUG-002 수정 확인 | 금액 컬럼 = 단가 × 수량 (₩1,000,000) | ✅ PASS |

스크린샷: `docs/qa/screenshots/f407/tc03-invoice-detail.png`

---

## TC-05: 공개 견적서 뷰어

| # | 시나리오 | 기대 결과 | 결과 |
|---|----------|-----------|------|
| 1 | `/quote/{slug}` 접속 | 고객명/항목 테이블/총액/유효기간 렌더링 | ✅ PASS |
| 2 | 금액 포맷 | `₩1,000,000` 형식 | ✅ PASS |
| 3 | 어드민 사이드바 미표시 | 사이드바 없음 확인 | ✅ PASS |
| 4 | PDF 다운로드 버튼 표시 | 우상단 "PDF 다운로드" 버튼 노출 | ✅ PASS |
| 5 | 존재하지 않는 slug | "잘못된 주소입니다." 공개 전용 404 (`HTTP 404`) | ✅ PASS |

스크린샷: `docs/qa/screenshots/f407/tc05-public-viewer.png`, `tc06-404.png`

---

## TC-06: 보안 헤더

`curl -sI https://invoice-web-beta.vercel.app/`

| # | 헤더 | 기대값 | 실측값 | 결과 |
|---|------|--------|--------|------|
| 1 | `X-Frame-Options` | `DENY` | `DENY` | ✅ PASS |
| 2 | `X-Content-Type-Options` | `nosniff` | `nosniff` | ✅ PASS |
| 3 | `X-XSS-Protection` | `1; mode=block` | `1; mode=block` | ✅ PASS |
| 4 | `Cache-Control` (공개 뷰어) | `private, no-store` | `private, no-cache, no-store, ...` | ✅ PASS |
| 5 | `X-Robots-Tag` (공개 뷰어) | `noindex, nofollow` | `noindex, nofollow` | ✅ PASS |

---

## TC-07: 모바일 (375px)

| # | 시나리오 | 결과 |
|---|----------|------|
| 1 | 대시보드 375px | ✅ PASS — 카드 세로 배열, 햄버거 메뉴 노출 |
| 2 | 공개 뷰어 375px | ✅ PASS — 단가/금액 컬럼 숨김, 총 금액 표시 |

스크린샷: `docs/qa/screenshots/f407/tc07-mobile.png`

---

## HTTP 상태 코드 요약

| 경로 | 기대 | 실측 |
|------|------|------|
| `/` | 200 | ✅ 200 |
| `/invoices` | 200 | ✅ 200 |
| `/quote/{valid-id}` | 200 | ✅ 200 |
| `/quote/invalid-slug-test` | 404 | ✅ 404 |

---

## 결과 요약

| 구분 | 전체 | 통과 | 실패 |
|------|------|------|------|
| TC-01 대시보드 | 2 | 2 | 0 |
| TC-02 목록 | 3 | 3 | 0 |
| TC-03 상세 | 2 | 2 | 0 |
| TC-05 공개 뷰어 | 5 | 5 | 0 |
| TC-06 보안 헤더 | 5 | 5 | 0 |
| TC-07 모바일 | 2 | 2 | 0 |
| **합계** | **19** | **19** | **0** |

---

## 발견된 이슈

| # | 심각도 | 재현 경로 | 설명 | 상태 |
|---|--------|-----------|------|------|
| BUG-002 | Medium | `/quote/{slug}` 금액 컬럼 | Notion `amount` 속성 값 오류 → `quantity × unitPrice` 계산으로 수정 | ✅ 수정 완료 |

---

## 서명

- 테스터: Claude Sonnet 4.6 (자동 테스트)
- 완료 일자: 2026-04-23
- 배포 커밋: 2778c3b
- 프로덕션 URL: https://invoice-web-beta.vercel.app
