import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildReportData } from '@/lib/services/report.service'

type Params = { params: Promise<{ analysisId: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { analysisId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const runData = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('id', analysisId)
    .single()
    .then((r) => r.data as Record<string, unknown> | null)

  if (!runData) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', runData.hospital_id as string)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const reportData = await buildReportData(runData.hospital_id as string, analysisId)
  if (!reportData) return NextResponse.json({ error: 'Failed to build report' }, { status: 500 })

  const reportName = `${reportData.hospitalName}_인증분석보고서_${new Date().toISOString().split('T')[0]}.json`

  const { data: inserted } = await supabase
    .from('reports')
    .insert({
      hospital_id:     runData.hospital_id as string,
      analysis_run_id: analysisId,
      generated_by:    user.id,
      storage_path:    `reports/${runData.hospital_id}/${analysisId}.json`,
      title:           reportName,
      page_count:      reportData.criterionResults.length,
    } as never)
    .select()
    .single()

  return NextResponse.json({ data: { report: inserted, reportData } })
}
