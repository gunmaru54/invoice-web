'use client'

import { LogOutIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/logout/actions'

// 사이드바 하단 로그아웃 버튼 컴포넌트 (form submit 방식)
export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="w-full justify-start"
      >
        <LogOutIcon className="size-4 shrink-0" />
        <span>로그아웃</span>
      </Button>
    </form>
  )
}
