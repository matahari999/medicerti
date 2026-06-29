import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronLeft, FileText, BarChart2, FileOutput,
  Settings, Calendar, MapPin, Phone, Bed, BookOpen, ClipboardList, FolderOpen,
  ClipboardCheck, TrendingUp, FileCheck, BarChart3, GitBranch,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MembersTable } from '@/components/hospital/MembersTable'
import {
  getHospital,
  getHospitalMembers,
  getHospitalDocumentStats,
  getLatestAnalysis,
} from '@/lib/services/hospital.service'
import { formatDate, formatScore, getScoreBgColor, daysUntil } from '@/lib/utils'
import { requireHospitalMember } from '@/lib/auth'
import { getDashboardData } from '@/lib/services/dashboard.service'
import { HospitalDashboard } from '@/components/dashboard/HospitalDashboard'

type Props = { params: Promise<{ hospitalId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hospitalId } = await params
  const hospital = await getHospital(hospitalId)
  return { title: hospital?.name ?? '병원 상세' }
}

export default async function HospitalDetailPage({ params }: Props) {
  const { hospitalId } = await params
  const { role } = await requireHospitalMember(hospitalId, 'viewer')

  const [hospital, members, docStats, latestAnalysis, dashboardData] = await Promise.all([
    getHospital(hospitalId),
    getHospitalMembers(hospitalId),
    getHospitalDocumentStats(hospitalId),
    getLatestAnalysis(hospitalId),
    getDashboardData(hospitalId),
  ])

  if (!hospital) notFound()

  const days  = hospital.accreditation_target ? daysUntil(hospital.accreditation_target) : null
  const score = latestAnalysis?.overall_score ?? null

  const quickLinks = [
    { href: `/hospitals/${hospitalId}/documents`,       label: '문서 관리',     icon: FileText,      desc: `${docStats.extracted}/${docStats.total}개 추출 완료`, badge: docStats.total },
    { href: `/hospitals/${hospitalId}/analysis`,        label: '갭 분석',       icon: BarChart2,     desc: latestAnalysis ? `마지막: ${formatDate(latestAnalysis.created_at)}` : '분석 전', badge: null },
    { href: `/hospitals/${hospitalId}/self-assessment`, label: '자가 갭분석',    icon: ClipboardCheck, desc: 'ME 항목별 충족도 체크 + 우선순위', badge: null },
    { href: `/hospitals/${hospitalId}/kpi`,             label: 'KPI 대시보드',   icon: BarChart3,    desc: '핵심 지표 통합 조회', badge: null },
    { href: `/hospitals/${hospitalId}/rounding`,        label: '라운딩/모의조사', icon: TrendingUp,  desc: '월별 점검 + 추세 그래프', badge: null },
  { href: `/hospitals/${hospitalId}/preparation`,     label: '인증 준비 위자드', icon: ClipboardList, desc: '단계별 체크리스트 가이드', badge: null },
    { href: `/hospitals/${hospitalId}/criteria`,        label: '인증 기준',     icon: ClipboardList, desc: '기준별 적합도 열람', badge: null },
    { href: `/hospitals/${hospitalId}/regulations`,     label: '규정집',         icon: BookOpen,      desc: 'PDF 업로드 · AI 정책 초안 생성', badge: null },
    { href: `/hospitals/${hospitalId}/managed-docs`,    label: '관리 문서',     icon: FolderOpen,    desc: '법정양식·점검표·회의록 등', badge: null },
    { href: `/hospitals/${hospitalId}/acknowledgments`, label: '인지 확인 로그',  icon: FileCheck,    desc: '직원 규정 인지 증빙', badge: null },
    { href: `/hospitals/${hospitalId}/cross-mapping`,   label: '교차 매핑',     icon: GitBranch,    desc: '타 평가체계 중복 항목', badge: null },
    { href: `/hospitals/${hospitalId}/reports`,         label: '보고서',        icon: FileOutput,   desc: '분석 보고서 다운로드', badge: null },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div>
        <Link href="/hospitals" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4">
          <ChevronLeft className="w-4 h-4" />
          병원 목록
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline">{hospital.accreditation_cycle}차 인증</Badge>
              {hospital.region && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{hospital.region}
                </span>
              )}
              {hospital.bed_count && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Bed className="w-3 h-3" />{hospital.bed_count}병상
                </span>
              )}
            </div>
          </div>
          {(role === 'admin' || role === 'manager') && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/hospitals/${hospitalId}/settings`}>
                <Settings className="w-4 h-4 mr-1.5" />
                설정
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 인증 준비도 + D-day */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">인증 준비도</p>
                <p className={`text-3xl font-bold mt-1 ${score != null ? (score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600') : 'text-gray-400'}`}>
                  {score != null ? formatScore(score) : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {latestAnalysis ? `마지막 분석: ${formatDate(latestAnalysis.created_at)}` : '분석 전'}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${
                score != null ? (score >= 80 ? 'border-green-400' : score >= 60 ? 'border-amber-400' : 'border-red-400') : 'border-gray-200'
              }`}>
                <BarChart2 className={`w-7 h-7 ${score != null ? 'text-brand-600' : 'text-gray-300'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">인증 목표일</p>
                {hospital.accreditation_target ? (
                  <>
                    <p className={`text-3xl font-bold mt-1 ${days != null && days < 30 ? 'text-red-600' : days != null && days < 90 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {days != null && days > 0 ? `D-${days}` : days === 0 ? 'D-Day' : '기한 초과'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(hospital.accreditation_target)}
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold mt-1 text-gray-400">—</p>
                )}
              </div>
              <Calendar className={`w-10 h-10 ${days != null && days < 30 ? 'text-red-400' : 'text-brand-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 이동 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map(({ href, label, icon: Icon, desc, badge }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-brand-600" />
              </div>
              {badge != null && (
                <Badge variant="secondary" className="text-xs">{badge}</Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* 대시보드 차트 */}
      {latestAnalysis && (
        <HospitalDashboard
          overallScore={score}
          documentStats={docStats}
          dashboardData={dashboardData}
        />
      )}

      {/* 팀 멤버 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">팀 멤버 ({members.length}명)</CardTitle>
            {role === 'admin' && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/hospitals/${hospitalId}/settings#members`}>멤버 관리</Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <MembersTable members={members as Parameters<typeof MembersTable>[0]['members']} />
        </CardContent>
      </Card>
    </div>
  )
}
