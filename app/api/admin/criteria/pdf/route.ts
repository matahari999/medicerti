import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'

export async function POST(req: Request) {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File exceeds 50MB limit' }, { status: 413 })
  }

  const path = `criteria/${crypto.randomUUID()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(path, file, { contentType: 'application/pdf', upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // signed URL (10년)
  const { data: signed } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 365 * 24 * 3600 * 10)

  return NextResponse.json({ path, url: signed?.signedUrl ?? null })
}
