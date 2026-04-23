import { jwtVerify, errors } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * AUTH_SECRET 환경변수로 JWT 서명 검증에 사용할 시크릿 키를 생성합니다.
 * Edge Runtime에서 TextEncoder를 직접 사용합니다.
 */
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? ''
  return new TextEncoder().encode(secret)
}

/**
 * 세션 쿠키명을 환경변수로 결정합니다.
 * lib/auth/session.ts와 동일한 기본값을 사용합니다.
 */
function getCookieName(): string {
  return process.env.AUTH_COOKIE_NAME ?? 'auth-session'
}

/**
 * 쿠키를 삭제하는 응답 헤더를 설정합니다.
 * 만료된 토큰 또는 검증 실패 시 클라이언트 측 쿠키를 제거합니다.
 */
function deleteCookie(response: NextResponse): void {
  const cookieName = getCookieName()
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // 즉시 만료
  })
}

/**
 * Edge Runtime용 JWT 미들웨어 — 어드민 라우트를 보호합니다.
 *
 * 주의: lib/auth/session.ts를 import하면 bcryptjs가 번들에 포함되어
 * Edge Runtime에서 동작하지 않으므로, jose를 직접 사용합니다.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const cookieName = getCookieName()
  const token = request.cookies.get(cookieName)?.value

  // 토큰이 없는 경우 → 로그인 페이지로 리다이렉트
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl, { status: 307 })
  }

  try {
    const secret = getSecret()
    await jwtVerify(token, secret)

    // 검증 성공 + /login 경로 접근 → 대시보드로 리다이렉트
    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url), { status: 307 })
    }

    // 검증 성공 → 요청 통과
    return NextResponse.next()
  } catch (error) {
    // 토큰 만료 처리 → 쿠키 삭제 후 만료 안내 리다이렉트
    if (error instanceof errors.JWTExpired) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('reason', 'expired')
      const response = NextResponse.redirect(loginUrl, { status: 307 })
      deleteCookie(response)
      return response
    }

    // 기타 JWT 검증 실패 (서명 불일치, 형식 오류 등) → 쿠키 삭제 후 리다이렉트
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl, { status: 307 })
    deleteCookie(response)
    return response
  }
}

/**
 * matcher 설정: 공개 경로를 제외한 모든 어드민 라우트에 미들웨어를 적용합니다.
 *
 * 제외 경로:
 * - /login — 인증 페이지
 * - /quote/** — 클라이언트 공개 견적서 뷰어
 * - /_next/** — Next.js 내부 리소스 (JS, CSS, 이미지 등)
 * - /fonts/** — 정적 폰트 파일
 * - /favicon.ico — 파비콘
 * - /api/auth/** — 인증 API 엔드포인트
 */
export const config = {
  matcher: ['/((?!login|quote|_next|fonts|favicon\\.ico|api/auth).*)'],
}
