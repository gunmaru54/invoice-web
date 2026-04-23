import { getCurrentSession } from './session'
import { redirect } from 'next/navigation'
import type { SessionPayload } from './types'

/**
 * 인증 필수 가드 함수
 * 세션이 없으면 로그인 페이지로 리다이렉트하고, 있으면 페이로드를 반환합니다.
 * 서버 컴포넌트 및 서버 액션 전용 — 레이아웃 최상단에서 이중 방어 용도로 사용합니다.
 */
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getCurrentSession()
  if (!session) {
    redirect('/login')
  }
  return session
}
