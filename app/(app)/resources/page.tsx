'use client'

// 인증 자료실 — 관리자가 인증기준 관리에서 올린 참고자료(기준집·사후관리·기타 항목)를
// 일반 구독자가 열람·다운로드하는 화면.
import { useState, useEffect } from 'react'
import { FolderOpen, FileText, Loader2, ExternalLink, Download } from 'lucide-react'

interface DocItem {
  path: string
  title: string
  category: 'standard' | 'etc'
  sizeKb: number
  uploadedAt?: string
  url: string | null
}

const SECTIONS: { key: 'standard' | 'etc'; label: string; desc: string }[] = [
  { key: 'standard', label: '인증기준집', desc: '병원 종별 인증기준집 및 표준지침서 원문' },
  { key: 'etc', label: '기타 항목', desc: '인증 사후관리, 추진 계획, 조사 안내 등 참고자료' },
]

export default function ResourcesPage() {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/criteria-docs')
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
        setDocs(json.data ?? [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-brand-600" />
          인증 자료실
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          인증기준집 원문과 사후관리·조사 안내 등 참고자료를 열람하고 내려받을 수 있습니다.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
          <Loader2 className="w-4 h-4 animate-spin" /> 자료 목록을 불러오는 중...
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && SECTIONS.map((section) => {
        const items = docs.filter((d) => d.category === section.key)
        return (
          <div key={section.key} className="bg-white rounded-xl border p-6 space-y-3">
            <div>
              <h2 className="text-base font-semibold">{section.label}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{section.desc}</p>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">등록된 자료가 없습니다.</p>
            ) : (
              <div className="space-y-2">
                {items.map((d) => (
                  <div key={d.path} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF · {d.sizeKb.toLocaleString()}KB
                        {d.uploadedAt && ` · ${d.uploadedAt.slice(0, 10)} 등록`}
                      </p>
                    </div>
                    {d.url && (
                      <>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 px-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> 보기
                        </a>
                        <a
                          href={d.url}
                          download={`${d.title}.pdf`}
                          className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" /> 다운로드
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
