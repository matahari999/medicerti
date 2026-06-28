'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Building2,
  Mail,
  Check,
  X,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { USER_ROLE_LABELS } from '@/types';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { AdminGate } from '@/components/features/AdminGate';

// 부서원 Mock 데이터
const initialMembers = [
  {
    id: 'user-01',
    name: '김실무자',
    email: 'silmu@hospital.com',
    department: '간호부',
    role: 'staff' as UserRole,
    status: 'active',
    lastActive: '2026-06-16 10:45',
  },
  {
    id: 'user-02',
    name: '최간호 부장',
    email: 'head_nurse@hospital.com',
    department: '간호부',
    role: 'department_manager' as UserRole,
    status: 'active',
    lastActive: '2026-06-16 11:10',
  },
  {
    id: 'user-03',
    name: '박행정 부장',
    email: 'admin_mgr@hospital.com',
    department: '행정부',
    role: 'department_manager' as UserRole,
    status: 'active',
    lastActive: '2026-06-16 09:20',
  },
  {
    id: 'user-04',
    name: '이의사 원장',
    email: 'director@hospital.com',
    department: '진료부',
    role: 'hospital_admin' as UserRole,
    status: 'active',
    lastActive: '2026-06-15 17:30',
  },
  {
    id: 'user-05',
    name: '김약사 실장',
    email: 'pharmacy@hospital.com',
    department: '약제부',
    role: 'department_manager' as UserRole,
    status: 'active',
    lastActive: '2026-06-16 08:50',
  },
  {
    id: 'user-06',
    name: '박안전 담당자',
    email: 'safety@hospital.com',
    department: 'QPS/감염관리실',
    role: 'staff' as UserRole,
    status: 'active',
    lastActive: '2026-06-16 11:15',
  },
  {
    id: 'user-07',
    name: '최컨설트 교수',
    email: 'consultant@med.com',
    department: '외래지원',
    role: 'consultant' as UserRole,
    status: 'active',
    lastActive: '2026-06-14 14:25',
  },
  {
    id: 'user-08',
    name: '이지원 인턴',
    email: 'viewer_intern@hospital.com',
    department: '행정부',
    role: 'viewer' as UserRole,
    status: 'inactive',
    lastActive: '2026-05-30 18:00',
  },
];

const departmentsList = ['전체 부서', 'QPS/감염관리실', '간호부', '행정부', '약제부', '진료부', '외래지원'];
const rolesList: { value: UserRole; label: string }[] = [
  { value: 'hospital_admin', label: '병원 관리자' },
  { value: 'department_manager', label: '부서 책임자' },
  { value: 'staff', label: '일반 직원' },
  { value: 'consultant', label: '외부 컨설턴트' },
  { value: 'viewer', label: '단순 열람자' },
];

