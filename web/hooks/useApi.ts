'use client'

import { useMemo } from 'react'
import { apiFetch } from '@/lib/api'

export function useApi() {
  return useMemo(
    () => ({
      post: (path: string, body?: any) => apiFetch(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      }),
      
      get: (path: string) => apiFetch(path, {
        method: 'GET',
      }),
    }),
    []
  )
}