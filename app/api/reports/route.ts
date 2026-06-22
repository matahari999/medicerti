import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hospitalId = searchParams.get('hospitalId')
  if (!hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('reports')
    .select('*, analysis_runs(overall_score, completed_at)')
    .eq('hospital_id', hospitalId)
    .order('generated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}
