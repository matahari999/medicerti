import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentType, CertificationStatus } from '@/types';

// SHA-256 해시 함수 (Web Crypto API 및 Node.js fallback 적용)
async function sha256(message: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Node.js SSR 환경 대응
    try {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(message).digest('hex');
    } catch (e) {
      return message; // 최악의 경우 raw 반환 방어
    }
  }
  
  // 브라우저 표준 Web Crypto API 환경
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error('Web Crypto API 해시 실패:', e);
    return message;
  }
}


export interface ApprovalStep {
  role: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string | null;
}

export interface DocumentApproval {
  id: string;
  title: string;
  type: DocumentType;
  typeName: string;
  dept: string;
  requester: string;
  date: string;
  content: string;
  status: 'in_progress' | 'rejected' | 'completed';
  statusLabel: string;
  rejectReason?: string;
  steps: ApprovalStep[];
  version: string;
  formats: string[];
}

interface DocumentStore {
  pendingList: DocumentApproval[];
  sentList: DocumentApproval[];
  completedList: DocumentApproval[];
  
  // 관리자 권한 관련
  isAdminUnlocked: boolean;
  adminPassword: string;
  unlockAdmin: (password: string) => Promise<boolean>;
  lockAdmin: () => void;
  changeAdminPassword: (oldPass: string, newPass: string) => Promise<boolean>;
  
  // 신규 기안/상신 등록
  submitForApproval: (doc: {
    title: string;
    type: DocumentType;
    typeName: string;
    dept: string;
    requester: string;
    content: string;
    steps: { role: string; name: string }[];
  }) => void;
  
  // 승인 처리
  approveDocument: (docId: string, approverName: string) => void;
  
  // 반려 처리
  rejectDocument: (docId: string, rejectReason: string, rejecterName: string) => void;
}

// 초기 데이터
const initialPending: DocumentApproval[] = [
  {
    id: 'APP-2026-004',
    title: '손위생 모니터링 월간 대장 및 피드백 서식',
    type: 'form',
    typeName: '서식',
    dept: '간호부',
    requester: '이감염 간호사',
    date: '2026-06-15',
    status: 'in_progress',
    statusLabel: '검토 중',
    version: 'v1.0',
    formats: ['pdf', 'docx'],
    content: `[개요]
본 서식은 병동 내 손위생 수행률을 월별로 측정하고, 부서별 피드백을 제공하여 감염병 전파를 차단하기 위한 서식임.

[개정 이력]
- 손위생 시점 5가지(5 Moments) 관찰 세부 체크사항 추가
- 손위생 미준수 직원에 대한 시정 지시서 피드백 링크 추가

[주요 기록 내용]
1. 관찰 대상자 직종 (의사, 간호사, 조무사, 의료기사 등)
2. 손위생 수행 시점 및 수행 여부 (물과 비누, 알코올 젤)
3. 부서별 분기 피드백 현황`,
    steps: [
      { role: '기안자', name: '이감염 간호사', status: 'approved', date: '06-15 09:00' },
      { role: '1차 검토자', name: '최간호 부장', status: 'pending', date: null },
      { role: '최종 승인자', name: '병원장', status: 'pending', date: null },
    ],
  },
  {
    id: 'APP-2026-005',
    title: '낙상 예방 프로그램 운영 지침서 개정안 (v2.1)',
    type: 'guideline',
    typeName: '지침서',
    dept: 'QPS/감염관리실',
    requester: '박안전 담당자',
    date: '2026-06-14',
    status: 'in_progress',
    statusLabel: '검토 중',
    version: 'v2.1',
    formats: ['pdf', 'docx', 'hwp'],
    content: `[개요]
낙상 고위험군 환자 사정 및 예방 조치 프로세스를 명확히 하여 환자 안전사고를 미연에 방지하기 위한 지침 개정안임.

[핵심 개정사항]
- 입원 시 모든 환자 대상 MFS(Morse Fall Scale) 점수 측정 의무화
- 45점 이상 고위험 환자에 대해 적색 식별 밴드 및 낙상 주의 표식 부착 프로세스 표준화
- 낙상 예방 전동 침대 안전 가드 상시 체결 의무 및 교육 강화
- 낙상 사고 발생 시 24시간 내 QPS실 보고 절차 명문화`,
    steps: [
      { role: '기안자', name: '박안전 담당자', status: 'approved', date: '06-14 11:30' },
      { role: '1차 검토자', name: '김QPS 실장', status: 'pending', date: null },
      { role: '최종 승인자', name: '병원장', status: 'pending', date: null },
    ],
  },
];

