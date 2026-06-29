import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const hospitalId = form.get('hospitalId') as string | null
  if (!file || !hospitalId) {
    return NextResponse.json({ error: 'file and hospitalId required' }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 50MB' }, { status: 413 })
  }

  const path = `${hospitalId}/regulations/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: doc, error: dbError } = await supabase
    .from('managed_documents')
    .insert({
      hospital_id: hospitalId,
      doc_type: 'regulation',
      title: file.name.replace(/\.pdf$/i, ''),
      content: '',
      status: 'draft',
      created_by: user.id,
    } as never)
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from('documents').remove([path])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ data: doc }, { status: 201 })
}
