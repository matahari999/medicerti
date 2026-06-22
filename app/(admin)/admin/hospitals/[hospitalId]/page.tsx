import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHospitalWithMembers, setHospitalStatus } from '@/lib/services/admin.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2, Users, FileText, BarChart3 } from 'lucide-react'
import { AdminHospitalActions } from './AdminHospitalActions'

export const metadata: Metadata = { title: '병원 상세 — 어드민' }

export default async function AdminHospitalDetailPage({
  params,
}: {
  params: Promise<{ hospitalId: string }>
}) {
  const { hospitalId } = await params
  const { hospital, members, analysisRuns, documents } = await getHospitalWithMembers(hospitalId)
  if (!hospital) notFound()

  const statusColor: Record<string, string> = {
    active:    'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    archived:  'bg-gray-100 text-gray-700',
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/hospitals">
            <ArrowLeft className="w-4 h-4 mr-1" />
            목록으로
          </Link>
        </Button>
      </div>

      {/* 병원 기본 정보 */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{hospital.name}</h1>
              <p className="text-sm text-muted-foreground">{hospital.address ?? '주소 미등록'}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[hospital.status] ?? ''}`}>
            {hospital.status === 'active' ? '운영중' : hospital.status === 'suspended' ? '정지' : '보관됨'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-xs text-muted-foreground">허가번호</p>
            <p className="text-sm font-medium mt-0.5">{hospital.license_number ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">지역</p>
            <p className="text-sm font-medium mt-0.5">{hospital.region ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">병상 수</p>
            <p className="text-sm font-medium mt-0.5">{hospital.bed_count ?? '-'}개</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">등록일</p>
            <p className="text-sm font-medium mt-0.5">{new Date(hospital.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>

        {/* 상태 변경 액션 */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-medium text-gray-700 mb-3">관리 액션</p>
          <AdminHospitalActions hospitalId={hospital.id} currentStatus={hospital.status as 'active' | 'suspended' | 'archived'} />
        </div>
      </div>

      {/* 멤버 목록 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Users className="w-4 h-4" />
          멤버 ({members.length}명)
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">멤버가 없습니다.</p>
        ) : (
          <div className="divide-y">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {m.profiles?.full_name ?? m.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{m.role}</Badge>
                  <Badge variant={m.status === 'active' ? 'default' : 'secondary'}>{m.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 분석 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4" />
          최근 분석 이력
        </h2>
        {analysisRuns.length === 0 ? (
          <p className="text-sm text-muted-foreground">분석 이력이 없습니다.</p>
        ) : (
          <div className="divide-y">
            {analysisRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {run.status === 'complete' ? `점수: ${run.overall_score ?? '-'}점` : run.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(run.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
                <Badge variant={run.status === 'complete' ? 'default' : 'secondary'}>
                  {run.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 최근 문서 */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4" />
          최근 문서
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">업로드된 문서가 없습니다.</p>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <p className="text-sm text-gray-900 truncate max-w-sm">{doc.original_name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{doc.category}</Badge>
                  <Badge variant={doc.status === 'extracted' ? 'default' : 'secondary'}>{doc.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
