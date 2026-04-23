import { SignJWT, jwtVerify } from 'jose'
import bcryptjs from 'bcryptjs'
import type { SessionPayload } from './types'

// JWT 서명에 사용할 시크릿 키를 Uint8Array로 인코딩
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? ''
  return new TextEncoder().encode(secret)
}

/**
 * 관리자 자격증명 검증
 * ADMIN_EMAIL과 ADMIN_PASSWORD_HASH 환경변수와 비교하여 인증 여부를 반환합니다.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

  // 환경변수 미설정 시 인증 거부
  if (!adminEmail || !adminPasswordHash) {
    return false
  }

  // 이메일 일치 여부 확인
  const isEmailMatch = email === adminEmail

  // 비밀번호 해시 비교 (타이밍 공격 방지를 위해 이메일 불일치여도 compare 수행)
  const isPasswordMatch = await bcryptjs.compare(password, adminPasswordHash)

  return isEmailMatch && isPasswordMatch
}

/**
 * JWT 세션 토큰 생성
 * AUTH_SESSION_MAX_AGE 환경변수(초 단위)로 만료 시간을 설정합니다.
 */
export async function createSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>
): Promise<string> {
  const maxAge = process.env.AUTH_SESSION_MAX_AGE ?? '86400' // 기본값: 24시간
  const secret = getSecret()

  const token = await new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secret)

  return token
}

/**
 * JWT 세션 토큰 검증
 * 만료되었거나 서명이 일치하지 않는 경우 null을 반환합니다.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secret = getSecret()
    const { payload } = await jwtVerify(token, secret)

    // 페이로드 필드 검증
    if (
      typeof payload.email !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      return null
    }

    return {
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
    }
  } catch {
    // 만료, 서명 불일치 등 모든 JWT 오류를 null로 처리
    return null
  }
}

/**
 * 현재 요청의 세션 정보 조회
 * 서버 컴포넌트 및 서버 액션 전용 — 클라이언트에서 호출 불가
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  const cookieName = process.env.AUTH_COOKIE_NAME ?? 'auth-session'
  const token = cookieStore.get(cookieName)?.value

  // 세션 쿠키가 없으면 미인증 상태
  if (!token) {
    return null
  }

  return verifySessionToken(token)
}
