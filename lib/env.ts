/**
 * 필수 환경변수를 안전하게 읽어오는 유틸리티
 * 환경변수가 설정되지 않은 경우 명확한 에러 메시지와 함께 예외를 발생시킵니다
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `환경 변수 ${key}가 설정되지 않았습니다. .env.local.example을 참고하세요.`
    )
  }
  return value
}
