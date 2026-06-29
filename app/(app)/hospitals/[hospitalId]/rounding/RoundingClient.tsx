'use client'

import { useState, useCallback } from 'react'
import {
  Plus,
  TrendingUp,
  Calendar,
  ClipboardList,
  Target,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { RoundingCategory } from '@/types/database.types'
import { ROUNDING_METRIC_PRESETS } from '@/types/database.types'
import { submitRounding, submitMetric, fetchRoundingTrends, fetchMetricTrends } from '@/app/actions/rounding'

interface Props {
  hospitalId: string
  categories: RoundingCategory[]
  initialTrends: Array<{ id: string; date: string; score: number; title: string; categories: Array<{ category: string; score: number; finding: string | null; action_needed: string | null }> }>
  initialRecent: Array<{ id: string; round_date: string; overall_score: number | null; title: string; created_at: string }>
  initialMetrics: Array<{ name: string; label: string; value: number; unit: string; date: string }>
}

export default function RoundingClient({ hospitalId, categories, initialTrends, initialRecent, initialMetrics }: Props) {
  const [tab, setTab] = useState<'rounding' | 'trend' | 'metrics'>('rounding')
  const [roundDate, setRoundDate] = useState(new Date().toISOString().slice(0, 7) + '-15')
  const [title, setTitle] = useState(`라운딩 ${new Date().toISOString().slice(0, 7)}`)
  const [scores, setScores] = useState<Record<string, { score: number; finding: string; action: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [trends, setTrends] = useState(initialTrends)
  const [recent, setRecent] = useState(initialRecent)
  const [metrics, setMetrics] = useState(initialMetrics)
  const [metricInputs, setMetricInputs] = useState<Record<string, string>>({})
  const [metricDate, setMetricDate] = useState(new Date().toISOString().slice(0, 10))

  const handleScoreChange = useCallback((catId: string, value: number) => {
    setScores((prev) => ({
      ...prev,
      [catId]: { ...prev[catId] ?? { finding: '', action: '' }, score: value },
    }))
  }, [])

  const handleFindingChange = useCallback((catId: string, field: 'finding' | 'action', value: string) => {
    setScores((prev) => ({
      ...prev,
      [catId]: { ...prev[catId] ?? { score: 0, finding: '', action: '' }, [field]: value },
    }))
  }, [])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const scoresArray = categories.map((cat) => ({
        category_id: cat.id,
        score: scores[cat.id]?.score ?? 0,
        finding: scores[cat.id]?.finding ?? '',
        action_needed: scores[cat.id]?.action ?? '',
      }))
      await submitRounding(hospitalId, title, roundDate, scoresArray)
      const newTrends = await fetchRoundingTrends(hospitalId)
      setTrends(newTrends)
      setScores({})
      setTitle(`라운딩 ${new Date().toISOString().slice(0, 7)}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleMetricSubmit = async (metricName: string, metricLabel: string, unit: string) => {
    const value = parseFloat(metricInputs[metricName] ?? '0')
    if (isNaN(value)) return
    await submitMetric(hospitalId, metricName, metricLabel, value, unit, metricDate)
    const newMetrics = await fetchMetricTrends(hospitalId)
    setMetrics(newMetrics)
    setMetricInputs((prev) => ({ ...prev, [metricName]: '' }))
  }

  const chartData = trends.map((t) => ({
    date: t.date?.slice(0, 7) ?? '',
    score: t.score ?? 0,
    ...(t.categories ?? []).reduce((acc, cat) => ({ ...acc, [cat.category]: cat.score }), {}),
  }))

  const categoryNames = categories.map((c) => c.name)

  const metricChartData: Record<string, Array<{ date: string; value: number }>> = {}
  for (const m of metrics ?? []) {
    if (!metricChartData[m.name]) metricChartData[m.name] = []
    metricChartData[m.name].push({ date: m.date?.slice(0, 7) ?? '', value: m.value })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {([
          { key: 'rounding', label: '라운딩 입력', icon: ClipboardList },
          { key: 'trend', label: '추세 그래프', icon: TrendingUp },
          { key: 'metrics', label: '핵심 지표', icon: Target },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-t-lg transition-all cursor-pointer',
              tab === t.key ? 'bg-white text-blue-600 border border-b-white border-slate-200 -mb-[2px]' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rounding' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">라운딩 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">라운딩 일자</label>
              <input
                type="date"
                value={roundDate}
                onChange={(e) => setRoundDate(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-slate-800">{cat.name}</h3>
                  <span className="text-xs text-slate-400">최대 {cat.max_score}점</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={scores[cat.id]?.score ?? 0}
                  onChange={(e) => handleScoreChange(cat.id, parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs">
                  <span className={cn('font-bold', (scores[cat.id]?.score ?? 0) >= 80 ? 'text-green-600' : (scores[cat.id]?.score ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600')}>
                    {scores[cat.id]?.score ?? 0}점
                  </span>
                  <div className="flex gap-4">
                    <span className="text-slate-400">낮음</span>
                    <span className="text-slate-400">보통</span>
                    <span className="text-slate-400">높음</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 mb-1 block">발견 사항</label>
                    <input
                      type="text"
                      value={scores[cat.id]?.finding ?? ''}
                      onChange={(e) => handleFindingChange(cat.id, 'finding', e.target.value)}
                      placeholder="관찰 내용을 입력하세요"
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 mb-1 block">조치 필요 사항</label>
                    <input
                      type="text"
                      value={scores[cat.id]?.action ?? ''}
                      onChange={(e) => handleFindingChange(cat.id, 'action', e.target.value)}
                      placeholder="후속 조치 계획"
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={submitting} className="bg-brand-600 hover:bg-brand-700">
              <Plus className="w-4 h-4 mr-1.5" />
              {submitting ? '저장 중...' : '라운딩 저장'}
            </Button>
          </div>

          {recent.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-sm text-slate-700 mb-3">최근 라운딩 기록</h3>
              <div className="space-y-2">
                {recent.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-slate-600">{r.round_date}</span>
                      <span className="text-slate-800 font-medium">{r.title}</span>
                    </div>
                    <span className={cn(
                      'font-bold',
                      (r.overall_score ?? 0) >= 80 ? 'text-green-600' : (r.overall_score ?? 0) >= 50 ? 'text-amber-600' : 'text-red-600'
                    )}>
                      {r.overall_score ?? 'N/A'}점
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'trend' && chartData.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-sm text-slate-700 mb-4">전체 점수 추세</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} name="전체 점수" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-sm text-slate-700 mb-4">카테고리별 점수 추세</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {categoryNames.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'][i % 8]} name={name} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-sm text-slate-700 mb-3">데이터 테이블</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-500">월</th>
                    <th className="text-right py-2 px-2 font-semibold text-slate-500">전체</th>
                    {categoryNames.map((n) => (
                      <th key={n} className="text-right py-2 px-2 font-semibold text-slate-500">{n}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => (
                    <tr key={row.date} className="border-b border-slate-100">
                      <td className="py-1.5 px-2 text-slate-600">{row.date}</td>
                      <td className="py-1.5 px-2 text-right font-bold">{row.score ?? '-'}</td>
                      {categoryNames.map((n) => (
                        <td key={n} className="py-1.5 px-2 text-right">{row[n] ?? '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'trend' && chartData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <TrendingUp size={40} className="mb-3" />
          <p className="text-sm">아직 라운딩 데이터가 없습니다. 라운딩 입력 탭에서 첫 기록을 입력하세요.</p>
        </div>
      )}

      {tab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROUNDING_METRIC_PRESETS.map((preset) => {
              const data = metricChartData[preset.name] ?? []
              const latest = data[data.length - 1]
              return (
                <div key={preset.name} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-700">{preset.label}</h4>
                    <span className="text-[10px] text-slate-400">{preset.unit}</span>
                  </div>
                  {latest && (
                    <div className="text-2xl font-bold text-slate-800">
                      {latest.value}
                      <span className="text-sm font-normal text-slate-400 ml-1">{preset.unit}</span>
                    </div>
                  )}
                  {data.length >= 2 && (
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={data}>
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={metricInputs[preset.name] ?? ''}
                      onChange={(e) => setMetricInputs((prev) => ({ ...prev, [preset.name]: e.target.value }))}
                      placeholder="값 입력"
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleMetricSubmit(preset.name, preset.label, preset.unit)}
                      className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 cursor-pointer"
                    >
                      기록
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
