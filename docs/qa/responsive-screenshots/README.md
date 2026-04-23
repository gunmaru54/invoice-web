# 반응형 검증 스크린샷

Chrome DevTools Device Toolbar로 아래 4개 뷰포트를 검증합니다.

| 뷰포트 | 기기 | 너비 |
|--------|------|------|
| Mobile S | iPhone SE | 375px |
| Mobile M | iPhone 14 Pro | 393px |
| Tablet | iPad | 768px |
| Desktop | - | 1440px |

## 검증 페이지
1. 어드민 대시보드 (`/`)
2. 견적서 목록 (`/invoices`)
3. 공개 뷰어 (`/quote/{slug}`)

## 검증 기준
- 가로 스크롤바 미발생 (견적 항목 테이블 제외)
- 텍스트 overflow/truncation 없음
- 버튼/링크 터치 영역 44px 이상
- 사이드바: 768px 이상에서 노출, 미만에서 모바일 헤더로 대체
