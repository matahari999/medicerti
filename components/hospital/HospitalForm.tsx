'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { REGIONS } from '@/lib/validators/hospital'
import type { Hospital } from '@/types/database.types'
import type { HospitalState } from '@/app/actions/hospital'

interface HospitalFormProps {
  action:    (prev: HospitalState | null, formData: FormData) => Promise<HospitalState>
  defaultValues?: Partial<Hospital>
  submitLabel?: string
}

function FieldError({ field, errors }: { field: string; errors?: Record<string, string[]> }) {
  const msg = errors?.[field]?.[0]
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1">{msg}</p>
}

export function HospitalForm({
  action,
  defaultValues,
  submitLabel = '저장',
}: HospitalFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | undefined>(undefined)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setFieldErrors(undefined)
    setSaved(false)
    const result = await action(null, formData)
    if (result.success) setSaved(true)
    if (result.error) { setError(result.error); setFieldErrors(result.fieldErrors) }
    setPending(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error != null && (
        <div className="bg-red-50 text-red-700 text-sm px-3 py-2.5 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {saved && (
        <div className="bg-green-50 text-green-700 text-sm px-3 py-2.5 rounded-lg border border-green-200">
          저장되었습니다
        </div>
      )}

      {/* 기본 정보 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">기본 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="name">
              병원명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="○○ 요양병원"
              defaultValue={defaultValues?.name ?? ''}
              required
            />
            <FieldError field="name" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="license_number">요양기관번호</Label>
            <Input
              id="license_number"
              name="license_number"
              placeholder="12345678"
              defaultValue={defaultValues?.license_number ?? ''}
            />
            <FieldError field="license_number" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bed_count">병상 수</Label>
            <Input
              id="bed_count"
              name="bed_count"
              type="number"
              min={1}
              placeholder="100"
              defaultValue={defaultValues?.bed_count ?? ''}
            />
            <FieldError field="bed_count" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="region">지역 (시/도)</Label>
            <Select name="region" defaultValue={defaultValues?.region ?? ''}>
              <SelectTrigger id="region">
                <SelectValue placeholder="지역 선택" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError field="region" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">전화번호</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="02-0000-0000"
              defaultValue={defaultValues?.phone ?? ''}
            />
            <FieldError field="phone" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="address">주소</Label>
            <Input
              id="address"
              name="address"
              placeholder="서울특별시 ..."
              defaultValue={defaultValues?.address ?? ''}
            />
            <FieldError field="address" errors={fieldErrors} />
          </div>
        </div>
      </section>

      {/* 인증 정보 */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">인증 정보</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="accreditation_cycle">인증 차수</Label>
            <Input
              id="accreditation_cycle"
              name="accreditation_cycle"
              type="number"
              min={1}
              placeholder="1"
              defaultValue={defaultValues?.accreditation_cycle ?? 1}
            />
            <FieldError field="accreditation_cycle" errors={fieldErrors} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accreditation_start">인증 시작일</Label>
            <Input
              id="accreditation_start"
              name="accreditation_start"
              type="date"
              defaultValue={defaultValues?.accreditation_start ?? ''}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accreditation_target">인증 목표일</Label>
            <Input
              id="accreditation_target"
              name="accreditation_target"
              type="date"
              defaultValue={defaultValues?.accreditation_target ?? ''}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" className="bg-brand-600 hover:bg-brand-700" disabled={pending}>
          {pending ? '저장 중…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
