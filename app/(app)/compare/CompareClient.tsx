'use client'

import { useState, useMemo } from 'react'
import { CheckCircle2, AlertTriangle, TrendingUp, Building2, Bed, MapPin, Hash, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatScore } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface HospitalData {
  id: string
  name: string
  type: string
  region: string | null
  accreditation_cycle: number | null
  accreditation_target: string | null
  bed_count: number | null
  assessmentScore: number | null
  analysisScore: number | null
}

const HOSPITAL_TYPE_LABEL: Record<string, string> = {
  nursing_hospital: '요양병원',
  acute_care: '급성기',
  psychiatric: '정신병원',
  dental: '치과',
  korean_medicine: '한방',
  rehabilitation: '재활',
}

export default function CompareClient({ hospitals }: { hospitals: HospitalData[] }) {
  const [selected, setSelected] = useState<string[]>(() => hospitals.slice(0, Math.min(4, hospitals.length)).map(h => h.id))

  const toggleHospital = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const visible = useMemo(() => hospitals.filter(h => selected.includes(h.id)), [hospitals, selected])

  const chartData = useMemo(() => {
    return visible.map(h => ({
      name: h.name.length > 8 ? h.name.slice(0, 8) + '…' : h.name,
      자가갭분석: h.assessmentScore ?? 0,
      AI갭분석: h.analysisScore ?? 0,
      fullName: h.name,
    }))
  }, [visible])

  if (hospitals.length === 0) {
    return (
      <div className="text-center py-16">
        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">비교할 병원이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hospital selector */}
      <div className="bg-white border rounded-xl p-4">
        <p className="text-sm font-medium mb-3">비교할 병원 선택 (최대 6개)</p>
        <div className="flex flex-wrap gap-2">
          {hospitals.map((h) => (
            <button
              key={h.id}
              onClick={() => toggleHospital(h.id)}
              disabled={!selected.includes(h.id) && selected.length >= 6}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                selected.includes(h.id)
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300',
                !selected.includes(h.id) && selected.length >= 6 && 'opacity-40 cursor-not-allowed'
              )}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">항목</th>
                {visible.map((h) => (
                  <th key={h.id} className="text-center py-3 px-4 font-semibold text-brand-700 min-w-[140px]">
                    {h.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> 유형
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">{HOSPITAL_TYPE_LABEL[h.type] ?? h.type}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> 지역
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">{h.region ?? '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                  <Hash className="w-4 h-4" /> 인증 주기
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">{h.accreditation_cycle ?? '—'}차</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 text-muted-foreground flex items-center gap-2">
                  <Bed className="w-4 h-4" /> 병상 수
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">{h.bed_count ?? '—'}</td>
                ))}
              </tr>
              <tr className="bg-green-50/30">
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> 자가 갭분석 점수
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">
                    {h.assessmentScore != null ? (
                      <span className={cn(
                        'text-lg font-bold',
                        h.assessmentScore >= 80 ? 'text-green-600' : h.assessmentScore >= 60 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {formatScore(h.assessmentScore)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="bg-blue-50/30">
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" /> AI 갭분석 점수
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">
                    {h.analysisScore != null ? (
                      <span className={cn(
                        'text-lg font-bold',
                        h.analysisScore >= 80 ? 'text-green-600' : h.analysisScore >= 60 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {formatScore(h.analysisScore)}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> 인증 목표일
                </td>
                {visible.map((h) => (
                  <td key={h.id} className="text-center py-3 px-4">
                    {h.accreditation_target
                      ? new Date(h.accreditation_target).toLocaleDateString('ko-KR')
                      : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">점수 비교 차트</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => [`${value.toFixed(1)}점`, name]}
                  labelFormatter={(label: string) => chartData.find(d => d.name === label)?.fullName ?? label}
                />
                <Bar dataKey="자가갭분석" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="AI갭분석" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}