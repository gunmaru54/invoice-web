'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStatus } from 'react-dom'
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth'
import { loginAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  redirectTo?: string
}

// 제출 버튼 — useFormStatus로 pending 상태를 form 컨텍스트에서 읽음
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? '로그인 중...' : '로그인'}
    </Button>
  )
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  // 서버 액션에서 반환된 에러 메시지 관리
  const [serverError, setServerError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  // RHF의 handleSubmit으로 클라이언트 유효성 검사 후 서버 액션 호출
  const onSubmit = handleSubmit((data) => {
    setServerError(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.set('email', data.email)
      formData.set('password', data.password)
      if (redirectTo) {
        formData.set('redirectTo', redirectTo)
      }

      const result = await loginAction(formData)
      // redirect() 호출 시 result가 반환되지 않으므로 success: false 케이스만 처리
      if (!result.success) {
        setServerError(result.error)
      }
    })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {/* 서버 에러 메시지 */}
      {serverError && (
        <div
          role="alert"
          className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </div>
      )}

      {/* 이메일 필드 */}
      <div className="space-y-1.5">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* 비밀번호 필드 */}
      <div className="space-y-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <SubmitButton />
    </form>
  )
}
