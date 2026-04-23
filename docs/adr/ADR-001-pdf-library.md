# ADR-001: PDF 생성 라이브러리 선정

> 날짜: 2026-04-22 | 상태: 채택(Accepted)

## 결정

**`@react-pdf/renderer`를 채택한다.**

## 배경

Phase 1(F103) 검증 결과, `@react-pdf/renderer`가 Next.js 16 / React 19 환경에서 정상적으로 설치되고 프로덕션 빌드(`npm run build`)가 성공하였다. 별도의 호환성 패치나 워크어라운드 없이 즉시 사용 가능한 것으로 확인되었다.

## 근거

| 항목 | 결과 |
|---|---|
| 설치 (`npm install @react-pdf/renderer`) | ✅ 성공 (52개 패키지 추가) |
| 프로덕션 빌드 (`npm run build`) | ✅ 성공 (경고/오류 없음) |
| TypeScript 타입 검사 | ✅ 통과 |
| React 19 호환성 | ✅ 런타임 오류 없음 |
| Next.js 16 App Router 호환성 | ✅ 클라이언트 컴포넌트(`"use client"`)에서 사용 가능 |

## 영향

- `components/invoice/InvoicePDF.tsx`: Phase 3(F302)에서 `@react-pdf/renderer`의 `Document`, `Page`, `View`, `Text`, `PDFDownloadLink` API를 사용하여 구현
- `"use client"` 파일에서만 import 가능 (서버 컴포넌트에서 직접 사용 금지)
- 한글 폰트 내장 필요: `public/fonts/`에 Pretendard 또는 Noto Sans KR 서브셋 배치 예정

## 검토한 대안

| 라이브러리 | 기각 이유 |
|---|---|
| `react-to-print` | `window.print()` 기반 — 브라우저 인쇄 다이얼로그 의존, PDF 파일명/레이아웃 제어 불가 |
| `pdfmake` | 순수 JS로 호환성 우수하나 React 컴포넌트 방식이 아닌 JSON 설정 방식 — 유지보수 난이도 높음 |
| `Puppeteer` | Vercel serverless 런타임 50MB 제한으로 배포 불가. 별도 서버 필요 |

## 구현 시 주의사항

- `PDFDownloadLink`는 클라이언트 사이드 렌더링만 지원 — `dynamic import` 또는 `Suspense` 처리 필요
- 한글 폰트 없으면 텍스트가 깨짐 — `Font.register()`로 반드시 폰트 등록 필요
- 파일명 규칙: `{slug}-{clientName}.pdf`
