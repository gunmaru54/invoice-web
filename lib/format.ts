/**
 * 공통 포맷 유틸리티 함수
 * 금액, 날짜 등 표시 형식을 일관되게 처리합니다.
 */

/** 금액을 한국 원화 형식으로 포맷 */
export function formatKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount)
}

/**
 * 날짜 문자열을 한국어 형식으로 포맷
 * YYYY-MM-DD → "YYYY년 MM월 DD일"
 */
export function formatDate(dateStr: string): string {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return dateStr
  const [, year, month, day] = match
  return `${year}년 ${month}월 ${day}일`
}
