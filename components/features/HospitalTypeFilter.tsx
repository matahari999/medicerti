'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { HOSPITAL_TYPE_LABELS } from '@/types';

const TYPES = ['nursing', 'psychiatric', 'rehabilitation', 'general', 'tertiary'] as const;

export function HospitalTypeFilter({ initialType }: { initialType?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set('type', e.target.value);
    } else {
      params.delete('type');
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      defaultValue={initialType || ''}
      onChange={handleChange}
      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-600 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
    >
      <option value="">전체 병원 유형</option>
      {TYPES.map(t => (
        <option key={t} value={t}>{HOSPITAL_TYPE_LABELS[t]}</option>
      ))}
    </select>
  );
}