export default function MembersPage() {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('전체 부서');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('간호부');
  const [newUserRole, setNewUserRole] = useState<UserRole>('staff');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setMembers(
      members.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );
    showToast(`권한이 ${USER_ROLE_LABELS[newRole]}(으)로 업데이트되었습니다.`);
  };

  const handleDeptChange = (userId: string, newDept: string) => {
    setMembers(
      members.map((m) => (m.id === userId ? { ...m, department: newDept } : m))
    );
    showToast(`부서가 ${newDept}(으)로 변경되었습니다.`);
  };

  const handleStatusToggle = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setMembers(
      members.map((m) => (m.id === userId ? { ...m, status: nextStatus } : m))
    );
    showToast(`계정 상태가 ${nextStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const newMember = {
      id: `user-0${members.length + 1}`,
      name: newUserName,
      email: newUserEmail,
      department: newUserDept,
      role: newUserRole,
      status: 'active',
      lastActive: '미접속',
    };

    setMembers([...members, newMember]);
    setNewUserName('');
    setNewUserEmail('');
    setShowInviteModal(false);
    showToast(`${newUserName} 님이 성공적으로 등록되었습니다.`);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.includes(searchQuery) || member.email.includes(searchQuery);
    const matchesDept =
      selectedDept === '전체 부서' || member.department === selectedDept;
    const matchesRole =
      selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesDept && matchesRole;
  });

  return (
    <AdminGate>
      <div className="space-y-5 fade-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              부서원 및 권한 설정
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              병원 내 각 부서별 사용자 현황을 조회하고, 의료기관 평가인증 권한(RBAC)을 부여합니다.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3.5 py-2 transition-all shadow-sm cursor-pointer"
          >
            <UserPlus size={14} />
            사용자 추가 및 초대
          </button>
        </div>

        {/* 필터 툴바 */}
        <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="이름 또는 이메일 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
              <Building2 size={13} className="text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
              <Shield size={13} className="text-slate-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              >
                <option value="all">전체 권한</option>
                {rolesList.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 테이블 목록 */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="min-w-[120px]">이름</th>
                  <th>이메일</th>
                  <th>담당 부서</th>
                  <th className="min-w-[150px]">인증 관리 권한 (RBAC)</th>
                  <th>상태</th>
                  <th>최종 활동</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className={cn(member.status === 'inactive' ? 'opacity-60 bg-slate-50/50' : '')}>
                      <td>
                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {member.name.charAt(0)}
                          </div>
                          {member.name}
                        </div>
                      </td>
                      <td>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          {member.email}
                        </span>
                      </td>
                      <td>
                        <select
                          value={member.department}
                          onChange={(e) => handleDeptChange(member.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {departmentsList.slice(1).map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as UserRole)}
                          className={cn(
                            "text-xs border border-slate-200 rounded px-2 py-1 font-medium bg-white focus:outline-none focus:ring-1 focus:ring-blue-500",
                            member.role === 'hospital_admin' ? 'text-indigo-700 font-bold border-indigo-200 bg-indigo-50/30' :
                            member.role === 'department_manager' ? 'text-blue-700 font-bold border-blue-200 bg-blue-50/30' : ''
                          )}
                        >
                          {rolesList.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className={cn(
                          "badge text-xs",
                          member.status === 'active' ? 'badge-success' : 'badge-default'
                        )}>
                          {member.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">{member.lastActive}</td>
                      <td>
                        <button
                          onClick={() => handleStatusToggle(member.id, member.status)}
                          className={cn(
                            "text-xs font-semibold px-2 py-1 border rounded transition-colors cursor-pointer",
                            member.status === 'active'
                              ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          )}
                        >
                          {member.status === 'active' ? '비활성화' : '활성화'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      검색 결과 또는 필터에 부합하는 부서원이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 권한 안내 박스 */}
        <div className="card p-4 bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
            <Shield size={14} className="text-blue-600" />
            의료기관평가인증 역할 기반 권한 통제 (RBAC) 안내
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-500 leading-relaxed">
            <div className="p-2.5 bg-white rounded border border-slate-100">
              <span className="font-bold text-indigo-700 block">병원 관리자 (Hospital Admin)</span>
              부서 신설, 병원 전체의 인증 D-day 및 진행 현황 확인, 모든 문서의 승인/공표 가능.
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-100">
              <span className="font-bold text-blue-700 block">부서 책임자 (Dept Manager)</span>
              담당 부서 부서원 지정, 배정된 하위 체크리스트 문항 담당자 설정 및 문서 상신 가능.
            </div>
            <div className="p-2.5 bg-white rounded border border-slate-100">
              <span className="font-bold text-slate-700 block">일반 직원 (Staff) / 컨설턴트</span>
              자신에게 할당된 체크리스트 진행(미완료 → 진행중 → 완료) 및 증빙 문서 임시 작성 가능.
            </div>
          </div>
        </div>

        {/* 사용자 추가 모달 */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <UserPlus size={18} className="text-blue-600" />
                  사용자 초대 및 권한 부여
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  닫기
                </button>
              </div>

              <form onSubmit={handleInviteUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">이름</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 홍길동"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">이메일</label>
                  <input
                    type="email"
                    required
                    placeholder="example@hospital.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">부서</label>
                    <select
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {departmentsList.slice(1).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">부여 권한</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {rolesList.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-2 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-2 transition-colors"
                  >
                    초대장 전송
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 성공 토스트 알림 */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 z-50">
            <Check size={14} className="text-emerald-500" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </AdminGate>
  );
}
