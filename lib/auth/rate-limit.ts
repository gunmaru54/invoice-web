/**
 * 인메모리 IP별 로그인 레이트 리밋
 *
 * 한계:
 * - 인메모리 저장소는 서버리스 cold start 시 초기화됨.
 *   분산 환경에서는 Upstash Redis 등 외부 스토어 필요.
 * - 단일 인스턴스에서만 유효 (수평 확장 시 인스턴스 간 공유 불가).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// 모듈 레벨 싱글톤 Map — 서버 프로세스 생존 기간 동안 유지
const attempts = new Map<string, RateLimitEntry>()

// 허용 최대 시도 횟수
const MAX_ATTEMPTS = 5

// 슬라이딩 윈도우: 5분
const WINDOW_MS = 5 * 60 * 1000

/**
 * IP별 레이트 리밋을 확인합니다.
 * @param ip - 클라이언트 IP 주소
 * @returns 요청을 허용하면 true, 차단해야 하면 false
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  // 윈도우가 만료된 경우 카운터 리셋
  if (entry && now > entry.resetAt) {
    attempts.delete(ip)
  }

  const current = attempts.get(ip)

  // 최대 시도 횟수 초과 시 차단
  if (current && current.count >= MAX_ATTEMPTS) {
    return false
  }

  // 첫 시도: 새 엔트리 생성, 이후 시도: 카운터 증가
  if (!current) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  } else {
    attempts.set(ip, { count: current.count + 1, resetAt: current.resetAt })
  }

  return true
}

/**
 * 로그인 성공 시 IP의 레이트 리밋 카운터를 초기화합니다.
 * @param ip - 클라이언트 IP 주소
 */
export function resetRateLimit(ip: string): void {
  attempts.delete(ip)
}
