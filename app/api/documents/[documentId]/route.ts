import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ documentId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { documentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data, error } = await supabase
    .from('documents')
    .select('*, document_extractions(*)')
    .eq('id', documentId)
    .single()

  if (error) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', (data as unknown as { hospital_id: string }).hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: Params) {
  const { documentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: doc } = await supabase
    .from('documents')
    .select('hospital_id')
    .eq('id', documentId)
    .single()

  if (!doc) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', (doc as unknown as { hospital_id: string }).hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString(), status: 'deleted' } as never)
    .eq('id', documentId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
