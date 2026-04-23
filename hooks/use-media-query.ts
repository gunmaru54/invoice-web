"use client"

import { useSyncExternalStore } from "react"

// SSR 안전한 미디어 쿼리 훅 (useSyncExternalStore로 effect 내 setState 회피)
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener("change", callback)
      return () => mediaQuery.removeEventListener("change", callback)
    },
    () => window.matchMedia(query).matches,
    () => false // SSR에서는 false 반환
  )
}
