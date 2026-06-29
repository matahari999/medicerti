import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const hospitalType = searchParams.get('hospital_type') ?? 'nursing'

  const supabase = await createClient()
  const { data } = await supabase.rpc('get_hospital_cross_mappings', {
    p_hospital_type: hospitalType,
  })

  return NextResponse.json(data ?? [])
}
