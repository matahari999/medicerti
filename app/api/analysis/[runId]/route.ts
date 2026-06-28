import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ runId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { runId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: run } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (!run) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  const analysisRun = run as unknown as { status: string; hospital_id: string }

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', analysisRun.hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const { data: results } = await supabase
    .from('criterion_results')
    .select('*, accreditation_criteria(*)')
    .eq('analysis_run_id', runId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ data: { run: analysisRun, results: results ?? [] } })
}