const initialSent: DocumentApproval[] = [
  {
    id: 'APP-2026-002',
    title: '고위험의약품 보관 및 시건장치 관리 지침',
    type: 'regulation',
    typeName: '규정집',
    dept: '약제부',
    requester: '김약사 실장',
    date: '2026-06-11',
    status: 'in_progress',
    statusLabel: '검토 중',
    version: 'v2.0',
    formats: ['pdf', 'docx', 'hwp'],
    content: `[개요]\n고위험의약품(인슐린, 항응고제, 농축전해질 등)의 원내 보관, 조제, 투약 시 사고를 방지하기 위해 보관 공간의 라벨링 및 시건 장치 이행 여부를 철저히 규정한다.`,
    steps: [
      { role: '기안자', name: '김약사 실장', status: 'approved', date: '06-11 10:00' },
      { role: '1차 검토자', name: '이의사 부장', status: 'approved', date: '06-12 14:00' },
      { role: '최종 승인자', name: '병원장', status: 'pending', date: null },
    ],
  },
  {
    id: 'APP-2026-003',
    title: '화재 안전 사고 예방 및 대응 계획서',
    type: 'guideline',
    typeName: '지침서',
    dept: '행정부',
    requester: '박행정 부장',
    date: '2026-06-13',
    status: 'in_progress',
    statusLabel: '검토 중',
    version: 'v1.0',
    formats: ['pdf'],
    content: `[개요]\n화재 발생 시 거동 불편 요양 환자의 피난 안전 및 화재 전파 차단을 위해 방화문, 소방 기구 모니터링 절차와 비상 모의 훈련 주기를 1년에 2회로 강화한다.`,
    steps: [
      { role: '기안자', name: '박행정 부장', status: 'approved', date: '06-13 09:30' },
      { role: '1차 검토자', name: '안전보건관찰관', status: 'pending', date: null },
      { role: '최종 승인자', name: '병원장', status: 'pending', date: null },
    ],
  },
  {
    id: 'APP-2026-006',
    title: '신체억제대 사용 동의서 서식 변경 건',
    type: 'form',
    typeName: '서식',
    dept: '간호부',
    requester: '최간호 부장',
    date: '2026-06-08',
    status: 'rejected',
    statusLabel: '반려',
    rejectReason: '신체억제대 사용 목적에 보건복지부 고시 제2026-12호에 따른 세부 적응증 구분이 누락되었습니다. 법적 조항 확인 후 수정 재상신 바랍니다.',
    version: 'v1.1',
    formats: ['docx'],
    content: `[개요]\n입원 환자 신체억제대 사용 시 인권 침해 소지를 없애기 위해 복지부 최신 동의서 표준 문구를 준용하는 변경 신청 건임.`,
    steps: [
      { role: '기안자', name: '최간호 부장', status: 'approved', date: '06-08 11:20' },
      { role: '1차 검토자', name: '김QPS 실장', status: 'rejected', date: '06-09 15:30' },
      { role: '최종 승인자', name: '병원장', status: 'pending', date: null },
    ],
  },
  ...initialPending,
];

