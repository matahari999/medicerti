import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Params = { params: Promise<{ runId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { runId } = await params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: run } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (!run) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  const analysisRun = run as unknown as { status: string }

  const { data: results } = await supabase
    .from('criterion_results')
    .select('*, accreditation_criteria(*)')
    .eq('analysis_run_id', runId)
    .order('created_at', { ascending: true })

  return NextResponse.json({ data: { run: analysisRun, results: results ?? [] } })
}
