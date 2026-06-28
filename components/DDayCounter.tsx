'use client';
import { useState } from 'react';
import { CalendarDays, Save } from 'lucide-react';

interface Props {
  dDay: number | null;
  evaluationDate?: string | null;
  hospitalId?: string;
  onUpdated?: (newDate: string) => void;
}

export default function DDayCounter({ dDay, evaluationDate, hospitalId, onUpdated }: Props) {
  const [editing, setEditing] = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [saving, setSaving] = useState(false);

  const saveDate = async () => {
    if (!dateInput || !hospitalId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluationDate: dateInput }),
      });
      if (res.ok) {
        setEditing(false);
        onUpdated?.(dateInput);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!dDay && !evaluationDate) {
    return (
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 text-center">
        <CalendarDays className="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 font-medium mb-3">인증 평가일이 설정되지 않았습니다</p>
        {hospitalId && (
          editing ? (
            <div className="flex gap-2 justify-center">
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={saveDate}
                disabled={saving || !dateInput}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                저장
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              평가일 설정하기
            </button>
          )
        )}
      </div>
    );
  }

  const isUrgent = (dDay ?? 999) <= 30;
  const isCritical = (dDay ?? 999) <= 7;

  return (
    <div className={`rounded-2xl border p-5 text-center ${
      isCritical ? 'bg-red-50 border-red-300' :
      isUrgent ? 'bg-amber-50 border-amber-300' :
      'bg-blue-50 border-blue-200'
    }`}>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">D-DAY</p>
      <p className={`text-5xl font-black ${
        isCritical ? 'text-red-600' :
        isUrgent ? 'text-amber-600' :
        'text-blue-600'
      }`}>
        {dDay === null ? '?' : dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-DAY' : `D+${Math.abs(dDay)}`}
      </p>
      {evaluationDate && (
        <p className="text-xs text-gray-400 mt-1">
          평가일: {new Date(evaluationDate).toLocaleDateString('ko-KR')}
        </p>
      )}
      {hospitalId && (
        editing ? (
          <div className="flex gap-2 justify-center mt-2">
            <input
              type="date"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={saveDate}
              disabled={saving || !dateInput}
              className="bg-blue-600 text-white px-2 py-1 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
            >
              저장
            </button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">취소</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-600 mt-1 underline">
            날짜 변경
          </button>
        )
      )}
      {isCritical && (
        <p className="text-xs text-red-600 font-semibold mt-2 bg-red-100 rounded-lg px-2 py-1 inline-block">
          ⚠️ 평가일이 7일 이내입니다!
        </p>
      )}
      {isUrgent && !isCritical && (
        <p className="text-xs text-amber-600 font-medium mt-2">
          ⏰ 평가일이 30일 이내입니다.
        </p>
      )}
    </div>
  );
}
