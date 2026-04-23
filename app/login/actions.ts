'use server'

import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { verifyCredentials, createSessionToken } from '@/lib/auth/session'
import { loginSchema } from '@/lib/validations/auth'
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit'

// 서버 액션 반환 타입 정의
export type LoginActionResult =
  | { success: true }
  | { success: false; error: string }

/**
 * 로그인 서버 액션
 * 자격증명을 검증하고 세션 쿠키를 설정한 뒤 리다이렉트합니다.
 */
export async function loginAction(
  formData: FormData
): Promise<LoginActionResult> {
  // 클라이언트 IP 추출 — 프록시 환경(Vercel, Nginx 등) 대응
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  // IP별 레이트 리밋 검사 (5분 윈도우 / 최대 5회)
  if (!checkRateLimit(ip)) {
    return {
      success: false,
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    }
  }

  // 폼 데이터 추출
  const rawInput = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  // Zod 스키마로 런타임 유효성 검사
  const parsed = loginSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { success: false, error: '이메일 또는 비밀번호를 올바르게 입력해주세요' }
  }

  const { email, password } = parsed.data

  // 자격증명 검증 (bcrypt 해시 비교)
  const isValid = await verifyCredentials(email, password)
  if (!isValid) {
    return { success: false, error: '이메일 또는 비밀번호가 올바르지 않습니다' }
  }

  // 로그인 성공 시 해당 IP의 레이트 리밋 카운터 초기화
  resetRateLimit(ip)

  // JWT 세션 토큰 생성
  const token = await createSessionToken({ email })

  // 쿠키 설정 — getCurrentSession()과 동일한 환경변수로 쿠키명 통일
  const cookieName = process.env.AUTH_COOKIE_NAME ?? 'auth-session'
  const maxAge = Number(process.env.AUTH_SESSION_MAX_AGE ?? '604800')

  const cookieStore = await cookies()
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })

  // 오픈 리다이렉트 방지: 화이트리스트 조건 검증
  const rawRedirect = formData.get('redirectTo')
  const redirectTo =
    typeof rawRedirect === 'string' &&
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.includes('http')
      ? rawRedirect
      : '/'

  redirect(redirectTo)
}
