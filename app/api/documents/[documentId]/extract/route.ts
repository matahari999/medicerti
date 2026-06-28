import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ documentId: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { documentId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()

  if (!doc) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  const document = doc as unknown as { status: string; storage_path: string; extraction_attempts: number; hospital_id: string }

  const { data: member } = await supabase
    .from('hospital_members')
    .select('role')
    .eq('hospital_id', document.hospital_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!member) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })

  if (document.status !== 'pending' && document.status !== 'failed') {
    return NextResponse.json({ error: `Cannot extract document with status: ${document.status}` }, { status: 409 })
  }

  await supabase.from('documents').update({ status: 'processing' } as never).eq('id', documentId)

  try {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.storage_path, 300)

    if (!data?.signedUrl) throw new Error('Failed to generate signed URL')
    const signedUrl = data.signedUrl

    const pdfResp = await fetch(signedUrl)
    const pdfBuffer = await pdfResp.arrayBuffer()
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64')

    const { extractDocumentText } = await import('@/lib/gemini/ocr')
    const extraction = await extractDocumentText(pdfBase64, documentId)

    const { error: extractionError } = await supabase
      .from('document_extractions')
      .insert({
        document_id:   documentId,
        hospital_id:   document.hospital_id,
        full_text:     extraction.fullText,
        page_data:     extraction.pages as unknown as Record<string, unknown>[],
        total_pages:   extraction.totalPages,
        avg_confidence: parseFloat(extraction.avgConfidence.toFixed(3)),
        word_count:    extraction.wordCount,
      } as never)

    if (extractionError) throw extractionError

    await supabase.from('documents').update({
      status: 'extracted',
      extracted_at: new Date().toISOString(),
    } as never).eq('id', documentId)

    return NextResponse.json({ data: { documentId, status: 'extracted', wordCount: extraction.wordCount, totalPages: extraction.totalPages, avgConfidence: extraction.avgConfidence } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Extraction failed'
    await supabase.from('documents').update({
      status: 'failed',
      error_message: message,
      extraction_attempts: document.extraction_attempts + 1,
    } as never).eq('id', documentId)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
