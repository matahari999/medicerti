import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllHospitals } from '@/lib/services/admin.service'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, FileText, ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: '전체 병원 관리 — 어드민' }

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  active:   { label: '운영중',  variant: 'default' },
  suspended:{ label: '정지',    variant: 'destructive' },
  archived: { label: '보관됨',  variant: 'secondary' },
}

export default async function AdminHospitalsPage() {
  const hospitals = await getAllHospitals()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">전체 병원 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          플랫폼에 등록된 모든 병원을 조회하고 관리합니다 ({hospitals.length}개)
        </p>
      </div>

      {hospitals.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          등록된 병원이 없습니다.
        </div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {hospitals.map((h) => {
            const st = statusLabel[h.status] ?? { label: h.status, variant: 'secondary' as const }
            return (
              <Link
                key={h.id}
                href={`/admin/hospitals/${h.id}`}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{h.name}</p>
                    <Badge variant={st.variant} className="shrink-0">{st.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {h.region ?? '지역 미설정'} · 병상 {h.bed_count ?? '-'}개
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {h.member_count}명
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {h.document_count}건
                  </span>
                  <span className="text-xs">{new Date(h.created_at).toLocaleDateString('ko-KR')}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-gray-700" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
