'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays, ClipboardList, FileCheck, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  id: string
  hospitalId: string
  hospitalName: string
  title: string
  date: string
  type: 'rounding' | 'acknowledgment' | 'deadline'
  score: number | null
}

const TYPE_CONFIG = {
  rounding: { label: '라운딩', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: ClipboardList },
  acknowledgment: { label: '인지확인', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: FileCheck },
  deadline: { label: '인증목표', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return days
}

function formatDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

export default function ScheduleCalendar({ events }: { events: CalendarEvent[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const days = useMemo(() => getMonthDays(year, month), [year, month])

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    events.forEach((e) => {
      const key = e.date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [events])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold">
            {year}년 {month + 1}월
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
            className="px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded"
          >
            오늘
          </button>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b">
        {DAY_LABELS.map((l, i) => (
          <div key={l} className={cn('py-2 text-xs font-medium text-center', (i === 0 || i === 6) && 'text-red-400')}>
            {l}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="min-h-[100px] bg-gray-50/30" />

          const dateStr = formatDateStr(year, month, day)
          const dayEvents = eventMap.get(dateStr) ?? []
          const isToday = dateStr === todayStr
          const dayOfWeek = idx % 7

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-[100px] border-b border-r p-1.5',
                (dayOfWeek === 0 || dayOfWeek === 6) && 'bg-gray-50/30'
              )}
            >
              <div className={cn(
                'w-6 h-6 text-xs flex items-center justify-center rounded-full mb-1',
                isToday ? 'bg-brand-600 text-white font-bold' : 'text-gray-700'
              )}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => {
                  const cfg = TYPE_CONFIG[e.type]
                  return (
                    <div
                      key={e.id}
                      className={cn(
                        'text-[10px] px-1 py-0.5 rounded border truncate',
                        cfg.color
                      )}
                      title={`${e.hospitalName} - ${e.title}`}
                    >
                      {e.hospitalName.length > 4 ? e.hospitalName.slice(0, 4) : e.hospitalName}
                    </div>
                  )
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3}개</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t bg-gray-50/50">
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('w-2.5 h-2.5 rounded', cfg.color.split(' ')[0])} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Upcoming events list */}
      <div className="border-t">
        <div className="p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">다가오는 일정</p>
          {events.filter(e => new Date(e.date) >= today).slice(0, 5).length === 0 && (
            <p className="text-xs text-muted-foreground">예정된 일정이 없습니다</p>
          )}
          {events.filter(e => new Date(e.date) >= today).slice(0, 5).map((e) => (
            <div key={e.id} className="flex items-center gap-3 py-1.5 border-b last:border-0">
              <Badge variant="outline" className={cn('text-[10px]', TYPE_CONFIG[e.type].color)}>
                {TYPE_CONFIG[e.type].label}
              </Badge>
              <span className="text-xs font-medium">{e.hospitalName}</span>
              <span className="text-xs text-muted-foreground">{e.title}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(e.date).toLocaleDateString('ko-KR')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
