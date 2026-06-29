import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserHospitals } from '@/lib/services/hospital.service'
import ScheduleCalendar from './ScheduleCalendar'

export const metadata: Metadata = { title: '인증 일정 캘린더' }

export default async function SchedulePage() {
  const hospitals = await getUserHospitals()
  const supabase = await createClient()

  // Fetch rounding records for all user hospitals
  const hospitalIds = hospitals.map((h: any) => h.id as string)

  const [{ data: roundingRecords }, { data: ackLogs }] = await Promise.all([
    supabase
      .from('rounding_records')
      .select('id, hospital_id, title, round_date, overall_score')
      .in('hospital_id', hospitalIds)
      .order('round_date', { ascending: false }),
    supabase
      .from('employee_acknowledgment_logs')
      .select('hospital_id, acknowledged_at, department')
      .in('hospital_id', hospitalIds)
      .order('acknowledged_at', { ascending: false })
      .limit(200),
  ])

  const roundingEvents = (roundingRecords ?? []).map((r: any) => ({
    id: r.id,
    hospitalId: r.hospital_id,
    hospitalName: hospitals.find((h: any) => h.id === r.hospital_id)?.name ?? '',
    title: r.title ?? '라운딩',
    date: r.round_date,
    type: 'rounding' as const,
    score: r.overall_score,
  }))

  const ackEvents = (ackLogs ?? []).map((l: any) => ({
    id: crypto.randomUUID(),
    hospitalId: l.hospital_id,
    hospitalName: hospitals.find((h: any) => h.id === l.hospital_id)?.name ?? '',
    title: `${l.department ?? ''} 인지 확인`,
    date: l.acknowledged_at,
    type: 'acknowledgment' as const,
    score: null,
  }))

  const deadlineEvents = hospitals
    .filter((h: any) => h.accreditation_target)
    .map((h: any) => ({
      id: `deadline_${h.id}`,
      hospitalId: h.id,
      hospitalName: h.name,
      title: '인증 목표일',
      date: h.accreditation_target,
      type: 'deadline' as const,
      score: null,
    }))

  const events = [...roundingEvents, ...ackEvents, ...deadlineEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gray-900 mb-4">
          <CalendarDays className="w-4 h-4" />
          대시보드
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">인증 일정 캘린더</h1>
        <p className="text-sm text-muted-foreground mt-1">
          병원별 인증 목표일, 라운딩 기록, 직원 인지 확인 일정을 한눈에
        </p>
      </div>

      <ScheduleCalendar events={events} />
    </div>
  )
}
