'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  ChevronRight,
  User,
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 부서 Mock 데이터
const initialDepartments = [
  {
    id: 'dept-01',
    name: 'QPS/감염관리실',
    manager: '김QPS 실장',
    memberCount: 2,
    progress: 95,
    taskCount: 15,
    color: 'emerald',
  },
  {
    id: 'dept-02',
    name: '간호부',
    manager: '최간호 부장',
    memberCount: 12,
    progress: 82,
    taskCount: 28,
    color: 'blue',
  },
  {
    id: 'dept-03',
    name: '행정부',
    manager: '박행정 부장',
    memberCount: 5,
    progress: 90,
    taskCount: 10,
    color: 'cyan',
  },
  {
    id: 'dept-04',
    name: '약제부',
    manager: '김약사 실장',
    memberCount: 3,
    progress: 73,
    taskCount: 15,
    color: 'amber',
  },
  {
    id: 'dept-05',
    name: '진료부',
    manager: '이의사 부장',
    memberCount: 8,
    progress: 65,
    taskCount: 12,
    color: 'rose',
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptManager, setNewDeptManager] = useState('');

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptManager) return;
    
    const newDept = {
      id: `dept-0${departments.length + 1}`,
      name: newDeptName,
      manager: newDeptManager,
      memberCount: 0,
      progress: 0,
      taskCount: 0,
      color: 'slate',
    };

    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptManager('');
    setShowAddModal(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-emerald-600 text-emerald-600';
    if (progress >= 75) return 'bg-blue-600 text-blue-600';
    if (progress >= 50) return 'bg-amber-500 text-amber-500';
    return 'bg-rose-500 text-rose-500';
  };

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <Building2 size={20} className="text-blue-600" />
            부서 현황
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            의료기관 평가인증 준비를 위한 부서별 담당 현황 및 인증완료율을 실시간 관리합니다.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3.5 py-2 transition-all shadow-sm"
        >
          <Plus size={14} />
          새 부서 등록
        </button>
      </div>

      {/* 요약 대시보드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">전체 부서 수</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{departments.length}개 부서</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Building2 size={20} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">총 부서원 수</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {departments.reduce((sum, d) => sum + d.memberCount, 0)}명
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">평균 인증 준비율</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">
              {Math.round(departments.reduce((sum, d) => sum + d.progress, 0) / departments.length)}%
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">보완 필요 부서</div>
            <div className="text-2xl font-bold text-rose-600 mt-1">
              {departments.filter((d) => d.progress < 70).length}개 처
            </div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle size={20} />
          </div>
        </div>
      </div>

      {/* 부서 목록 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const colorClass = getProgressColor(dept.progress);
          const [bgCol, textCol] = colorClass.split(' ');

          return (
            <div
              key={dept.id}
              className="card p-5 hover:border-slate-300 hover:shadow-lg transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                      {dept.name}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User size={12} className="text-slate-400" />
                      <span>책임자: <strong>{dept.manager}</strong></span>
                    </div>
                  </div>
                  <span className={cn(
                    "text-2xl font-black tracking-tight",
                    dept.progress >= 90 ? "text-emerald-600" :
                    dept.progress >= 75 ? "text-blue-600" :
                    dept.progress >= 50 ? "text-amber-500" : "text-rose-500"
                  )}>
                    {dept.progress}%
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", bgCol)}
                    style={{ width: `${dept.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users size={12} className="text-slate-400" />
                    <span>부서원: <strong>{dept.memberCount}명</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-slate-400" />
                    <span>배정 업무: <strong>{dept.taskCount}건</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 mt-5 pt-3 border-t border-slate-100">
                <Link
                  href="/departments/members"
                  className="flex-1 text-center py-2 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 rounded-md transition-colors border border-slate-200"
                >
                  부서원 설정
                </Link>
                <Link
                  href="/departments/tasks"
                  className="flex-1 text-center py-2 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 rounded-md transition-colors"
                >
                  인증 업무 분장
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* 부서원 설정 퀵 안내 링크 카드 */}
      <div className="bg-slate-900 rounded-xl p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-lg">
            <Users size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm">부서원 권한 부여 및 업무 할당을 완료하셨나요?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              각 부서원의 역할(관리자, 실무자 등)을 구성하고 업무 분장 현황을 실시간으로 업데이트하세요.
            </p>
          </div>
        </div>
        <Link
          href="/departments/members"
          className="flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors text-xs font-semibold py-2 px-3 rounded-lg text-white"
        >
          바로가기
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* 부서 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 size={18} className="text-blue-600" />
                새 부서 등록
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                닫기
              </button>
            </div>

            <form onSubmit={handleAddDept} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">부서명</label>
                <input
                  type="text"
                  required
                  placeholder="예: 감염관리부, 원무과, 진료지원실"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">책임자 이름/직함</label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동 과장"
                  value={newDeptManager}
                  onChange={(e) => setNewDeptManager(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
