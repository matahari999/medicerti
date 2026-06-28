'use client';

import { use, useState, useEffect } from 'react';
import { mockCertificationCategories } from '@/lib/mock-data';
import { CERTIFICATION_STATUS_LABELS } from '@/types';
import type { CertificationStatus } from '@/types';
import { formatDate, calcProgressPercent } from '@/lib/utils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Circle,
  UserCircle,
  Save,
  Download,
  Info,
  Loader2,
} from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default function CertificationDetailPage({ params }: Props) {
  const { id } = use(params);
  const [category, setCategory] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isMock, setIsMock] = useState(true);

  const categoryMap: Record<string, string> = {
    'cat-01': '기본가치체계',
    'cat-02': '환어진료체계',
    'cat-03': '의약관리',
    'cat-04': '환자안전',
    'cat-05': '감염관리',
    'cat-06': '경영 및 조직운영',
  };

  const statusIcons = {
    not_started: <Circle size={14} className="text-slate-400" />,
    in_progress: <Clock size={14} className="text-blue-500 animate-pulse" />,
    completed: <CheckCircle2 size={14} className="text-emerald-500" />,
    overdue: <AlertTriangle size={14} className="text-red-500" />,
  };

  const getCategoryItemsFallback = (catId: string) => {
    const baseItems: Record<string, Array<{
      id: string;
      title: string;
      description: string;
      status: CertificationStatus;
      assignee: string | null;
      dueDate: string;
    }>> = {
      'cat-01': [
        { id: 'det-001', title: '환자의 권리와 의무 게시 및 안내', description: '원내 게시판 및 입원 약정시 환자 권리 선언문 고지 여부 점검', status: 'completed', assignee: '김원무 팀장', dueDate: '2026-06-01' },
        { id: 'det-002', title: '신체억제대 사용 규정 및 동의서 점검', description: '억제대 처방 기준, 의사 동의서 서식 및 모니터링 주기 준수 여부', status: 'in_progress', assignee: '이가은 수간호사', dueDate: '2026-06-22' },
        { id: 'det-003', title: '환자 고충처리 대장 이행도', description: '고충 건의함 운영, 분기별 고충 해결 이력 보고 및 피드백 대장', status: 'not_started', assignee: '원장실 비서', dueDate: '2026-06-30' },
        { id: 'det-004', title: '환자 안전 권리 교육 이수', description: '환자들의 안전 권리 및 의무 준수에 대한 입원 환자 대상 안내 교육', status: 'completed', assignee: '최간호 수간호사', dueDate: '2026-05-15' },
      ],
      'cat-02': [
        { id: 'det-005', title: '입원 환자 초기평가 수행도 점검', description: '입원 후 24시간 이내 간호 초기평가, 의사 초기 진료기록 작성률 100% 달성', status: 'in_progress', assignee: '정진료 과장', dueDate: '2026-06-25' },
        { id: 'det-006', title: '환자 식사 제공 및 영양 상태 평가', description: '영양 불량 환자 스크리닝 및 영양 관리 계획 수립 절차 점검', status: 'completed', assignee: '박영양 영양사', dueDate: '2026-06-10' },
        { id: 'det-007', title: 'CPR(심폐소생술) 모의 훈련 및 대장', description: '원내 응급상황 대응 훈련 이력, 응급 카트 매일 점검표 확인', status: 'in_progress', assignee: '최간호 수간호사', dueDate: '2026-06-28' },
        { id: 'det-008', title: '진료기록 충실도 평가 지침 마련', description: '의무기록 서식 미비 보고 체계 및 월별 자가 점검 대장 수립', status: 'not_started', assignee: '정진료 과장', dueDate: '2026-07-05' },
      ],
      'cat-03': [
        { id: 'det-009', title: '고위험의약품 보관 및 시각적 표기', description: '고농도 전해질, 인슐린, 조영제 이중 잠금 및 적색 스티커 부착 상태', status: 'completed', assignee: '이약무 약사', dueDate: '2026-06-05' },
        { id: 'det-010', title: '마약류 이중 잠금장치 및 보안 점검', description: '마약 및 향정신성의약품 금고 이중 잠금장치 작동 및 열쇠 관리 현황', status: 'completed', assignee: '이약무 약사', dueDate: '2026-06-08' },
        { id: 'det-011', title: '구두 처방 준수 절차 및 대장 기록', description: '응급 시 구두처방 절차(Read-Back) 지침 교육 및 서면 결재 기한 준수', status: 'in_progress', assignee: '정진료 과장', dueDate: '2026-06-26' },
        { id: 'det-012', title: '자가 지참 약물 식별 및 투약 지침', description: '환자 입원 시 지참한 약물 식별 의뢰 및 처방과 확인 절차 점검', status: 'not_started', assignee: '이약무 약사', dueDate: '2026-06-30' },
      ],
      'cat-04': [
        { id: 'det-013', title: '낙상 예방 스크리닝 및 예방 활동', description: '입원 환자 낙상 위험도 평가(Morse Fall Scale) 및 고위험군 표식 부착', status: 'overdue', assignee: '박안전 담당자', dueDate: '2026-06-15' },
        { id: 'det-014', title: '소방 안전 설비 및 스프링클러 점검', description: '원내 소방 비상 통로 확보, 유도등 배터리 교체, 월간 자체 점검', status: 'completed', assignee: '이시설 대리', dueDate: '2026-06-12' },
        { id: 'det-015', title: '환자안전사고 보고 관리 및 공유', description: '근접오류, 적신호사건 발생 시 원내 보고 체계 및 대책 수립 절차', status: 'in_progress', assignee: '박안전 담당자', dueDate: '2026-06-25' },
      ],
      'cat-05': [
        { id: 'det-016', title: '손위생 수행도 모니터링 및 피드백', description: '부서별 손위생 5 Moments 관찰 수행률 통계 및 결과 보고서 작성', status: 'in_progress', assignee: '이가은 수간호사', dueDate: '2026-06-20' },
        { id: 'det-017', title: '의료기구 멸균기 모니터링 대장', description: 'Autoclave 기계적/화학적/생물학적(BI) 모니터링 테스트 기록지 보관', status: 'completed', assignee: '이가은 수간호사', dueDate: '2026-06-14' },
        { id: 'det-018', title: '의료폐기물 적정 보관 및 대장 점검', description: '격리의료폐기물 및 일반의료폐기물 전용 용기 뚜껑 및 사용 기한 기입', status: 'completed', assignee: '이시설 대리', dueDate: '2026-06-11' },
        { id: 'det-019', title: '격리실 운영 및 공조 시설 점검', description: '음압/양압 격리실 입구 손위생 비치물품, 격리 안내문 설치 여부', status: 'in_progress', assignee: '이시설 대리', dueDate: '2026-06-24' },
      ],
      'cat-06': [
        { id: 'det-020', title: '직원 면허 및 면허 유효기간 검증', description: '의사, 간호사, 약사, 의료기사 등의 유효한 면허 상태 및 보수교육 현황', status: 'completed', assignee: '김인사 대리', dueDate: '2026-06-10' },
        { id: 'det-021', title: '비상 발전기 모의 가동 및 시험성적서', description: '정전 시 15초 이내 비상 전원 공급 시스템 작동 시험 및 기록지 보관', status: 'completed', assignee: '이시설 대리', dueDate: '2026-06-05' },
        { id: 'det-022', title: '의료가스 설비 공급 안전 점검', description: '산소 및 아산화질소 중앙 공급실 배관 누출 테스트 및 실린더 보관 상태', status: 'completed', assignee: '이시설 대리', dueDate: '2026-06-03' },
      ],
    };
    return baseItems[catId] || [];
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const catName = categoryMap[id];
      const baseMockCategory = mockCertificationCategories.find((c) => c.id === id);

      if (!baseMockCategory) {
        setLoading(false);
        return;
      }

      setCategory(baseMockCategory);

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

      if (isMockMode) {
        setIsMock(true);
        setItems(getCategoryItemsFallback(id));
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsMock(true);
          setItems(getCategoryItemsFallback(id));
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('hospital_id')
          .eq('id', session.user.id)
          .single();

        if (!profile || !profile.hospital_id) {
          setIsMock(true);
          setItems(getCategoryItemsFallback(id));
          setLoading(false);
          return;
        }

        const { data: dbItems, error } = await supabase
          .from('certification_items')
          .select('*')
          .eq('hospital_id', profile.hospital_id)
          .eq('category', catName)
          .order('due_date', { ascending: true });

        if (error || !dbItems || dbItems.length === 0) {
          setIsMock(true);
          setItems(getCategoryItemsFallback(id));
        } else {
          setIsMock(false);
          const now = new Date();
          setItems(
            dbItems.map((t) => {
              const due = t.due_date ? new Date(t.due_date) : null;
              const isOverdue = due ? due < now && t.status !== 'completed' : false;
              return {
                id: t.id,
                title: t.title,
                description: t.description,
                status: (isOverdue ? 'overdue' : t.status) as CertificationStatus,
                assignee: t.assignee,
                dueDate: t.due_date || '기한없음',
              };
            })
          );

          const completedCount = dbItems.filter(i => i.status === 'completed').length;
          const inProgressCount = dbItems.filter(i => i.status === 'in_progress').length;
          setCategory({
            ...baseMockCategory,
            totalItems: dbItems.length,
            completedItems: completedCount,
            inProgressItems: inProgressCount,
          });
        }
      } catch (err) {
        console.error('세부 데이터 로드 중 오류 발생, 데모 모드 작동:', err);
        setIsMock(true);
        setItems(getCategoryItemsFallback(id));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleStatusChange = (itemId: string, status: CertificationStatus) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
            }
          : item
      )
    );
  };

  const handleAssigneeChange = (itemId: string, assignee: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              assignee: assignee || null,
            }
          : item
      )
    );
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSuccessMsg('');

    if (isMock) {
      await new Promise((r) => setTimeout(r, 600));
      setSuccessMsg('체크리스트 상태가 임시 저장되었습니다. (데모 모드)');
      setIsSaving(false);
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    try {
      const supabase = createClient();
      const promises = items.map((item) => {
        const statusToSave = item.status === 'overdue' ? 'in_progress' : item.status;
        return supabase
          .from('certification_items')
          .update({
            status: statusToSave,
            assignee: item.assignee || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);
      });

      const results = await Promise.all(promises);
      const failed = results.filter((r) => r.error);

      if (failed.length > 0) {
        throw new Error(`${failed.length}개 항목 저장 실패`);
      }

      setSuccessMsg('체크리스트 변경 사항이 성공적으로 데이터베이스에 저장되었습니다!');
      
      const completedCount = items.filter(i => i.status === 'completed').length;
      const inProgressCount = items.filter(i => i.status === 'in_progress' || i.status === 'overdue').length;
      if (category) {
        setCategory({
          ...category,
          completedItems: completedCount,
          inProgressItems: inProgressCount,
        });
      }

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(`저장 중 오류 발생: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">체크리스트 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800">카테고리를 찾을 수 없습니다.</h2>
        <Link href="/certification" className="text-blue-600 underline text-sm mt-2 inline-block">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/certification" className="hover:text-blue-600 transition-colors">
          인증 준비
        </Link>
        <span>&gt;</span>
        <span className="font-semibold text-slate-800">{category.name}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/certification"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="section-title">{category.name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{category.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all text-xs disabled:bg-blue-400"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={12} />
            ) : (
              <Save size={12} />
            )}
            <span>변경사항 저장</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-600 rounded-lg hover:bg-slate-50 font-bold transition-all text-xs">
            <Download size={12} />
            인쇄용 PDF
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg shadow-sm font-medium fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {successMsg}
        </div>
      )}

      <div className="flex items-start gap-2.5 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>인증 규정 관리 팁:</strong> 각 세부 평가 항목의 진행률은 수집된 문서(규정집, 서식)의 버전 최신 상태와 담당 인력의 교육 이수를 기준으로 종합 평가합니다. 정기 자체 감사를 대비하여 주기적으로 진행 상황을 업데이트하고 저장해 주십시오.
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table min-w-[800px]">
            <thead>
              <tr>
                <th className="w-[12%]">진행상태</th>
                <th className="min-w-[280px]">평가 기준 항목 및 개요</th>
                <th className="w-[20%]">담당자</th>
                <th className="w-[15%] font-medium">마감기한</th>
                <th className="w-[15%]">상태변경</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    등록된 세부 항목이 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/50 transition-colors ${
                      item.status === 'overdue' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center gap-1.5">
                        {statusIcons[item.status as keyof typeof statusIcons] || statusIcons.not_started}
                        <span
                          className={`text-xs font-bold ${
                            item.status === 'completed'
                              ? 'text-emerald-700'
                              : item.status === 'in_progress'
                              ? 'text-blue-600'
                              : item.status === 'overdue'
                              ? 'text-red-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {CERTIFICATION_STATUS_LABELS[item.status as keyof typeof CERTIFICATION_STATUS_LABELS] || item.status}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 text-sm leading-snug">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1">
                        <UserCircle size={14} className="text-slate-400" />
                        <input
                          type="text"
                          value={item.assignee || ''}
                          placeholder="담당자 미지정"
                          onChange={(e) => handleAssigneeChange(item.id, e.target.value)}
                          className="w-full text-sm border-0 border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:ring-0 py-0.5 px-1 bg-transparent text-slate-700 focus:outline-none"
                        />
                      </div>
                    </td>

                    <td
                      className={`text-xs ${
                        item.status === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-600'
                      }`}
                    >
                      {formatDate(item.dueDate)}
                      {item.status === 'overdue' && <span className="ml-1 text-[10px]">(기한초과)</span>}
                    </td>

                    <td>
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(item.id, e.target.value as CertificationStatus)
                        }
                        className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                      >
                        <option value="not_started">미시작</option>
                        <option value="in_progress">진행중</option>
                        <option value="completed">완료</option>
                        <option value="overdue">기한초과</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">연계 필요 가이드 & 필수 서식</h3>
          <div className="space-y-2">
            {[
              { title: '신체억제대 사용 지침서 및 실무 매뉴얼', type: 'regulation' },
              { title: '응급카트 약품 보관 및 자체점검표 서식', type: 'form' },
              { title: '손위생 관찰 평가 모니터링 주간 통계표', type: 'checklist' },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100/70 transition-colors">
                <span className="text-xs font-medium text-slate-700 truncate mr-2">{doc.title}</span>
                <Link
                  href="/documents"
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  가기
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">연계 이수 필수 교육</h3>
          <div className="space-y-2">
            {[
              { title: '의료기관 감염관리 실무 심화 과정 (간호직 필수)', category: 'infection' },
              { title: '환자안전 및 낙상 예방 예방 교육 (전 직원)', category: 'safety' },
            ].map((edu, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100/70 transition-colors">
                <span className="text-xs font-medium text-slate-700 truncate mr-2">{edu.title}</span>
                <Link
                  href="/education"
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  수강
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}