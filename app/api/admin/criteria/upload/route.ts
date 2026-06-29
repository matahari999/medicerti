import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isPlatformAdmin } from '@/lib/services/admin.service'
import * as XLSX from 'xlsx'

const TEMPLATE_HEADERS = [
  'area_code', 'area_name', 'area_name_en', 'area_color', 'area_weight',
  'chapter_code', 'chapter_title', 'chapter_hospital_types',
  'entry_code', 'entry_title', 'entry_hospital_types',
  'category_name',
  'item_code', 'item_title', 'item_description',
  'item_assessment_method', 'item_sop_type', 'item_severity',
  'item_is_mandatory', 'item_is_pilot', 'item_hospital_types',
  'item_required_evidence', 'item_version', 'item_weight',
]

export async function GET() {
  const isAdmin = await isPlatformAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, [
    'PS', '환자안전', 'Patient Safety', '#ef4444', '1.00',
    'PS-1', '감염관리', 'general_hospital,clinic',
    'PS-1.1', '감염관리 조직', 'general_hospital,clinic',
    '조직 구성',
    'PS-1.1.1', '감염관리 위원회 구성', '', '서류 검토', 'structure', 'major', 'TRUE', 'FALSE', 'general_hospital', '위원회 명단', '2024', '1.00',
  ]])
  ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 20 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'criteria')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="criteria_template.xlsx"',
    },
  })
}

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

  const buf = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return NextResponse.json({ error: 'Empty spreadsheet' }, { status: 400 })

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws) as Record<string, unknown>[]
  if (rows.length === 0) return NextResponse.json({ error: 'No data rows' }, { status: 400 })

  const seenAreas = new Map<string, { code: string; name: string; name_en: string | null; color: string | null; weight: number }>()
  const seenChapters = new Map<string, { area_code: string; code: string; title: string; hospital_types: string[] }>()
  const seenEntries = new Map<string, { chapter_code: string; code: string; title: string; hospital_types: string[] }>()
  const seenCategories = new Map<string, { entry_code: string; name: string }>()
  const items: Array<Record<string, unknown>> = []
  const errors: string[] = []
  let rowNum = 1

  for (const r of rows) {
    rowNum++
    const areaCode = s(r.area_code); const areaName = s(r.area_name)
    const chCode = s(r.chapter_code); const chTitle = s(r.chapter_title)
    const enCode = s(r.entry_code); const enTitle = s(r.entry_title)
    const catName = s(r.category_name)
    const itemCode = s(r.item_code)

    if (!areaCode || !areaName) { errors.push(`${rowNum}행: area_code/area_name 필수`); continue }
    if (!chCode || !chTitle) { errors.push(`${rowNum}행: chapter_code/chapter_title 필수`); continue }
    if (!enCode || !enTitle) { errors.push(`${rowNum}행: entry_code/entry_title 필수`); continue }
    if (!itemCode) { errors.push(`${rowNum}행: item_code 필수`); continue }

    if (!seenAreas.has(areaCode)) {
      seenAreas.set(areaCode, {
        code: areaCode, name: areaName,
        name_en: s(r.area_name_en) || null,
        color: s(r.area_color) || null,
        weight: n(r.area_weight, 1),
      })
    }

    if (!seenChapters.has(chCode)) {
      seenChapters.set(chCode, {
        area_code: areaCode, code: chCode, title: chTitle,
        hospital_types: parseTypes(r.chapter_hospital_types),
      })
    }

    if (!seenEntries.has(enCode)) {
      seenEntries.set(enCode, {
        chapter_code: chCode, code: enCode, title: enTitle,
        hospital_types: parseTypes(r.entry_hospital_types),
      })
    }

    if (catName && !seenCategories.has(`${enCode}::${catName}`)) {
      seenCategories.set(`${enCode}::${catName}`, { entry_code: enCode, name: catName })
    }

    items.push({
      entry_code: enCode,
      category_name: catName || null,
      code: itemCode,
      title: s(r.item_title) || '',
      description: s(r.item_description) || '',
      assessment_method: s(r.item_assessment_method) || null,
      sop_type: s(r.item_sop_type) || 'process',
      severity: s(r.item_severity) || 'major',
      is_mandatory: b(r.item_is_mandatory, true),
      is_pilot: b(r.item_is_pilot, false),
      hospital_types: parseTypes(r.item_hospital_types),
      required_evidence: s(r.item_required_evidence) || null,
      version: s(r.item_version) || '2024',
      weight: n(r.item_weight, 1),
      sort_order: items.length + 1,
    })
  }

  // --- bulk insert ---
  let areaCount = 0; let chapterCount = 0
  let entryCount = 0; let categoryCount = 0; let itemCount = 0

  for (const a of seenAreas.values()) {
    const { error } = await supabase.from('accreditation_areas').upsert(
      { code: a.code, name: a.name, name_en: a.name_en, color: a.color, weight: a.weight, sort_order: areaCount },
      { onConflict: 'code', ignoreDuplicates: false }
    )
    if (error) errors.push(`area ${a.code}: ${error.message}`)
    else areaCount++
  }

  for (const ch of seenChapters.values()) {
    const { data: area } = await supabase.from('accreditation_areas').select('id').eq('code', ch.area_code).maybeSingle()
    if (!area) { errors.push(`chapter ${ch.code}: area ${ch.area_code} not found`); continue }
    const { error } = await supabase.from('accreditation_chapters').upsert(
      { area_id: area.id, code: ch.code, title: ch.title, hospital_types: ch.hospital_types, sort_order: chapterCount },
      { onConflict: 'code', ignoreDuplicates: false }
    )
    if (error) errors.push(`chapter ${ch.code}: ${error.message}`)
    else chapterCount++
  }

  for (const en of seenEntries.values()) {
    const { data: ch } = await supabase.from('accreditation_chapters').select('id').eq('code', en.chapter_code).maybeSingle()
    if (!ch) { errors.push(`entry ${en.code}: chapter ${en.chapter_code} not found`); continue }
    const { error } = await supabase.from('accreditation_entries').upsert(
      { chapter_id: ch.id, code: en.code, title: en.title, hospital_types: en.hospital_types, sort_order: entryCount },
      { onConflict: 'code', ignoreDuplicates: false }
    )
    if (error) errors.push(`entry ${en.code}: ${error.message}`)
    else entryCount++
  }

  for (const cat of seenCategories.values()) {
    const [entryCode, _catName] = cat.name.startsWith(cat.entry_code) ? [cat.entry_code, cat.name] : [cat.entry_code, cat.name]
    const { data: entry } = await supabase.from('accreditation_entries').select('id').eq('code', cat.entry_code).maybeSingle()
    if (!entry) { errors.push(`category ${cat.name}: entry ${cat.entry_code} not found`); continue }
    const { error } = await supabase.from('accreditation_categories').upsert(
      { entry_id: entry.id, name: cat.name, sort_order: categoryCount },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    if (error) errors.push(`category ${cat.name}: ${error.message}`)
    else categoryCount++
  }

  for (const it of items) {
    const { data: entry } = await supabase.from('accreditation_entries').select('id').eq('code', it.entry_code as string).maybeSingle()
    if (!entry) { errors.push(`item ${it.code}: entry ${it.entry_code} not found`); continue }

    let categoryId: string | null = null
    if (it.category_name) {
      const { data: cat } = await supabase.from('accreditation_categories')
        .select('id').eq('entry_id', entry.id).eq('name', it.category_name as string).maybeSingle()
      if (cat) categoryId = cat.id
    }

    const { error } = await supabase.from('accreditation_survey_items').upsert(
      {
        entry_id: entry.id,
        category_id: categoryId,
        code: it.code as string,
        title: it.title as string,
        description: it.description as string,
        assessment_method: it.assessment_method as string | null,
        sop_type: (it.sop_type as string) || 'process',
        severity: (it.severity as string) || 'major',
        is_mandatory: it.is_mandatory as boolean,
        is_pilot: it.is_pilot as boolean,
        hospital_types: it.hospital_types as string[],
        required_evidence: it.required_evidence as string | null,
        version: (it.version as string) || '2024',
        weight: it.weight as number,
        sort_order: it.sort_order as number,
      },
      { onConflict: 'code,version', ignoreDuplicates: false }
    )
    if (error) errors.push(`item ${it.code}: ${error.message}`)
    else itemCount++
  }

  return NextResponse.json({
    areas: areaCount, chapters: chapterCount,
    entries: entryCount, categories: categoryCount,
    items: itemCount, errors,
  })
}

// helpers
function s(v: unknown): string { return v == null ? '' : String(v).trim() }
function n(v: unknown, d: number): number { const x = parseFloat(String(v ?? '')); return isNaN(x) ? d : x }
function b(v: unknown, d: boolean): boolean {
  if (v == null) return d
  const s = String(v).trim().toLowerCase()
  if (['true', '1', 'yes', 'y'].includes(s)) return true
  if (['false', '0', 'no', 'n'].includes(s)) return false
  return d
}
function parseTypes(v: unknown): string[] {
  if (!v) return []
  return String(v).split(',').map((x) => x.trim()).filter(Boolean)
}
