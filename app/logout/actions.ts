'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * 로그아웃 서버 액션
 * 세션 쿠키를 삭제하고 로그인 페이지로 리다이렉트합니다.
 */
export async function logoutAction(): Promise<never> {
  // AUTH_COOKIE_NAME 환경변수로 쿠키명 결정 (session.ts와 동일 로직)
  const cookieName = process.env.AUTH_COOKIE_NAME ?? 'auth-session'

  const cookieStore = await cookies()
  cookieStore.delete(cookieName)

  redirect('/login')
}
