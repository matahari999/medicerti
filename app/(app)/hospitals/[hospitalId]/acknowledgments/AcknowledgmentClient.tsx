'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Trash2, Calendar, CheckCircle2, AlertTriangle, XCircle, Users,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { submitAcknowledgment, fetchAcknowledgments, removeAcknowledgment } from '@/app/actions/acknowledgment'
import type { EmployeeAcknowledgment } from '@/types/database.types'

interface Props {
  hospitalId: string
  initialAcks: EmployeeAcknowledgment[]
  initialStats: Array<{ department: string; total_employees: number; total_documents: number; total_acknowledgments: number; expired_count: number; compliance_rate: number }>
  regulations: Array<{ id: string; title: string; doc_type: string }>
}

export default function AcknowledgmentClient({ hospitalId, initialAcks, initialStats, regulations }: Props) {
  const [acks, setAcks] = useState(initialAcks)
  const [stats, setStats] = useState(initialStats)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const [employeeName, setEmployeeName] = useState('')
  const [employeeDept, setEmployeeDept] = useState('')
  const [employeeRole, setEmployeeRole] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(regulations[0]?.id ?? '')
  const [submitting, setSubmitting] = useState(false)

  const filteredAcks = search
    ? acks.filter((a) =>
        a.employee_name.includes(search) ||
        a.document_title.includes(search) ||
        (a.employee_department ?? '').includes(search)
      )
    : acks

  const handleSubmit = useCallback(async () => {
    if (!employeeName || !selectedDoc) return
    setSubmitting(true)
    const doc = regulations.find((r) => r.id === selectedDoc)
    if (!doc) return
    try {
      await submitAcknowledgment(hospitalId, doc.id, doc.doc_type, doc.title, employeeName, employeeDept || undefined, employeeRole || undefined)
      const newAcks = await fetchAcknowledgments(hospitalId)
      setAcks(newAcks as EmployeeAcknowledgment[])
      setEmployeeName('')
      setEmployeeDept('')
      setEmployeeRole('')
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }, [employeeName, selectedDoc, employeeDept, employeeRole, hospitalId, regulations])

  const handleDelete = useCallback(async (id: string) => {
    await removeAcknowledgment(id, hospitalId)
    setAcks((prev) => prev.filter((a) => a.id !== id))
  }, [hospitalId])

  const totalAcks = acks.length
  const expiredAcks = acks.filter((a) => a.expires_at && new Date(a.expires_at) < new Date()).length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{totalAcks}</div>
          <div className="text-[11px] text-slate-500 mt-1">전체 인지 확인</div>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{totalAcks - expiredAcks}</div>
          <div className="text-[11px] text-green-600 mt-1">유효</div>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{expiredAcks}</div>
          <div className="text-[11px] text-red-600 mt-1">만료</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{regulations.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">확인 대상 문서</div>
        </div>
      </div>

      {stats.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-1.5">
            <Users size={14} />
            부서별 인지율
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-500">부서</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-500">직원 수</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-500">문서 수</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-500">인지 횟수</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-500">만료</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-500">준수율</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.department} className="border-b border-slate-100">
                    <td className="py-1.5 px-2 font-medium text-slate-800">{s.department}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600">{s.total_employees}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600">{s.total_documents}</td>
                    <td className="py-1.5 px-2 text-right text-slate-600">{s.total_acknowledgments}</td>
                    <td className="py-1.5 px-2 text-right text-red-600">{s.expired_count}</td>
                    <td className="py-1.5 px-2 text-right font-bold" style={{ color: s.compliance_rate >= 80 ? '#16a34a' : s.compliance_rate >= 50 ? '#d97706' : '#dc2626' }}>
                      {s.compliance_rate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="직원명/문서 검색..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-brand-600 hover:bg-brand-700">
          <Plus className="w-4 h-4 mr-1.5" />
          인지 확인 등록
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-semibold text-sm text-slate-700">새 인지 확인 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">직원명 *</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="김철수"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">부서</label>
              <input
                type="text"
                value={employeeDept}
                onChange={(e) => setEmployeeDept(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="간호부"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">직책</label>
              <input
                type="text"
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="간호사"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">확인 문서 *</label>
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regulations.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="text-xs font-semibold text-slate-500 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              취소
            </button>
            <Button onClick={handleSubmit} disabled={submitting || !employeeName || !selectedDoc} className="bg-brand-600 hover:bg-brand-700">
              {submitting ? '저장 중...' : '등록'}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-2.5 px-3 font-semibold text-slate-500">직원</th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-500">부서</th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-500">문서</th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-500">인지 일시</th>
                <th className="text-left py-2.5 px-3 font-semibold text-slate-500">만료</th>
                <th className="text-right py-2.5 px-3 font-semibold text-slate-500">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcks.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium text-slate-800">{a.employee_name}</td>
                  <td className="py-2 px-3 text-slate-500">{a.employee_department ?? '-'}</td>
                  <td className="py-2 px-3 text-slate-600 max-w-[200px] truncate">{a.document_title}</td>
                  <td className="py-2 px-3 text-slate-500">
                    {new Date(a.acknowledged_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="py-2 px-3">
                    {a.expires_at ? (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                        new Date(a.expires_at) < new Date()
                          ? 'text-red-600 bg-red-50'
                          : 'text-green-600 bg-green-50'
                      )}>
                        {new Date(a.expires_at) < new Date() ? '만료' : new Date(a.expires_at).toLocaleDateString('ko-KR')}
                      </span>
                    ) : (
                      <span className="text-slate-400">영구</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAcks.length === 0 && (
          <div className="py-10 text-center text-slate-400 text-xs">
            {search ? '검색 결과가 없습니다' : '아직 등록된 인지 확인 로그가 없습니다'}
          </div>
        )}
      </div>
    </div>
  )
}
