'use client';

import { useState } from 'react';
import {
  ClipboardCheck,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Circle,
  Plus,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CertificationStatus } from '@/types';
import { AdminGate } from '@/components/features/AdminGate';

// 부서 및 업무 매핑 Mock 데이터
const initialDeptTasks = {
  '간호부': [
    { id: 'task-101', code: 'ME 1.1', title: '손위생 수행 및 모니터링', status: 'in_progress' as CertificationStatus, assignee: '이감염 간호사' },
    { id: 'task-102', code: 'ME 2.2', title: '낙상 위험도 평가 도구 적용', status: 'completed' as CertificationStatus, assignee: '최간호 부장' },
    { id: 'task-103', code: 'ME 3.1', title: '구어적/전화처방 안전 관리', status: 'in_progress' as CertificationStatus, assignee: '박병동 간호사' },
    { id: 'task-104', code: 'ME 4.3', title: '항암화학요법 투약 안전 관리', status: 'not_started' as CertificationStatus, assignee: '이감염 간호사' },
  ],
  'QPS/감염관리실': [
    { id: 'task-201', code: 'QPS 1.1', title: '질 향상 및 환자안전 운영 계획', status: 'completed' as CertificationStatus, assignee: '박안전 담당자' },
    { id: 'task-202', code: 'QPS 2.1', title: '환자안전 사건 보고 체계 운영', status: 'completed' as CertificationStatus, assignee: '박안전 담당자' },
    { id: 'task-203', code: 'ME 1.2', title: '감염병 유행 발생 시 대응 시뮬레이션', status: 'in_progress' as CertificationStatus, assignee: '김QPS 실장' },
  ],
  '행정부': [
    { id: 'task-301', code: 'FMS 1.1', title: '소방 및 화재 안전 관리', status: 'completed' as CertificationStatus, assignee: '박행정 부장' },
    { id: 'task-302', code: 'FMS 2.3', title: '의료기기 안전성 검사 대장 현행화', status: 'in_progress' as CertificationStatus, assignee: '이시설 대리' },
    { id: 'task-303', code: 'HR 1.2', title: '직원 인적사항 및 자격 검증', status: 'completed' as CertificationStatus, assignee: '임인사 과장' },
  ],
  '약제부': [
    { id: 'task-401', code: 'MMU 1.1', title: '고위험의약품 보관 및 시건장치 점검', status: 'in_progress' as CertificationStatus, assignee: '김약사 실장' },
    { id: 'task-402', code: 'MMU 2.1', title: '유효기간 경과 약품 폐기 대장', status: 'completed' as CertificationStatus, assignee: '김약사 실장' },
  ],
  '진료부': [
    { id: 'task-501', code: 'ME 3.2', title: '수술/시술 부위 마킹 지침 이행', status: 'in_progress' as CertificationStatus, assignee: '이의사 원장' },
    { id: 'task-502', code: 'ME 5.1', title: '동의서 징구 프로세스 모니터링', status: 'not_started' as CertificationStatus, assignee: '정외과 과장' },
  ],
};

const staffByDept: Record<string, string[]> = {
  '간호부': ['이감염 간호사', '최간호 부장', '박병동 간호사', '김외래 간호사'],
  'QPS/감염관리실': ['김QPS 실장', '박안전 담당자'],
  '행정부': ['박행정 부장', '이시설 대리', '임인사 과장'],
  '약제부': ['김약사 실장', '정약사 과장'],
  '진료부': ['이의사 원장', '정외과 과장', '김내과 과장'],
};

const unassignedStandards = [
  { code: 'ME 5.2', title: '마취/진정 관리 지침 및 사후 모니터링' },
  { code: 'ME 6.1', title: '신체억제대 사용 기준 및 동의서 점검' },
  { code: 'QPS 3.2', title: '환자 만족도 조사 및 질 개선 활동 계획' },
  { code: 'FMS 3.1', title: '위험물질 관리 및 특별폐기물 처리 절차' },
];

