import Link from 'next/link';
import {
  RefreshCw,
  ExternalLink,
  CalendarClock,
  Building2,
  Filter,
  FileWarning,
} from 'lucide-react';
import { HOSPITAL_TYPE_LABELS } from '@/types';
import {
  UPDATE_ENTRIES,
  UPDATE_CATEGORY_LABELS,
  UPDATE_CATEGORY_ICONS,
  getDaysUntil,
  type UpdateCategory,
} from '@/lib/updateCatalog';

export const metadata = { title: '업데이트 — 기준집·규정집·양식 개정 현황' };

interface Props {
  searchParams: Promise<{ category?: string }>;
}

const CATEGORY_KEYS = Object.keys(UPDATE_CATEGORY_LABELS) as UpdateCategory[];

function EffectiveBadge({ effectiveDate }: { effectiveDate?: string }) {
  const days = getDaysUntil(effectiveDate);
  if (!effectiveDate || days === null) return null;

  if (days > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
        <CalendarClock size={11} />
        {effectiveDate.replaceAll('-', '.')} 시행 (D-{days})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
      <CalendarClock size={11} />
      {effectiveDate.replaceAll('-', '.')} 시행 중
    </span>
  );
}

export default async function UpdatesPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const activeCategory =
    category && CATEGORY_KEYS.includes(category as UpdateCategory)
      ? (category as UpdateCategory)
      : null;

  const entries = activeCategory
    ? UPDATE_ENTRIES.filter((e) => e.category === activeCategory)
    : UPDATE_ENTRIES;

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <RefreshCw size={20} className="text-blue-600" />
          업데이트
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          인증기준집·규정집·양식의 공식 개정 소식과, 그에 따라 원내에서 개정해야 할 문서를 정리합니다.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="card p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          <Link
            href="/admin/updates"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !activeCategory
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            전체
          </Link>
          {CATEGORY_KEYS.map((key) => (
            <Link
              key={key}
              href={`/admin/updates?category=${key}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {UPDATE_CATEGORY_ICONS[key]} {UPDATE_CATEGORY_LABELS[key]}
            </Link>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state card">
          <div className="font-medium text-slate-600">해당 카테고리의 업데이트가 없습니다.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const isExternal = entry.sourceUrl.startsWith('http');
            const targetLabel =
              entry.hospitalTypes.length === 0
                ? '전체'
                : entry.hospitalTypes.map((t) => HOSPITAL_TYPE_LABELS[t] || t).join(', ');

            return (
              <div
                key={entry.id}
                className={`p-4 border rounded-lg bg-white fade-in ${
                  entry.isImportant ? 'border-amber-300 bg-amber-50/40' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {entry.isImportant && <span className="badge badge-urgent">중요 개정</span>}
                  <span className="badge badge-info">
                    {UPDATE_CATEGORY_ICONS[entry.category]} {UPDATE_CATEGORY_LABELS[entry.category]}
                  </span>
                  {entry.version && <span className="badge badge-default">{entry.version}</span>}
                  <span className="badge badge-default flex items-center gap-1">
                    <Building2 size={10} />
                    {targetLabel}
                  </span>
                  <EffectiveBadge effectiveDate={entry.effectiveDate} />
                </div>

                <h3 className="font-semibold text-slate-800 mb-1">{entry.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{entry.summary}</p>

                {entry.affectedDocuments.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-1.5">
                      <FileWarning size={12} className="text-amber-500" />
                      원내 개정 검토가 필요한 문서
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.affectedDocuments.map((doc) => (
                        <span
                          key={doc}
                          className="text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded px-2 py-0.5"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    출처: {entry.sourceName}
                    {entry.publishedDate && ` · ${entry.publishedDate.replaceAll('-', '.')} 공표`}
                  </span>
                  {isExternal ? (
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      원문 보기 <ExternalLink size={11} />
                    </a>
                  ) : (
                    <Link
                      href={entry.sourceUrl}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      바로 가기
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-xs text-slate-400 text-center pt-2">
        본 목록은 공식 공문·공표 자료 기준으로 관리됩니다. 최종 확인은 반드시 의료기관평가인증원
        누리집(koiha.or.kr) 및 인증시스템(ae.koiha.or.kr) 자료실에서 하십시오.
      </div>
    </div>
  );
}
