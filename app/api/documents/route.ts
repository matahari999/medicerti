import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MAX_FILE_SIZE_BYTES, PDF_MAGIC_BYTES } from '@/lib/constants'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const hospitalId = searchParams.get('hospitalId')
  if (!hospitalId) return NextResponse.json({ error: 'hospitalId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('hospital_id', hospitalId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const hospitalId = formData.get('hospitalId') as string | null
  const category = (formData.get('category') as string) || 'other'

  if (!file || !hospitalId) {
    return NextResponse.json({ error: 'file and hospitalId required' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB limit` }, { status: 413 })
  }

  if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files allowed' }, { status: 415 })
  }

  const bytes = await file.arrayBuffer()
  const magic = new Uint8Array(bytes, 0, 4)
  const magicStr = new TextDecoder().decode(magic)
  if (magicStr !== PDF_MAGIC_BYTES) {
    return NextResponse.json({ error: 'Invalid PDF file' }, { status: 415 })
  }

  const uuid = crypto.randomUUID()
  const storagePath = `${hospitalId}/${user.id}/${uuid}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      hospital_id:   hospitalId,
      uploaded_by:   user.id,
      original_name: file.name,
      storage_path:  storagePath,
      file_size_bytes: file.size,
      mime_type:     'application/pdf',
      category:      category,
      status:        'pending',
    } as never)
    .select()
    .single()

  if (dbError) {
    await supabase.storage.from('documents').remove([storagePath])
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ data: doc }, { status: 201 })
}