const initialCompleted: DocumentApproval[] = [
  {
    id: 'APP-2026-001',
    title: '2026년도 환자안전 사고 관리 규정집',
    type: 'regulation',
    typeName: '규정집',
    dept: 'QPS/감염관리실',
    requester: '김QPS 실장',
    date: '2026-06-01',
    status: 'completed',
    statusLabel: '완료',
    version: 'v3.0',
    formats: ['pdf', 'docx'],
    content: `[개요]\n원내 모든 위해사건(낙상, 투약, 환자 유실 등)에 대한 보고서 작성 주기, 적정성 평가를 통제하고 질 개선 활동 지표를 추적하는 종합 안전관리 강령이다.`,
    steps: [
      { role: '기안자', name: '김QPS 실장', status: 'approved', date: '06-01 09:00' },
      { role: '1차 검토자', name: '이의사 부장', status: 'approved', date: '06-03 14:00' },
      { role: '최종 승인자', name: '병원장', status: 'approved', date: '06-05 10:00' },
    ],
  },
  {
    id: 'APP-2025-089',
    title: '소외 안전 구역 대피로 지도 및 비상 지침서',
    type: 'guideline',
    typeName: '지침서',
    dept: '행정부',
    requester: '박행정 부장',
    date: '2025-12-10',
    status: 'completed',
    statusLabel: '완료',
    version: 'v1.4',
    formats: ['pdf'],
    content: `[개요]\n화재/지진 발생 대처 요령 및 원내 특별 피난 지도를 담은 행정 지침서.`,
    steps: [
      { role: '기안자', name: '박행정 부장', status: 'approved', date: '12-10 10:00' },
      { role: '최종 승인자', name: '원무부장', status: 'approved', date: '12-15 11:00' },
    ],
  },
];

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      pendingList: initialPending,
      sentList: initialSent,
      completedList: initialCompleted,
      
      // 관리자 잠금 정보 (SHA-256 해시화 저장)
      isAdminUnlocked: false,
      adminPassword: '29d810aaba7f726e043a32f852c9882802b630430a7f48e21f9371675e8d7a06', // '101621'의 SHA-256 해시값
      
      unlockAdmin: async (password) => {
        const hash = await sha256(password);
        if (hash === get().adminPassword) {
          set({ isAdminUnlocked: true });
          return true;
        }
        return false;
      },
      
      lockAdmin: () => {
        set({ isAdminUnlocked: false });
      },
      
      changeAdminPassword: async (oldPass, newPass) => {
        const oldHash = await sha256(oldPass);
        if (oldHash === get().adminPassword) {
          const newHash = await sha256(newPass);
          set({ adminPassword: newHash });
          return true;
        }
        return false;
      },

      
      submitForApproval: (doc) => 
        set((state) => {
          const docId = `APP-2026-${String(state.sentList.length + 100).padStart(3, '0')}`;
          const nowStr = new Date().toISOString().split('T')[0];
          const newDoc: DocumentApproval = {
            id: docId,
            title: doc.title,
            type: doc.type,
            typeName: doc.typeName,
            dept: doc.dept,
            requester: doc.requester,
            date: nowStr,
            content: doc.content,
            status: 'in_progress',
            statusLabel: '검토 중',
            version: 'v1.0',
            formats: ['pdf', 'docx'],
            steps: [
              { role: '기안자', name: doc.requester, status: 'approved', date: nowStr.substring(5) + ' 09:00' },
              ...doc.steps.map((s) => ({
                role: s.role,
                name: s.name,
                status: 'pending' as const,
                date: null,
              })),
            ],
          };
          
          return {
            sentList: [newDoc, ...state.sentList],
            pendingList: [newDoc, ...state.pendingList],
          };
        }),
        
      approveDocument: (docId, approverName) => 
        set((state) => {
          const nextPending = state.pendingList.filter((d) => d.id !== docId);
          
          let approvedDoc: DocumentApproval | null = null;
          const nextSent = state.sentList.map((d) => {
            if (d.id === docId) {
              const updatedSteps = d.steps.map((step) => {
                if (step.status === 'pending') {
                  return {
                    ...step,
                    status: 'approved' as const,
                    date: new Date().toISOString().substring(5, 10) + ' ' + new Date().toTimeString().substring(0, 5),
                  };
                }
                return step;
              });
              
              const allApproved = updatedSteps.every((step) => step.status === 'approved');
              const status = allApproved ? ('completed' as const) : ('in_progress' as const);
              const statusLabel = allApproved ? '완료' : '검토 중';
              
              approvedDoc = {
                ...d,
                steps: updatedSteps,
                status,
                statusLabel,
              };
              return approvedDoc;
            }
            return d;
          });
          
          const nextCompleted = [...state.completedList];
          if (approvedDoc && (approvedDoc as DocumentApproval).status === 'completed') {
            nextCompleted.unshift(approvedDoc);
          } else if (approvedDoc) {
            nextPending.unshift(approvedDoc);
          }
          
          return {
            pendingList: nextPending,
            sentList: nextSent,
            completedList: nextCompleted,
          };
        }),
        
      rejectDocument: (docId, rejectReason, rejecterName) => 
        set((state) => {
          const nextPending = state.pendingList.filter((d) => d.id !== docId);
          const nextSent = state.sentList.map((d) => {
            if (d.id === docId) {
              const updatedSteps = d.steps.map((step) => {
                if (step.status === 'pending') {
                  return {
                    ...step,
                    status: 'rejected' as const,
                    date: new Date().toISOString().substring(5, 10) + ' ' + new Date().toTimeString().substring(0, 5),
                  };
                }
                return step;
              });
              
              return {
                ...d,
                status: 'rejected' as const,
                statusLabel: '반려',
                rejectReason,
                steps: updatedSteps,
              };
            }
            return d;
          });
          
          return {
            pendingList: nextPending,
            sentList: nextSent,
          };
        }),
    }),
    {
      name: 'medicerti-document-store',
    }
  )
);
