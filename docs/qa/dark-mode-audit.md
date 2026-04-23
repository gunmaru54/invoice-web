# 다크모드 감사 체크리스트

> 이 문서는 WCAG AA 기준(대비율 4.5:1 이상)을 충족하는지 수동으로 검사하기 위한 QA 체크리스트입니다.
> 작성일: 2026-04-24

---

## F505: WCAG AA 감사 — 컴포넌트별 대비 확인

### 도구

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- 브라우저 DevTools > Accessibility > Color Contrast
- Chrome Lighthouse > Accessibility 탭

### 기준

| 텍스트 크기 | 필요 대비율 |
|-------------|-------------|
| 일반 텍스트 (< 18pt) | 4.5:1 이상 |
| 굵은 텍스트 (≥ 14pt Bold) 또는 큰 텍스트 (≥ 18pt) | 3:1 이상 |
| UI 컴포넌트, 아이콘 경계 | 3:1 이상 |

---

### 어드민 영역 — 라이트 모드

| 컴포넌트 | 요소 | 전경색 | 배경색 | 예상 대비율 | 확인 |
|----------|------|--------|--------|-------------|------|
| Sidebar | 네비게이션 링크 (비활성) | `text-foreground/60` | `bg-muted/30` | ≥ 4.5:1 | [ ] |
| Sidebar | 네비게이션 링크 (활성) | `text-primary-foreground` | `bg-primary` | ≥ 4.5:1 | [ ] |
| Sidebar | 로고 텍스트 | `text-foreground` | `bg-muted/30` | ≥ 4.5:1 | [ ] |
| InvoiceList | 견적서 제목 | `text-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceList | 부제(고객사·날짜) | `text-muted-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceCard | 카드 제목 | `text-foreground` | `bg-card` | ≥ 4.5:1 | [ ] |
| InvoiceCard | 카드 부제 | `text-muted-foreground` | `bg-card` | ≥ 4.5:1 | [ ] |
| InvoiceCard | 금액 | `text-foreground` | `bg-card` | ≥ 4.5:1 | [ ] |
| Badge (default) | 배지 텍스트 | `text-primary-foreground` | `bg-primary` | ≥ 4.5:1 | [ ] |
| Badge (secondary) | 배지 텍스트 | `text-secondary-foreground` | `bg-secondary` | ≥ 4.5:1 | [ ] |
| Badge (destructive) | 배지 텍스트 | `text-destructive-foreground` | `bg-destructive` | ≥ 4.5:1 | [ ] |
| InvoiceFilters | 검색 입력 placeholder | `text-muted-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceFilters | 활성 필터 버튼 | `text-primary-foreground` | `bg-primary` | ≥ 4.5:1 | [ ] |
| Dashboard | 통계 카드 수치 | `text-foreground` | `bg-card` | ≥ 4.5:1 | [ ] |
| Dashboard | 통계 카드 레이블 | `text-muted-foreground` | `bg-card` | ≥ 4.5:1 | [ ] |

### 어드민 영역 — 다크 모드

| 컴포넌트 | 요소 | 확인 방법 | 확인 |
|----------|------|-----------|------|
| Sidebar | 전체 네비게이션 영역 | ThemeToggle 클릭 후 육안 확인 | [ ] |
| InvoiceList | 목록 행 hover 상태 | 마우스 오버 시 배경/텍스트 대비 | [ ] |
| InvoiceCard | 카드 테두리 가시성 | `border` 색상 vs `bg-card` | [ ] |
| Dashboard | 최근 견적서 행 hover | `-mx-2 px-2 hover:bg-muted/50` 대비 | [ ] |
| InvoiceEmptyState | 아이콘 가시성 | `text-muted-foreground/40` 대비 | [ ] |
| Loading skeleton | 스켈레톤 대비 | `bg-card` vs skeleton 색상 | [ ] |

---

### 공개 뷰어 영역 — 라이트 모드

| 컴포넌트 | 요소 | 전경색 | 배경색 | 예상 대비율 | 확인 |
|----------|------|--------|--------|-------------|------|
| QuoteViewerPage | 페이지 배경 | — | `bg-muted/20` | — | [ ] |
| QuoteViewerPage | 헤더 아이콘+텍스트 | `text-muted-foreground` | `bg-muted/20` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 견적서 카드 제목 | `text-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 고객명 | `text-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 부가 정보 | `text-muted-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 항목 테이블 헤더 | `text-muted-foreground` | `bg-muted/50` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 항목 행 텍스트 | `text-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| InvoiceViewer | 합계 금액 | `text-foreground` | `bg-background` | ≥ 4.5:1 | [ ] |
| ViewerThemeToggle | 아이콘 | `text-foreground` | `bg-background` | ≥ 3:1 | [ ] |

### 공개 뷰어 영역 — 다크 모드

| 컴포넌트 | 요소 | 확인 방법 | 확인 |
|----------|------|-----------|------|
| QuoteViewerPage | 전체 레이아웃 | ViewerThemeToggle 클릭 후 육안 확인 | [ ] |
| InvoiceViewer | 구분선 가시성 | `divide-y` border 색상 vs 배경 | [ ] |
| InvoiceViewer | 합계 섹션 강조 | 합계 영역 배경색 대비 | [ ] |
| DownloadPdfButton | 버튼 텍스트 | 다크모드 Button variant 확인 | [ ] |

---

## F506: 모바일 다크모드 QA 체크리스트

> 대상 디바이스: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad mini)

### 모바일 공통

| 항목 | 확인 방법 | 확인 |
|------|-----------|------|
| 시스템 다크모드 자동 감지 | iOS/Android 다크모드 설정 후 앱 새로고침 → 자동 전환 확인 | [ ] |
| FOUC 없음 | 다크모드 설정 상태에서 페이지 새로고침 → 흰 화면 깜빡임 없음 | [ ] |
| ThemeToggle 터치 타깃 | 44×44px 이상 (WCAG 2.5.5) — DevTools에서 측정 | [ ] |
| ViewerThemeToggle 터치 타깃 | 44×44px 이상 — DevTools에서 측정 | [ ] |

### 어드민 모바일 (375px~767px)

| 항목 | 확인 방법 | 확인 |
|------|-----------|------|
| MobileSidebar 다크모드 | 메뉴 열기 → Sheet 내부 배경·텍스트 대비 확인 | [ ] |
| MobileSidebar ThemeToggle 표시 | 드로어 하단에 ThemeToggle 버튼 노출 확인 | [ ] |
| MobileSidebar ThemeToggle 동작 | ThemeToggle 탭 → 테마 전환 확인 | [ ] |
| 헤더 영역 | 모바일 헤더 배경·텍스트 대비 다크모드 | [ ] |
| InvoiceList 행 hover 대안 | 모바일에서 focus-visible 링 가시성 | [ ] |
| InvoiceCard 그리드 | 다크모드에서 카드 경계 가시성 | [ ] |
| Dashboard 통계 카드 | 4열→2열→1열 반응형 시 대비 유지 | [ ] |
| Badge 가독성 | 소형 화면에서 badge 텍스트 대비 | [ ] |

### 공개 뷰어 모바일 (375px~767px)

| 항목 | 확인 방법 | 확인 |
|------|-----------|------|
| ViewerThemeToggle 노출 | PDF 버튼 좌측에 ThemeToggle 버튼 노출 확인 | [ ] |
| ViewerThemeToggle 인쇄 숨김 | 브라우저 인쇄 미리보기에서 버튼 미표시 확인 | [ ] |
| 견적서 본문 가독성 | 375px 다크모드에서 테이블 텍스트 확인 | [ ] |
| 스크롤 시 배경 | `bg-muted/20` 배경이 전체 스크롤 영역에 유지 | [ ] |
| 합계 금액 표시 | 좁은 화면에서 `break-all`로 금액 줄바꿈 + 다크모드 대비 | [ ] |

### PDF 다운로드 (모바일)

| 항목 | 확인 방법 | 확인 |
|------|-----------|------|
| PDF는 항상 라이트 테마 | 다크모드 상태에서 PDF 다운로드 → 파일 열어서 흰 배경 확인 | [ ] |
| 다운로드 버튼 터치 타깃 | 44×44px 이상 확인 | [ ] |

---

## 비고

- PDF 관련 색상은 항상 라이트 고정이며, 다크모드 대상이 아닙니다. (ADR-005 참고)
- 이 체크리스트는 스프린트마다 업데이트하며, 자동화 가능한 항목은 Playwright 테스트로 전환을 권장합니다.
