'use client'

import { useCallback, useRef, useState } from 'react'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (err: string) => void
  retries?: number
  retryDelay?: number
  timeoutMs?: number
}

interface UseApiReturn<T> {
  execute: (...args: Parameters<typeof fetch>) => Promise<T | null>
  loading: boolean
  error: string | null
  data: T | null
  reset: () => void
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}): UseApiReturn<T> {
  const {
    onSuccess,
    onError,
    retries = 2,
    retryDelay = 1000,
    timeoutMs = 30000,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const controllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<T | null> => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError(null)

    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    let lastError: string | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(input, {
          ...init,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
          },
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
        }

        const json = await res.json() as { data: T }
        setData(json.data)
        setLoading(false)
        clearTimeout(timeout)
        onSuccess?.(json.data)
        controllerRef.current = null
        return json.data
      } catch (err) {
        lastError = err instanceof Error ? err.message : '알 수 없는 오류'

        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = '요청 시간이 초과되었습니다'
          break
        }

        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)))
          continue
        }
      }
    }

    setLoading(false)
    setError(lastError)
    clearTimeout(timeout)
    onError?.(lastError ?? '알 수 없는 오류')
    controllerRef.current = null
    return null
  }, [retries, retryDelay, timeoutMs, onSuccess, onError])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { execute, loading, error, data, reset }
}
