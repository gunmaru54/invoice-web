# ADR-005: PDF 라이트 테마 고정 계약

- **상태**: 승인됨
- **날짜**: 2026-04-24
- **작성자**: UI/UX 아키텍트

## 맥락

이 프로젝트는 `next-themes`를 사용해 라이트/다크 모드를 지원합니다. 그러나 PDF 생성에 사용하는 `@react-pdf/renderer`는 브라우저 DOM의 CSS 변수(`--background`, `--foreground` 등)를 읽지 않고, React 컴포넌트의 `style` prop에 직접 전달된 값만 사용합니다.

## 결정

`components/invoice/InvoicePDF.tsx`의 색상값은 항상 라이트 팔레트 고정값(`#ffffff`, `#111111` 등)을 사용합니다. 다크모드 CSS 변수(`bg-background`, `text-foreground`)로 치환하지 않습니다.

## 이유

1. `@react-pdf/renderer`는 PDF를 서버 또는 클라이언트 측 Canvas/렌더링 파이프라인으로 생성하며, DOM CSS 변수를 참조하지 않습니다.
2. PDF 문서는 인쇄 매체를 위한 계약 문서이므로, 다크 배경은 인쇄 잉크 낭비와 가독성 저하를 유발합니다.
3. 견적서 PDF는 고객에게 이메일로 전달되거나 인쇄되는 공식 문서로, 항상 흰 배경과 검은 텍스트가 적합합니다.

## 결과

- `InvoicePDF.tsx` 내 `StyleSheet.create()`의 모든 색상값은 의도적인 고정값입니다.
- 향후 다크모드 관련 리팩토링 시 이 파일은 대상에서 제외해야 합니다.
- 파일 상단 주석으로 이 계약을 명시하여 다른 개발자가 semantic token으로 실수 치환하지 않도록 합니다.

## 관련 파일

- `components/invoice/InvoicePDF.tsx` — PDF 렌더링 컴포넌트
- `components/invoice/DownloadPdfButton.tsx` — PDF 다운로드 트리거
- `ADR-001-pdf-library.md` — PDF 라이브러리 선택 배경
