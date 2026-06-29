'use client'

import {
  CheckCircle2, AlertTriangle, XCircle, Target, TrendingUp, FileCheck,
  BarChart3, Users, ClipboardList, Printer,
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props {
  hospitalId: string
  hospitalName: string
  latestAssessment: {
    overall_score: number | null; compliant_count: number; partial_count: number;
    non_compliant_count: number; not_reviewed_count: number; total_items: number;
    priority_score: number | null;
  } | null
  roundingTrends: Array<{ id: string; date: string; score: number; title: string; categories: Array<{ category: string; score: number; finding: string | null; action_needed: string | null }> }>
  metrics: Array<{ name: string; label: string; value: number; unit: string; date: string }>
  recentRounds: Array<{ round_date: string; overall_score: number | null; title: string }>
  ackStats: Array<{ department: string; total_employees: number; total_documents: number; total_acknowledgments: number; expired_count: number; compliance_rate: number }>
}

function MetricCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-[11px] font-semibold">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold', color ?? 'text-slate-800')}>
        {value ?? '-'}
      </div>
      {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function KpiDashboardClient({ latestAssessment, roundingTrends, metrics, recentRounds, ackStats }: Props) {
  const chartData = roundingTrends.map((t) => ({
    date: t.date?.slice(0, 7) ?? '',
    score: t.score ?? 0,
  }))

  const metricByName: Record<string, typeof metrics> = {}
  for (const m of metrics ?? []) {
    if (!metricByName[m.name]) metricByName[m.name] = []
    metricByName[m.name].push(m)
  }

  const latestSignOmission = metricByName['chart_sign_omission']?.slice(-1)?.[0]
  const latestHandHygiene = metricByName['hand Hygiene_rate']?.slice(-1)?.[0]
  const latestFallRate = metricByName['fall_incidence']?.slice(-1)?.[0]

  const latestRoundScore = recentRounds[0]?.overall_score

  const ackCompliance = ackStats.length > 0
    ? Math.round(ackStats.reduce((s, d) => s + d.compliance_rate, 0) / ackStats.length)
    : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<Target size={16} />}
          label="인증 준비도"
          value={latestAssessment ? `${latestAssessment.overall_score ?? 0}%` : 'N/A'}
          sub={latestAssessment ? `${latestAssessment.compliant_count}/${latestAssessment.total_items} 항목 충족` : '아직 평가 전'}
          color={latestAssessment?.overall_score != null && latestAssessment.overall_score >= 80 ? 'text-green-600' : (latestAssessment?.overall_score ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
        <MetricCard
          icon={<ClipboardList size={16} />}
          label="최근 라운딩 점수"
          value={latestRoundScore != null ? `${latestRoundScore}점` : 'N/A'}
          sub={recentRounds[0]?.round_date ?? ''}
          color={latestRoundScore != null && latestRoundScore >= 80 ? 'text-green-600' : (latestRoundScore ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
        <MetricCard
          icon={<FileCheck size={16} />}
          label="의무기록 서명 누락률"
          value={latestSignOmission != null ? `${latestSignOmission.value}%` : 'N/A'}
          sub={latestSignOmission?.date ?? ''}
          color={latestSignOmission != null && latestSignOmission.value <= 5 ? 'text-green-600' : (latestSignOmission?.value ?? 0) <= 15 ? 'text-amber-600' : 'text-red-600'}
        />
        <MetricCard
          icon={<CheckCircle2 size={16} />}
          label="직원 인지 준수율"
          value={ackCompliance != null ? `${ackCompliance}%` : 'N/A'}
          sub={`${ackStats.length}개 부서`}
          color={ackCompliance != null && ackCompliance >= 80 ? 'text-green-600' : (ackCompliance ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-1">라운딩 점수 추세</h3>
          <p className="text-[11px] text-slate-400 mb-4">최근 12개월 라운딩 점수 변화</p>
          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-xs text-slate-400">
              라운딩 데이터가 충분하지 않습니다 (최소 2회 필요)
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-3">핵심 지표 현황</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs text-slate-600">의무기록 서명 누락률</span>
              <span className={cn('text-sm font-bold', (latestSignOmission?.value ?? 0) <= 5 ? 'text-green-600' : 'text-amber-600')}>
                {latestSignOmission ? `${latestSignOmission.value}%` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs text-slate-600">손위생 이행률</span>
              <span className={cn('text-sm font-bold', (latestHandHygiene?.value ?? 0) >= 80 ? 'text-green-600' : 'text-amber-600')}>
                {latestHandHygiene ? `${latestHandHygiene.value}%` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs text-slate-600">낙상 발생률</span>
              <span className="text-sm font-bold text-slate-800">
                {latestFallRate ? `${latestFallRate.value} ${latestFallRate.unit}` : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs text-slate-600">미충족 인증 항목</span>
              <span className="text-sm font-bold text-red-600">
                {latestAssessment ? latestAssessment.non_compliant_count : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-slate-600">직원 인지 준수율</span>
              <span className={cn('text-sm font-bold', (ackCompliance ?? 0) >= 80 ? 'text-green-600' : 'text-amber-600')}>
                {ackCompliance != null ? `${ackCompliance}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">지표별 추세</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(metricByName).slice(0, 3).map(([name, data]) => (
              <div key={name}>
                <h4 className="text-[11px] font-semibold text-slate-500 mb-2">{data[0]?.label ?? name}</h4>
                {data.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data}>
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[120px] flex items-center justify-center text-[10px] text-slate-400">
                    데이터 부족
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
            <ClipboardList size={14} />
            최근 라운딩 기록
          </h3>
          <div className="space-y-2">
            {recentRounds.length > 0 ? recentRounds.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-600">{r.round_date}</span>
                <span className="text-xs font-semibold text-slate-800">{r.title}</span>
                <span className={cn('text-xs font-bold', (r.overall_score ?? 0) >= 80 ? 'text-green-600' : 'text-amber-600')}>
                  {r.overall_score ?? 'N/A'}점
                </span>
              </div>
            )) : (
              <div className="text-xs text-slate-400 py-4 text-center">라운딩 기록 없음</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
            <Users size={14} />
            부서별 인지율
          </h3>
          <div className="space-y-2">
            {ackStats.length > 0 ? ackStats.map((s) => (
              <div key={s.department} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-600">{s.department}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{s.total_employees}명</span>
                  <span className={cn('text-xs font-bold', s.compliance_rate >= 80 ? 'text-green-600' : 'text-amber-600')}>
                    {s.compliance_rate}%
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-xs text-slate-400 py-4 text-center">인지 로그 없음</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
