import { createClient } from '@/lib/supabase/server';
import { HospitalTypeFilter } from '@/components/features/HospitalTypeFilter';
import { InlineAssigneeCell } from '@/components/features/InlineAssigneeCell';
import { mockCertificationCategories } from '@/lib/mock-data';
import { Suspense } from 'react';
import { CERTIFICATION_STATUS_LABELS, HOSPITAL_TYPE_LABELS } from '@/types';
import type { CertificationStatus } from '@/types';
import { formatDate, calcProgressPercent } from '@/lib/utils';
import Link from 'next/link';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  Filter,
  Download,
  ChevronRight,
  UserCircle,
} from 'lucide-react';

function StatusBadge({ status }: { status: CertificationStatus }) {
  const configs: Record<CertificationStatus, { label: string; class: string; icon: React.ReactNode }> = {
    not_started: {
      label: '미시작',
      class: 'badge-default',
      icon: <Circle size={10} />,
    },
    in_progress: {
      label: '진행중',
      class: 'badge-info',
      icon: <Clock size={10} />,
    },
    completed: {
      label: '완료',
      class: 'badge-success',
      icon: <CheckCircle2 size={10} />,
    },
    overdue: {
      label: '기한초과',
      class: 'badge-urgent',
      icon: <AlertTriangle size={10} />,
    },
  };

  const config = configs[status] || configs.not_started;

  return (
    <span className={`badge ${config.class} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </span>
  );
}

function CategoryCard({
  category,
}: {
  category: any;
}) {
  const percent = calcProgressPercent(category.completedItems, category.totalItems);
  const remaining = category.totalItems - category.completedItems;

  let progressColor = '#3b82f6';
  if (percent === 100) progressColor = '#10b981';
  else if (percent >= 70) progressColor = '#3b82f6';
  else if (percent >= 40) progressColor = '#f59e0b';
  else progressColor = '#ef4444';

  return (
    <div className="card p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800">{category.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{category.description || '인증 기준 세부 항목'}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-2">
          <div className="text-2xl font-black text-slate-800">{percent}%</div>
          <div className="text-xs text-slate-500">{category.completedItems}/{category.totalItems}</div>
        </div>
      </div>

      <div className="progress-bar mb-3">
        <div
          className="progress-fill"
          style={{ width: `${percent}%`, background: progressColor }}
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1 text-emerald-700">
          <CheckCircle2 size={11} />
          완료 {category.completedItems}
        </span>
        <span className="flex items-center gap-1 text-blue-600">
          <Clock size={11} />
          진행중 {category.inProgressItems}
        </span>
        {remaining > 0 && (
          <span className="flex items-center gap-1 text-slate-500">
            <Circle size={11} />
            미시작 {remaining - category.inProgressItems}
          </span>
        )}
      </div>

      <Link
        href={`/certification/${category.id}`}
        className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
      >
        <span>상세 체크리스트 보기</span>
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

interface PageProps {
  searchParams?: { type?: string };
}

export default async function CertificationPage({ searchParams }: PageProps) {
  const selectedType = searchParams?.type || 'nursing';
  let isMock = true;
  let categoriesData: any[] = [];
  let todoItems: any[] = [];

  const hospitalTypeLabels: Record<string, string> = {
    nursing: '요양병원 (3주기)',
    psychiatric: '정신병원',
    rehabilitation: '재활병원',
    acute: '급성기병원',
    dental: '치과병원',
    korean: '한방병원',
  };
  let hospitalTypeLabel = hospitalTypeLabels[selectedType] || '요양병원';

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile && profile.hospital_id) {
        const { data: hospital } = await supabase
          .from('hospitals')
          .select('*')
          .eq('id', profile.hospital_id)
          .single();
        
        if (hospital) {
          // 사용자가 자신의 실제 병원 유형을 필터링했을 경우에만 DB 데이터 연동
          if (hospital.type === selectedType) {
            isMock = false;
            hospitalTypeLabel = hospitalTypeLabels[hospital.type] || hospital.type;

            const { data: items } = await supabase
              .from('certification_items')
              .select('*')
              .eq('hospital_id', hospital.id);

          if (items && items.length > 0) {
            const catMap = new Map<string, { id: string; name: string; completed: number; total: number; inProgress: number }>();
            items.forEach((item) => {
              const cat = item.category;
              if (!catMap.has(cat)) {
                const baseMock = mockCertificationCategories.find(c => c.name === cat);
                catMap.set(cat, {
                  id: baseMock?.id || `cat-${cat}`,
                  name: cat,
                  completed: 0,
                  total: 0,
                  inProgress: 0,
                });
              }
              const stats = catMap.get(cat)!;
              stats.total += 1;
              if (item.status === 'completed') stats.completed += 1;
              else if (item.status === 'in_progress') stats.inProgress += 1;
            });
            categoriesData = Array.from(catMap.values()).map((v) => ({
              id: v.id,
              name: v.name,
              completedItems: v.completed,
              totalItems: v.total,
              inProgressItems: v.inProgress,
            }));
          }

          const { data: dbTodos } = await supabase
            .from('certification_items')
            .select('*')
            .eq('hospital_id', hospital.id)
            .neq('status', 'completed')
            .order('due_date', { ascending: true });

          if (dbTodos) {
            const now = new Date();
            todoItems = dbTodos.map((t) => {
              const due = t.due_date ? new Date(t.due_date) : null;
              const isOverdue = due ? due < now && t.status !== 'completed' : false;
              return {
                id: t.id,
                category: t.category,
                title: t.title,
                status: (isOverdue ? 'overdue' : t.status) as CertificationStatus,
                assignee: t.assignee,
                dueDate: t.due_date || '기한없음',
              };
            });
          }
          } else {
            isMock = true;
          }
        }
      }
    }
  } catch (err) {
    console.error('인증 페이지 DB 로딩 실패, 데모 모드 작동:', err);
    isMock = true;
  }

  if (isMock) {
    categoriesData = mockCertificationCategories;
    todoItems = [
      { id: 'item-001', category: '감염관리', title: '손위생 수행율 모니터링 대장 최신화', status: 'in_progress' as CertificationStatus, assignee: '이간호 간호사', dueDate: '2026-06-20' },
      { id: 'item-002', category: '환자안전', title: '낙상 예방 지침서 개정 (v2.1)', status: 'overdue' as CertificationStatus, assignee: '박안전 담당자', dueDate: '2026-06-15' },
      { id: 'item-003', category: '의약품관리', title: '고위험의약품 관리 규정 준수실태 점검', status: 'not_started' as CertificationStatus, assignee: null, dueDate: '2026-06-25' },
      { id: 'item-004', category: '환어진료체계', title: '진료기록 완성도 자체검사 대장 작성', status: 'in_progress' as CertificationStatus, assignee: '최진료 과장', dueDate: '2026-06-30' },
    ];
  }

  const totalItems = categoriesData.reduce((sum, c) => sum + c.totalItems, 0);
  const completedItems = categoriesData.reduce((sum, c) => sum + c.completedItems, 0);
  const overallPercent = calcProgressPercent(completedItems, totalItems);
  const inProgressTotal = categoriesData.reduce((sum, c) => sum + c.inProgressItems, 0);
  const notStartedTotal = totalItems - completedItems - inProgressTotal;

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <ClipboardCheck size={20} className="text-blue-600" />
            인증 준비
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {hospitalTypeLabel} 의료기관 평가인증기준 준비 현황
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <Suspense fallback={<div className="h-8 w-24 bg-slate-100 animate-pulse rounded-lg" />}>
            <HospitalTypeFilter initialType={selectedType} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-blue-700">{overallPercent}%</div>
          <div className="text-xs text-slate-500 mt-1">전체 완료율</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-emerald-600">{completedItems}</div>
          <div className="text-xs text-slate-500 mt-1">완료 항목</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-blue-600">
            {inProgressTotal}
          </div>
          <div className="text-xs text-slate-500 mt-1">진행 중</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-black text-slate-400">
            {notStartedTotal}
          </div>
          <div className="text-xs text-slate-500 mt-1">미시작</div>
        </div>
      </div>

      <div>
        <h2 className="font-bold text-slate-700 mb-3">카테고리별 진행률</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesData.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* 진행 중 / 미완료 항목 */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">진행 중 / 미완료 항목</h3>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded px-2.5 py-1.5 hover:bg-slate-50 transition-colors">
            <Download size={12} />
            체크리스트 다운로드
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th>카테고리</th>
                <th className="min-w-[240px]">항목</th>
                <th>상태</th>
                <th>담당자</th>
                <th>마감기한</th>
              </tr>
            </thead>
            <tbody>
              {todoItems.map((item) => (
                <tr key={item.id} className={item.status === 'overdue' ? 'bg-red-50/50' : ''}>
                  <td>
                    <span className="badge badge-default text-xs">{item.category}</span>
                  </td>
                  <td className="font-medium text-slate-800">{item.title}</td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <InlineAssigneeCell
                      itemId={item.id}
                      initialAssignee={item.assignee}
                      isMock={isMock}
                    />
                  </td>
                  <td className={`text-sm ${item.status === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                    {formatDate(item.dueDate)}
                    {item.status === 'overdue' && <span className="ml-1 text-xs">(초과)</span>}
                  </td>
                </tr>
              ))}
              {todoItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400 text-sm">
                    미완료 항목이 없습니다. 모두 완료되었습니다! 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}