'use client'

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts'

interface DomainData {
  domain: string
  code: string
  score: number
  fullMark: number
}

interface DomainRadarChartProps {
  data: DomainData[]
}

export function DomainRadarChart({ data }: DomainRadarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        분석 데이터가 없습니다
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          name="인증 준비도"
          dataKey="score"
          stroke="#0d9488"
          fill="#0d9488"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
