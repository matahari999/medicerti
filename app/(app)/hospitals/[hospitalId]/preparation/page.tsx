import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// ponytail: one-file page, inline server actions, no client components

const STATUS = ['not_started', 'in_progress', 'completed'] as const
const STATUS_LABEL: Record<string, string> = {
  not_started: '미시작', in_progress: '진행중', completed: '완료',
}
const STATUS_COLOR: Record<string, string> = {
  not_started: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
}
const DOMAIN_COLOR: Record<string, string> = {
  PS: 'border-l-red-500', PC: 'border-l-amber-500',
  GL: 'border-l-blue-500', QS: 'border-l-green-500',
}

// ── server action ──────────────────────────────────────────

async function saveProgress(formData: FormData) {
  'use server'

  const criterionId = formData.get('criterion_id') as string
  const hospitalId = formData.get('hospital_id') as string
  const status = formData.get('status') as string
  const targetDate = formData.get('target_date') as string
  const notes = formData.get('notes') as string

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('preparation_progress')
    .select('id')
    .eq('hospital_id', hospitalId)
    .eq('criterion_id', criterionId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('preparation_progress')
      .update({ status, target_date: targetDate || null, notes: notes || null, updated_by: user.id })
      .eq('id', (existing as Record<string, unknown>).id as string)
  } else {
    await supabase
      .from('preparation_progress')
      .insert({ hospital_id: hospitalId, criterion_id: criterionId, status, target_date: targetDate || null, notes: notes || null, updated_by: user.id } as never)
  }

  revalidatePath(`/hospitals/${hospitalId}/preparation`)
}

// ── page ───────────────────────────────────────────────────

export default async function PreparationPage({
  params,
}: { params: Promise<{ hospitalId: string }> }) {
  const { hospitalId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: hospital } = await supabase
    .from('hospitals')
    .select('name')
    .eq('id', hospitalId)
    .single()

  const { data: rows } = await supabase
    .from('accreditation_criteria')
    .select('*, preparation_progress!left(id, status, target_date, notes)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  type CriteriaRow = { id: string; criterion_code: string; criterion_name: string; category: string; sort_order: number; is_active: boolean; preparation_progress?: { id: string; status: string; target_date: string | null; notes: string | null }[] }
  const criteria = (rows ?? []) as CriteriaRow[]

  const today = new Date()
  const sevenDaysLater = new Date(today.getTime() + 7 * 86400000)

  const stats = { total: criteria.length, not_started: 0, in_progress: 0, completed: 0, overdue: 0, due_soon: 0 }
  const enriched = criteria.map((c) => {
    const pp = c.preparation_progress?.[0]
    const status = pp?.status ?? 'not_started'
    const targetDate = pp?.target_date ?? null
    const notes = pp?.notes ?? null

    if (status === 'not_started') stats.not_started++
    else if (status === 'in_progress') stats.in_progress++
    else stats.completed++

    if (status !== 'completed' && targetDate) {
      const d = new Date(targetDate)
      if (d < today) stats.overdue++
      else if (d <= sevenDaysLater) stats.due_soon++
    }
    return { ...c, _status: status, _targetDate: targetDate, _notes: notes }
  })

  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  const domainOrder = ['PS', 'PC', 'GL', 'QS']
  const grouped = domainOrder.map((d) => ({
    code: d,
    items: enriched.filter((c: any) => c.domain_code === d),
  }))

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">인증 준비 대시보드 <span className="text-base font-normal text-gray-500">{(hospital as Record<string, unknown>).name as string}</span></h1>

      {/* ── progress bar ── */}
      <div className="grid grid-cols-5 gap-3">
        <div className="col-span-3 rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">전체 진행률</span>
            <span className={progressPct >= 80 ? 'text-green-600 font-bold' : progressPct >= 50 ? 'text-amber-600' : 'text-red-600'}>{progressPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        {[
          { label: '전체', count: stats.total, color: 'text-gray-900' },
          { label: '미시작', count: stats.not_started, color: 'text-gray-500' },
          { label: '진행중', count: stats.in_progress, color: 'text-blue-600' },
          { label: '완료', count: stats.completed, color: 'text-green-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── domain sections ── */}
      <div className="space-y-8">
        {grouped.map((g) => g.items.length === 0 ? null : (
          <section key={g.code}>
            <h2 className="mb-2 text-lg font-semibold">{g.code}</h2>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="w-20 py-2 pr-2">코드</th>
                  <th className="py-2 pr-2">항목</th>
                  <th className="w-24 py-2 pr-2">상태</th>
                  <th className="w-32 py-2 pr-2">목표일</th>
                  <th className="py-2 pr-2">메모</th>
                  <th className="w-20 py-2">저장</th>
                </tr>
              </thead>
              <tbody>
                {g.items.map((c: any) => {
                  const isOverdue = c._status !== 'completed' && c._targetDate && new Date(c._targetDate) < today
                  const isDueSoon = c._status !== 'completed' && c._targetDate && new Date(c._targetDate) <= sevenDaysLater && new Date(c._targetDate) >= today
                  const rowBg = isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-amber-50' : ''

                  return (
                    <tr key={c.id as string} className={`border-b ${rowBg}`}>
                      <td className="py-2 pr-2 font-mono text-xs">{c.code as string}</td>
                      <td className="py-2 pr-2">
                        <div className="truncate font-medium">{c.title as string}</div>
                        <div className="truncate text-xs text-gray-400">{c.domain as string}</div>
                      </td>
                      <td className="py-2 pr-2">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[c._status]}`}>
                          {STATUS_LABEL[c._status]}
                        </span>
                      </td>
                      <td className="py-2 pr-2">
                        <form action={saveProgress} className="flex items-center gap-1">
                          <input type="hidden" name="criterion_id" value={c.id as string} />
                          <input type="hidden" name="hospital_id" value={hospitalId} />

                          <select name="status" defaultValue={c._status}
                            className="w-full rounded border px-1 py-1 text-xs">
                            {STATUS.map((s) => (
                              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                            ))}
                          </select>

                          <input type="date" name="target_date" defaultValue={c._targetDate ?? ''}
                            className="w-28 rounded border px-1 py-1 text-xs" />

                          <input type="text" name="notes" defaultValue={c._notes ?? ''} placeholder="메모"
                            className="w-24 rounded border px-1 py-1 text-xs" />

                          <button type="submit"
                            className="rounded bg-gray-800 px-2 py-1 text-xs text-white hover:bg-gray-700">
                            저장
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {stats.overdue > 0 || stats.due_soon > 0 ? (
              <div className="mt-4 flex gap-4 text-xs">
                {stats.overdue > 0 && <span className="text-red-600">⚠ 기한초과 {stats.overdue}건</span>}
                {stats.due_soon > 0 && <span className="text-amber-600">⚡ 임박 {stats.due_soon}건 (7일 이내)</span>}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  )
}
