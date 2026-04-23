import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getCurrentSession } from '@/lib/auth/session'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: '로그인',
}

interface LoginPageProps {
  searchParams: Promise<{ reason?: string; redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // 이미 인증된 사용자는 대시보드로 리다이렉트
  const session = await getCurrentSession()
  if (session) {
    redirect('/')
  }

  const { reason, redirect: redirectTo } = await searchParams

  // reason=expired일 때 세션 만료 안내 메시지 표시
  const isExpired = reason === 'expired'

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            견적서 관리
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            관리자 계정으로 로그인하세요
          </p>
        </div>

        {/* 세션 만료 안내 배너 */}
        {isExpired && (
          <div
            role="status"
            className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
          >
            세션이 만료되어 다시 로그인이 필요합니다
          </div>
        )}

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">로그인</CardTitle>
            <CardDescription>
              이메일과 비밀번호를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm redirectTo={redirectTo} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
