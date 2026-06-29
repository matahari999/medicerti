import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CriteriaUploader } from '@/components/admin/criteria/CriteriaUploader'
import { CriteriaPdfUploader } from '@/components/admin/criteria/CriteriaPdfUploader'
import { BookOpen, Layers, FileText, ListTree, Hash } from 'lucide-react'

export const metadata: Metadata = { title: '인증기준 관리 — 어드민' }

async function getStats() {
  const supabase = await createClient()
  const [areas, chapters, entries, categories, items] = await Promise.all([
    supabase.from('accreditation_areas').select('id', { count: 'exact', head: true }),
    supabase.from('accreditation_chapters').select('id', { count: 'exact', head: true }),
    supabase.from('accreditation_entries').select('id', { count: 'exact', head: true }),
    supabase.from('accreditation_categories').select('id', { count: 'exact', head: true }),
    supabase.from('accreditation_survey_items').select('id', { count: 'exact', head: true }),
  ])
  return {
    areas: areas.count ?? 0, chapters: chapters.count ?? 0,
    entries: entries.count ?? 0, categories: categories.count ?? 0,
    items: items.count ?? 0,
  }
}

export default async function AdminCriteriaPage() {
  const stats = await getStats()

  const cards = [
    { label: '영역', count: stats.areas, icon: Layers, color: 'bg-blue-50 text-blue-700' },
    { label: '장', count: stats.chapters, icon: BookOpen, color: 'bg-green-50 text-green-700' },
    { label: '기준', count: stats.entries, icon: FileText, color: 'bg-amber-50 text-amber-700' },
    { label: '범주', count: stats.categories, icon: ListTree, color: 'bg-purple-50 text-purple-700' },
    { label: '조사항목', count: stats.items, icon: Hash, color: 'bg-rose-50 text-rose-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">인증기준 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">
          인증기준 5단계 계층 데이터를 엑셀/CSV로 업로드하거나 참고용 PDF를 등록합니다.
        </p>
      </div>

      {/* 현재 데이터 현황 */}
      <div className="grid grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border p-4 text-center">
            <div className={`inline-flex w-8 h-8 rounded-lg items-center justify-center ${c.color} mb-2`}>
              <c.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.count.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* 엑셀/CSV 업로드 */}
      <div className="bg-white rounded-xl border p-6 space-y-3">
        <h2 className="text-base font-semibold">엑셀/CSV 데이터 업로드</h2>
        <p className="text-sm text-muted-foreground">
          템플릿 형식에 맞춰 영역·장·기준·범주·조사항목을 한 번에 업로드합니다.
          기존 데이터는 <code className="font-mono text-xs bg-gray-100 px-1 rounded">code</code>(영역/장/기준) 또는
          <code className="font-mono text-xs bg-gray-100 px-1 rounded">code,version</code>(항목) 기준으로 덮어씁니다.
        </p>
        <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
          <li>영역(area), 장(chapter), 기준(entry)은 중복 코드시 업데이트</li>
          <li>조사항목(item)은 code+version 기준으로 upsert</li>
          <li>병원종류(hospital_types)는 콤마로 구분 (예: general_hospital,clinic)</li>
        </ul>
        <CriteriaUploader />
      </div>

      {/* PDF 업로드 */}
      <div className="bg-white rounded-xl border p-6 space-y-3">
        <h2 className="text-base font-semibold">인증기준집 PDF 업로드</h2>
        <p className="text-sm text-muted-foreground">
          참고용 인증기준집 PDF 파일을 업로드합니다. (스토리지 저장, 10년 유효 URL 생성)
        </p>
        <CriteriaPdfUploader />
      </div>
    </div>
  )
}
