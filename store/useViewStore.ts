"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ViewStore {
  viewMode: "list" | "grid"
  setViewMode: (mode: "list" | "grid") => void
}

// 견적서 목록 뷰 모드를 localStorage에 영구 저장
export const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      viewMode: "list",
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: "invoice-view-mode" }
  )
)