export default function TasksPage() {
  const [activeDept, setActiveDept] = useState<keyof typeof initialDeptTasks>('간호부');
  const [deptTasks, setDeptTasks] = useState(initialDeptTasks);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStandardIndex, setSelectedStandardIndex] = useState(0);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  const handleAssigneeChange = (taskId: string, newAssignee: string) => {
    const updatedTasks = { ...deptTasks };
    updatedTasks[activeDept] = updatedTasks[activeDept].map((t) =>
      t.id === taskId ? { ...t, assignee: newAssignee } : t
    );
    setDeptTasks(updatedTasks);
  };

  const handleStatusChange = (taskId: string, newStatus: CertificationStatus) => {
    const updatedTasks = { ...deptTasks };
    updatedTasks[activeDept] = updatedTasks[activeDept].map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setDeptTasks(updatedTasks);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const standard = unassignedStandards[selectedStandardIndex];
    if (!standard) return;

    const newTask = {
      id: `task-${Date.now()}`,
      code: standard.code,
      title: standard.title,
      status: 'not_started' as CertificationStatus,
      assignee: selectedAssignee || staffByDept[activeDept][0],
    };

    const updatedTasks = { ...deptTasks };
    updatedTasks[activeDept] = [...updatedTasks[activeDept], newTask];
    setDeptTasks(updatedTasks);
    setShowAddModal(false);
    setSelectedAssignee('');
  };

  const currentTasks = deptTasks[activeDept] || [];
  const completedCount = currentTasks.filter((t) => t.status === 'completed').length;
  const progressPercent = currentTasks.length > 0 ? Math.round((completedCount / currentTasks.length) * 100) : 0;

  return (
    <AdminGate>
      <div className="space-y-5 fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <ClipboardCheck size={20} className="text-blue-600" />
              직무 및 업무 분장
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              의료기관평가인증 기준(ME)에 따라 각 부서별 및 부서원별로 세부 준비 항목을 배분하고 조율합니다.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedStandardIndex(0);
              setSelectedAssignee(staffByDept[activeDept][0]);
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3.5 py-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            인증 업무 추가 배정
          </button>
        </div>

        {/* 부서 선택 탭 */}
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          {Object.keys(deptTasks).map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept as keyof typeof initialDeptTasks)}
              className={cn(
                'py-2.5 px-4 text-sm font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer',
                activeDept === dept
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* 부서별 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">배정된 기준 총합</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{currentTasks.length}개 항목</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">인증 준비 완료</div>
              <div className="text-xl font-bold text-slate-800 mt-0.5">{completedCount}개 항목</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">해당 부서 진척률</div>
              <div className="text-xl font-bold text-indigo-600 mt-0.5">{progressPercent}%</div>
            </div>
          </div>
        </div>

        {/* 업무 목록 테이블 */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">{activeDept} 업무 분장 명세</h3>
            <span className="text-xs text-slate-500">실시간 수정 사항은 즉시 반영됩니다.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[120px]">인증기준 코드</th>
                  <th className="min-w-[280px]">인증 세부 준비 항목</th>
                  <th className="w-[150px]">담당 부서원</th>
                  <th className="w-[150px]">진행 상태</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.length > 0 ? (
                  currentTasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-xs">
                          {task.code}
                        </span>
                      </td>
                      <td className="font-semibold text-slate-800 text-sm">
                        {task.title}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          <select
                            value={task.assignee}
                            onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {staffByDept[activeDept]?.map((staffName) => (
                              <option key={staffName} value={staffName}>
                                {staffName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as CertificationStatus)}
                          className={cn(
                            "text-xs border border-slate-200 rounded px-2 py-1 font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-500",
                            task.status === 'completed' ? 'text-emerald-700 border-emerald-200 bg-emerald-50/30' :
                            task.status === 'in_progress' ? 'text-blue-700 border-blue-200 bg-blue-50/30' : 'text-slate-500'
                          )}
                        >
                          <option value="not_started">미시작</option>
                          <option value="in_progress">진행중</option>
                          <option value="completed">준비 완료</option>
                          <option value="overdue">기한 초과</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-400">
                      부서에 배정된 인증 업무가 없습니다. 우측 상단의 추가 버튼을 클릭해 보세요.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 신규 배정 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ClipboardCheck size={18} className="text-blue-600" />
                  미배정 인증 기준 업무 추가 배분
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  닫기
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">인증 기준 선택</label>
                  <select
                    value={selectedStandardIndex}
                    onChange={(e) => setSelectedStandardIndex(Number(e.target.value))}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {unassignedStandards.map((std, index) => (
                      <option key={std.code} value={index}>
                        [{std.code}] {std.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">담당자 배정 ({activeDept})</label>
                  <select
                    value={selectedAssignee}
                    onChange={(e) => setSelectedAssignee(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {staffByDept[activeDept]?.map((staffName) => (
                      <option key={staffName} value={staffName}>
                        {staffName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-2 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
                  >
                    업무 배정 확정
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
