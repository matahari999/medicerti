import { createClient } from '@/lib/supabase/server'

export async function getDashboardData(hospitalId: string) {
  const supabase = await createClient()

  const analysisRuns = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('hospital_id', hospitalId)
    .eq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(10)
    .then((r) => r.data as unknown[] | null)

  const runs = analysisRuns as Record<string, unknown>[]
  if (runs.length === 0) {
    return { domainData: [], trendData: [], criticalGaps: [], scoreHistory: [] }
  }

  const latestRun = runs[0]
  const domainScores = latestRun.domain_scores as Record<string, number> | null

  const domainMap: Record<string, string> = {
    PS: '환자안전', PC: '환자중심', GL: '지도체계', QS: '안전/질향상',
  }

  const domainData = domainScores
    ? Object.entries(domainScores).map(([code, score]) => ({
        domain: domainMap[code] ?? code,
        code,
        score: Math.round(score),
        fullMark: 100,
      }))
    : []

  const trendData = [...runs].reverse()
    .map((run: Record<string, unknown>) => ({
      date: new Date(run.created_at as string).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      score: Math.round((run.overall_score as number) ?? 0),
    }))

  if (latestRun.id) {
    const results = await supabase
      .from('criterion_results')
      .select('*, accreditation_criteria(code, title, domain, severity, recommendation)')
      .eq('analysis_run_id', latestRun.id as string)
      .not('severity', 'is', null)
      .order('created_at', { ascending: false })
      .then((r) => r.data as unknown[] | null)

    const allResults = (results ?? []) as Record<string, unknown>[]
    const criticalGaps = allResults
      .filter((r) => (r.severity as string) === 'critical' || (r.severity as string) === 'major')
      .slice(0, 5)
      .map((r) => {
        const crit = r.accreditation_criteria as Record<string, unknown> | null
        return {
          code: (crit?.code as string) ?? '',
          title: (crit?.title as string) ?? '',
          domain: (crit?.domain as string) ?? '',
          severity: r.severity as string,
          recommendation: r.recommendation as string | null,
        }
      })

    return { domainData, trendData, criticalGaps, scoreHistory: runs }
  }

  return { domainData, trendData, criticalGaps: [], scoreHistory: [] }
}
