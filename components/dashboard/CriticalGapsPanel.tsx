import { AlertTriangle } from 'lucide-react'

interface Gap {
  code: string
  title: string
  domain: string
  severity: string
  recommendation: string | null
}

interface CriticalGapsPanelProps {
  gaps: Gap[]
}

export function CriticalGapsPanel({ gaps }: CriticalGapsPanelProps) {
  if (gaps.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        치명적/중요 갭이 없습니다
      </div>
    )
  }

  const displayGaps = gaps.slice(0, 5)

  return (
    <div className="space-y-2">
      {displayGaps.map((gap, i) => (
        <div key={`${gap.code}-${i}`} className="flex items-start gap-3 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-red-800">
              <span className="font-mono text-xs text-red-500 mr-1.5">{gap.code}</span>
              {gap.title}
            </p>
            <p className="text-xs text-red-600 mt-0.5">{gap.domain}</p>
            {gap.recommendation && (
              <p className="text-xs text-red-500 mt-1">{gap.recommendation}</p>
            )}
          </div>
        </div>
      ))}
      {gaps.length > 5 && (
        <p className="text-xs text-muted-foreground text-center pt-1">외 {gaps.length - 5}개 더 있음</p>
      )}
    </div>
  )
}
