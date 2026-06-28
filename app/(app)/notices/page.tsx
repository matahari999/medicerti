import { createClient } from '@/lib/supabase/server';
import { mockNotices } from '@/lib/mock-data';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { NOTICE_SOURCE_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { NoticeSource, HospitalType } from '@/types';
import Link from 'next/link';
import {
  AlertTriangle,
  Bell,
  ExternalLink,
  Clock,
  Building2,
  Filter,
} from 'lucide-react';

interface Props {
  searchParams: Promise<{ source?: string; urgency?: string }>;
}

export default async function NoticesPage({ searchParams }: Props) {
  const { source, urgency } = await searchParams;
  let isMock = true;
  let noticesList: any[] = [];
  let urgentCount = 0;
  let firstUrgentTitle = '';

  try {
    const supabase = await createClient();
    let query = supabase.from('notices').select('*');

    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (urgency) {
      query = query.eq('urgency', urgency);
    }

    const { data: dbNotices, error } = await query.order('published_at', { ascending: false });

    if (!error && dbNotices && dbNotices.length > 0) {
      isMock = false;
      noticesList = dbNotices;
      
      const urgents = dbNotices.filter((n) => n.urgency === 'urgent');
      urgentCount = urgents.length;
      if (urgentCount > 0) {
        firstUrgentTitle = urgents[0].title;
      }
    }
  } catch (err) {
    console.error('공지사항 DB 조회 실패, 데모 모드로 작동:', err);
    isMock = true;
  }

  if (isMock) {
    let filteredMock = [...mockNotices];
    if (source && source !== 'all') {
      filteredMock = filteredMock.filter((n) => n.source === source);
    }
    if (urgency) {
      filteredMock = filteredMock.filter((n) => n.urgency === urgency);
    }
    noticesList = filteredMock;

    const urgents = mockNotices.filter((n) => n.urgency === 'urgent');
    urgentCount = urgents.length;
    if (urgentCount > 0) {
      firstUrgentTitle = urgents[0].title;
    }
  }

  const sortedNotices = [...noticesList].sort((a, b) => {
    if (a.urgency === 'urgent' && b.urgency !== 'urgent') return -1;
    if (b.urgency === 'urgent' && a.urgency !== 'urgent') return 1;
    const dateA = new Date(a.published_at || a.publishedAt).getTime();
    const dateB = new Date(b.published_at || b.publishedAt).getTime();
    return dateB - dateA;
  });

  const sources: (NoticeSource | 'all')[] = ['all', 'koiha', 'hira', 'mohw', 'kdca'];
  const sourceLabels: Record<string, string> = {
    all: '전체',
    ...NOTICE_SOURCE_LABELS,
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div>
        <h1 className="section-title flex items-center gap-2">
          <Bell size={20} className="text-blue-600" />
          공지사항
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          의료기관평가인증원, 건강보험심사평가원, 보건복지부, 질병관리청 공지를 통합 제공합니다.
        </p>
      </div>

      {urgentCount > 0 && (
        <div className="urgent-banner rounded-lg mb-4">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span className="font-bold">긴급 공지 {urgentCount}건</span>
          <span className="text-white/80 text-sm">·</span>
          <span className="text-sm text-white/80 flex-1 truncate">
            {firstUrgentTitle}
          </span>
          <Link href="/notices?urgency=urgent" className="text-xs text-white/70 hover:text-white ml-2 flex-shrink-0 flex items-center gap-1">
            확인하기 <ExternalLink size={10} />
          </Link>
        </div>
      )}

      <div className="card p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-slate-400" />
          {sources.map((s) => {
            const isActive = (!source && s === 'all') || source === s;
            return (
              <Link
                key={s}
                href={s === 'all' ? '/notices' : `/notices?source=${s}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {sourceLabels[s]}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="data-source">
        <span>출처:</span>
        <span>의료기관평가인증원 · 건강보험심사평가원 · 보건복지부 · 질병관리청</span>
        <span>·</span>
        <span>동기화 시간: {formatDate(new Date().toISOString(), 'yyyy.MM.dd HH:mm')}</span>
      </div>

      {sortedNotices.length === 0 ? (
        <div className="empty-state card">
          <div className="font-medium text-slate-600">공지사항이 없습니다.</div>
          <div className="text-sm text-slate-400 mt-1">지정한 조건에 매칭되는 소식이 없습니다.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedNotices.map((notice) => {
            const targetLabel = notice.target_hospital_types || notice.targetHospitalTypes
              ? (notice.target_hospital_types || notice.targetHospitalTypes)
                  .map((t: HospitalType) => HOSPITAL_TYPE_LABELS[t] || t)
                  .join(', ')
              : '전체';
            const published = notice.published_at || notice.publishedAt;
            const expires = notice.expires_at || notice.expiresAt;

            return (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className={`block p-4 border rounded-lg hover:shadow-md transition-all fade-in ${
                  notice.urgency === 'urgent'
                    ? 'border-red-200 bg-red-50 hover:bg-red-100'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notice.urgency === 'urgent' ? 'bg-red-100' : 'bg-blue-50'
                  }`}>
                    {notice.urgency === 'urgent' ? (
                      <AlertTriangle size={16} className="text-red-600" />
                    ) : (
                      <Bell size={16} className="text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {notice.urgency === 'urgent' && (
                        <span className="badge badge-urgent">긴급</span>
                      )}
                      <span className="badge badge-info">{NOTICE_SOURCE_LABELS[notice.source as NoticeSource] || notice.source}</span>
                      <span className="badge badge-default flex items-center gap-1">
                        <Building2 size={10} />
                        {targetLabel}
                      </span>
                    </div>

                    <h3 className={`font-semibold mb-1 line-clamp-2 ${
                      notice.urgency === 'urgent' ? 'text-red-800' : 'text-slate-800'
                    }`}>
                      {notice.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatRelativeDate(published)}
                      </span>
                      <span>{formatDate(published, 'yyyy.MM.dd')}</span>
                      {expires && (
                        <span className="text-amber-600">
                          ~ {formatDate(expires, 'yyyy.MM.dd')} 까지
                        </span>
                      )}
                    </div>
                  </div>
                  {(notice.source_url || notice.sourceUrl) && (
                    <ExternalLink size={14} className="text-slate-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="text-xs text-slate-400 text-center pt-2">
        공지 수집 오류 또는 추가 문의는 시스템 관리자에게 연락하세요.
      </div>
    </div>
  );
}