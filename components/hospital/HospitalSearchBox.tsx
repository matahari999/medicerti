'use client'

import { useState, useRef, useCallback } from 'react'
import { Search, Loader2, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { PublicHospital } from '@/app/api/public/hospitals/route'

interface HospitalSearchBoxProps {
  onSelect: (hospital: PublicHospital) => void
}

export function HospitalSearchBox({ onSelect }: HospitalSearchBoxProps) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<PublicHospital[]>([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [open, setOpen]         = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)

  const search = useCallback(async () => {
    if (query.trim().length < 2) return
    setLoading(true)
    setError(null)
    setSearched(false)
    try {
      const res  = await fetch(`/api/public/hospitals?q=${encodeURIComponent(query.trim())}`)
      const json = await res.json() as { data?: PublicHospital[]; error?: string; unavailable?: boolean }
      if (res.status === 503 || json.unavailable) {
        setError('공공데이터 서비스 점검 중입니다. 아래 폼에 직접 입력해 주세요.')
        setResults([])
      } else if (!res.ok || json.error) {
        setError(json.error ?? '조회 실패')
        setResults([])
      } else {
        setResults(json.data ?? [])
        setOpen(true)
      }
    } catch {
      setError('네트워크 오류')
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }, [query])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); void search() }
  }

  const handleSelect = (h: PublicHospital) => {
    onSelect(h)
    setOpen(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!e.target.value) { setOpen(false); setResults([]) } }}
            onKeyDown={handleKey}
            placeholder="병원명으로 검색 (예: 서울 요양병원)"
            className="pl-8 text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void search()}
          disabled={loading || query.trim().length < 2}
          className="shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '검색'}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {searched ? '검색 결과가 없습니다' : '검색 중…'}
            </div>
          ) : (
            <>
              <p className="px-3 pt-2 pb-1 text-xs text-muted-foreground border-b">
                {results.length}개 검색됨 · 선택하면 폼이 자동완성됩니다
              </p>
              {results.map((h, i) => (
                <button
                  key={`${h.licenseNumber}-${i}`}
                  type="button"
                  onClick={() => handleSelect(h)}
                  className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors border-b last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-brand-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{h.address}</p>
                      <div className="flex gap-2 mt-0.5">
                        {h.licenseNumber && (
                          <span className="text-[10px] text-brand-600 font-mono">{h.licenseNumber}</span>
                        )}
                        {h.bedCount && (
                          <span className="text-[10px] text-gray-400">{h.bedCount}병상</span>
                        )}
                        {h.phone && (
                          <span className="text-[10px] text-gray-400">{h.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
