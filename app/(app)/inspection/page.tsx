'use client';

import { useMemo, useState } from 'react';
import { CalendarCheck, Printer, ListChecks, AlertCircle } from 'lucide-react';
import {
  CHECKLIST_TEMPLATES,
  FREQUENCY_LABELS,
  generateInspectionDates,
  holidayCoverageWarning,
  buildInspectionFormHtml,
  getTemplate,
  type Frequency,
  type InspectionScheduleConfig,
  type ChecklistItem,
} from '@/lib/inspectionSchedule';

function firstOfThisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function parseCustomItems(raw: string): ChecklistItem[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split('|').map((s) => s.trim());
      return b ? { category: a, content: b } : { category: '자체 점검', content: a };
    });
}

export default function InspectionPage() {
  const [templateId, setTemplateId] = useState<string>('fire');
  const [title, setTitle] = useState<string>('소방 안전 점검표');
  const [hospitalName, setHospitalName] = useState<string>('');
  const [inspectorName, setInspectorName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(firstOfThisMonth());
  const [months, setMonths] = useState<number>(3);
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [skipWeekend, setSkipWeekend] = useState<boolean>(true);
  const [skipHoliday, setSkipHoliday] = useState<boolean>(true);
  const [customRaw, setCustomRaw] = useState<string>('');

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = getTemplate(id);
    if (t) {
      setTitle(t.name);
      setFrequency(t.defaultFrequency);
    } else if (id === 'custom') {
      setTitle('자체 점검표');
    }
  }

  const config: InspectionScheduleConfig = useMemo(
    () => ({
      templateId,
      title,
      hospitalName,
      inspectorName,
      startDate,
      months,
      frequency,
      skipWeekend,
      skipHoliday,
      customItems: templateId === 'custom' ? parseCustomItems(customRaw) : undefined,
    }),
    [templateId, title, hospitalName, inspectorName, startDate, months, frequency, skipWeekend, skipHoliday, customRaw]
  );

  const dates = useMemo(() => {
    try {
      return generateInspectionDates(config);
    } catch {
      return [];
    }
  }, [config]);

  const warning = holidayCoverageWarning(config);
  const template = getTemplate(templateId);
  const items = templateId === 'custom' ? parseCustomItems(customRaw) : template?.items ?? [];

  function handleGenerate() {
    if (!hospitalName.trim()) {
      alert('병원명을 입력해 주세요.');
      return;
    }
    if (items.length === 0) {
      alert('점검 항목이 없습니다. 템플릿을 선택하거나 항목을 입력해 주세요.');
      return;
    }
    const { html } = buildInspectionFormHtml(config);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-blue-600" />
          점검표 생성
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          점검 유형과 기간·주기를 정하면 주말·공휴일을 제외한 점검일을 자동 계산해 인쇄용 점검 일지를 만들어 드립니다.
          네모칸(☐)은 클릭하면 체크(☑)됩니다.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── 설정 폼 ── */}
        <div className="lg:col-span-2 space-y-5 bg-white border border-gray-200 rounded-2xl p-6">
          {/* 점검 유형 */}
          <div>
            <label className={labelCls}>점검 유형</label>
            <div className="grid sm:grid-cols-3 gap-2">
              {CHECKLIST_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyTemplate(t.id)}
                  className={`text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    templateId === t.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {t.name.replace(' 점검표', '')}
                  <span className="block text-[11px] text-gray-400 mt-0.5">{t.items.length}개 항목</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => applyTemplate('custom')}
                className={`text-left rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  templateId === 'custom'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                직접 입력
                <span className="block text-[11px] text-gray-400 mt-0.5">항목 자유 작성</span>
              </button>
            </div>
          </div>

          {templateId === 'custom' && (
            <div>
              <label className={labelCls}>점검 항목 (한 줄에 하나, &quot;구분 | 항목&quot; 형식도 가능)</label>
              <textarea
                value={customRaw}
                onChange={(e) => setCustomRaw(e.target.value)}
                rows={5}
                placeholder={'소방 안전 | 소화기 압력계 정상 여부\n전기 안전 | 누전차단기 작동 여부\n비상구 장애물 유무'}
                className={inputCls + ' font-mono text-xs leading-relaxed'}
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>점검표명</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>병원명 *</label>
              <input
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="예: OO요양병원"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>점검자 (선택)</label>
              <input value={inspectorName} onChange={(e) => setInspectorName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>시작일</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>대상 기간</label>
              <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={inputCls}>
                {[1, 2, 3, 6, 12].map((m) => (
                  <option key={m} value={m}>
                    {m}개월
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>점검 주기</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency)}
                className={inputCls}
              >
                {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
                  <option key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={skipWeekend}
                onChange={(e) => setSkipWeekend(e.target.checked)}
                className="w-4 h-4"
              />
              주말(토·일) 제외
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={skipHoliday}
                onChange={(e) => setSkipHoliday(e.target.checked)}
                className="w-4 h-4"
              />
              국가공휴일 제외
            </label>
            <span className="text-xs text-gray-400 self-center">제외된 날은 다음 근무일로 이동합니다.</span>
          </div>

          {warning && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              {warning}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 transition-colors"
          >
            <Printer size={18} />
            점검 일지 생성 / 인쇄
          </button>
        </div>

        {/* ── 미리보기 ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 flex items-center gap-1.5 mb-3">
              <ListChecks size={16} className="text-blue-600" />
              생성 요약
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">점검 항목</dt>
                <dd className="font-semibold text-gray-800">{items.length}개</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">총 점검 횟수</dt>
                <dd className="font-semibold text-blue-700">{dates.length}회</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">주기</dt>
                <dd className="font-semibold text-gray-800">{FREQUENCY_LABELS[frequency]}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">점검일 미리보기</h3>
            <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
              {dates.length === 0 && <p className="text-xs text-gray-400">설정을 확인해 주세요.</p>}
              {dates.map((d) => (
                <div key={d.dateKey} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 w-6 text-right">{d.seq}</span>
                  <span className="font-mono">{d.dateKey}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded ${
                      d.weekday === '토' || d.weekday === '일'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {d.weekday}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
