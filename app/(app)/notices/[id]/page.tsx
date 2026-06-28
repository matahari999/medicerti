import { createClient } from '@/lib/supabase/server';
import { mockNotices } from '@/lib/mock-data';
import { NOTICE_SOURCE_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { HospitalType, NoticeSource } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  Bell,
  ExternalLink,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  let isMock = true;
  let notice: any = null;

  try {
    const supabase = await createClient();
    const { data: dbNotice, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && dbNotice) {
      isMock = false;
      notice = dbNotice;
    }
  } catch (err) {
    console.error('공지 상세 DB 조회 실패, 데모 모드로 작동:', err);
    isMock = true;
  }

  // Fallback 처리
  if (isMock) {
    notice = mockNotices.find((n) => n.id === id);
  }

  if (!notice) notFound();

  const sourceLabel = NOTICE_SOURCE_LABELS[notice.source as NoticeSource] || notice.source;
  const targetLabel = notice.target_hospital_types || notice.targetHospitalTypes
    ? (notice.target_hospital_types || notice.targetHospitalTypes)
        .map((t: HospitalType) => HOSPITAL_TYPE_LABELS[t] || t)
        .join(', ')
    : '전체 의료기관';

  const published = notice.published_at || notice.publishedAt;
  const expires = notice.expires_at || notice.expiresAt;

  return (
    <div className="max-w-3xl space-y-5 fade-in">
      <Link
        href="/notices"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={14} />
        공지사항 목록
      </Link>

      {notice.urgency === 'urgent' && (
        <div className="urgent-banner rounded-lg">
          <AlertTriangle size={16} />
          <span className="font-bold">긴급 공지</span>
          <span className="text-white/80 text-sm">· 즉시 확인이 필요합니다.</span>
        </div>
      )}

      <div className="card p-6">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          {notice.urgency === 'urgent' && (
            <span className="badge badge-urgent flex items-center gap-1">
              <AlertTriangle size={10} />
              긴급
            </span>
          )}
          <span className="badge badge-info">{sourceLabel}</span>
          <span className="badge badge-default flex items-center gap-1">
            <Building2 size={10} />
            {targetLabel}
          </span>
        </div>

        <h1 className="text-xl font-black text-slate-900 mb-4 leading-snug">
          {notice.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-4 mb-6 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} />
            게시일: {formatDate(published)}
          </span>
          {expires && (
            <span className="flex items-center gap-1.5 text-amber-600">
              <Clock size={14} />
              공지 종료: {formatDate(expires)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Bell size={14} />
            출처: {sourceLabel}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed">
          {notice.content}
        </div>

        {(notice.source_url || notice.sourceUrl) && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <a
              href={notice.source_url || notice.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-semibold"
            >
              관련 원문 링크 바로가기 <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}