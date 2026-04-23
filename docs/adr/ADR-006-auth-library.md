# ADR-006: 관리자 인증 라이브러리 선정

> 날짜: 2026-04-24 | 상태: 승인됨(Accepted)

## 결정

**`jose` + `bcryptjs` 직접 구현을 채택한다.**

## 배경

Phase 6에서 어드민 대시보드에 로그인 인증이 필요해졌다. 1인 사업자 단일 계정 구조이며, Notion을 데이터 저장소로 사용하는 이 프로젝트에는 별도 DB가 없다. Vercel Edge Runtime 위에서 미들웨어로 JWT 검증이 필요하다.

## 비교 검토

| 항목 | NextAuth.js v5 | Lucia Auth | jose + bcryptjs 직접 구현 |
|---|---|---|---|
| Edge Runtime 호환 | 부분적 (어댑터 의존) | 미지원 | ✅ jose는 Edge 완전 호환 |
| DB 필요 여부 | DB 또는 어댑터 필수 | DB 필수 | ✅ 불필요 (환경변수 기반) |
| 의존성 부담 | 높음 (대형 프레임워크) | 보통 | ✅ 최소 (jose, bcryptjs만) |
| Next.js 16 호환성 | 불확실 (breaking change 위험) | 불확실 | ✅ 직접 제어 가능 |
| 장래성 | 활발히 개발 중 | ⚠️ 유지보수 모드 전환 발표 | ✅ RFC 7519 표준, 안정적 |
| 구현 투명성 | 낮음 (추상화 다수) | 보통 | ✅ 높음 (코드 직접 파악 가능) |

## 결정 근거

1. **DB 불필요**: 단일 관리자 계정이므로 이메일/비밀번호 해시를 환경변수에 보관하면 충분하다. ORM이나 세션 스토어가 필요 없다.
2. **NextAuth v5 위험 회피**: Next.js 16은 Next.js 15 이후 릴리즈로, NextAuth v5가 아직 완전히 지원하지 않을 수 있는 breaking change 영역이 존재한다.
3. **Lucia 유지보수 모드**: Lucia Auth 공식 채널에서 유지보수 모드 전환이 발표되어 장기적 의존성으로 부적합하다.
4. **요구사항 단순성**: 로그인 → JWT 발급 → 미들웨어 검증이 전부이며, 자체 구현이 오히려 디버깅과 커스터마이징에 유리하다.

## 영향

- `middleware.ts`: `jose`의 `jwtVerify`로 Edge Runtime에서 토큰 검증
- `app/api/auth/` 또는 Server Action: `bcryptjs`의 `compare`로 비밀번호 검증 (서버 전용)
- `lib/auth/` 디렉터리에 JWT 발급/검증 유틸 구현 예정
- 환경변수: `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `AUTH_SECRET`, `AUTH_COOKIE_NAME`, `AUTH_SESSION_MAX_AGE`

## 제약사항

- `bcryptjs`는 Edge Runtime에서 사용 불가 — 서버 액션 또는 Route Handler에서만 호출
- `jose`는 미들웨어와 서버 양쪽 모두 사용 가능
- `AUTH_SECRET`는 반드시 32바이트 이상의 랜덤 문자열 사용 (단순 문자열 금지)
