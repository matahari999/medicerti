'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  FileText,
  Plus,
  Send,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  Users,
  Activity,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/documentStore';
import { ProgressCharacterBar } from '@/components/ui/ProgressCharacterBar';
import { createClient } from '@/lib/supabase/client';

// 월별 위해사건 추이 (최근 6개월) 기본 Mock
const monthlyIncidentData = [
  { month: '1월', 낙상: 3, 투약: 1, 라인발거: 2, 기타: 0 },
  { month: '2월', 낙상: 2, 투약: 0, 라인발거: 1, 기타: 1 },
  { month: '3월', 낙상: 4, 투약: 2, 라인발거: 3, 기타: 0 },
  { month: '4월', 낙상: 1, 투약: 1, 라인발거: 1, 기타: 2 },
  { month: '5월', 낙상: 3, 투약: 0, 라인발거: 0, 기타: 1 },
  { month: '6월', 낙상: 2, 투약: 1, 라인발거: 1, 기타: 0 },
];

// 사건 유형별 분포 비율 기본 Mock
const incidentTypeData = [
  { name: '낙상 사고', value: 15, color: '#3b82f6' }, // Blue
  { name: '투약 오류', value: 5, color: '#f59e0b' },  // Amber
  { name: '라인/튜브 발거', value: 8, color: '#10b981' }, // Emerald
  { name: '오식/식사 오류', value: 2, color: '#8b5cf6' },  // Purple
  { name: '기타 사건', value: 4, color: '#64748b' },  // Slate
];

// 위해 등급 현황 목록 기본 Mock
const harmGrades = [
  { grade: '근접오류 (Near Miss)', count: 18, desc: '환자에게 처방이나 투약 전 오류를 발견하여 다행히 해가 가지 않은 사건', color: 'text-blue-500 bg-blue-50 border-blue-100' },
  { grade: '잠재적 유해사건 (No Harm)', count: 9, desc: '오류가 환자에게 도달했으나, 신체적/정신적 피해가 발생하지 않은 사건', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  { grade: '유해사건 (Adverse Event)', count: 5, desc: '환자에게 도달하여 일시적인 상해나 가벼운 후유증을 유발한 사건', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { grade: '적신호사건 (Sentinel Event)', count: 0, desc: '환자에게 심각한 영구적 장애, 사망 등 중대한 위해를 끼친 심각한 사건', color: 'text-rose-600 bg-rose-50 border-rose-200 font-bold' },
];

export default function ReportsPage() {
  const { submitForApproval } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<'trends' | 'form'>('trends');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // DB 연동 데이터 상태
  const [monthlyData, setMonthlyData] = useState(monthlyIncidentData);
  const [typeData, setTypeData] = useState(incidentTypeData);
  const [gradeData, setGradeData] = useState(harmGrades);
  const [reportsCount, setReportsCount] = useState(32); // 기본 연간 누적 건수
  const [monthlyCount, setMonthlyCount] = useState(4); // 기본 당월 건수
  const [majorFactor, setMajorFactor] = useState('낙상 사고 (46.8%)');
  
  const [session, setSession] = useState<any>(null);
  const [hospitalInfo, setHospitalInfo] = useState<{ id: string; name: string } | null>(null);

  // 폼 입력 상태
  const [incidentType, setIncidentType] = useState('낙상');
  const [harmGrade, setHarmGrade] = useState('잠재적 유해사건');
  const [incidentDate, setIncidentDate] = useState('');
  const [ward, setWard] = useState('3병동 (요양병동)');
  const [patientInfo, setPatientInfo] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  useEffect(() => {
    async function loadIncidentData() {
      setLoading(true);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

      if (!isMockMode) {
        try {
          const supabase = createClient();
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            setSession(currentSession);
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('hospital_id, hospitals(name)')
              .eq('id', currentSession.user.id)
              .single();

            if (profile && profile.hospital_id) {
              setHospitalInfo({
                id: profile.hospital_id,
                name: (profile.hospitals as { name?: string } | null)?.name ?? '우리병원',
              });

              // incident_reports 테이블에서 데이터 load
              const { data: reports, error } = await supabase
                .from('incident_reports')
                .select('*')
                .eq('hospital_id', profile.hospital_id)
                .order('incident_date', { ascending: true });

              if (reports && reports.length > 0) {
                processIncidents(reports);
              }
            }
          }
        } catch (err) {
          console.error('위해사건 데이터 로드 실패:', err);
        }
      }
      setLoading(false);
    }

    loadIncidentData();
  }, []);

  const processIncidents = (reports: any[]) => {
    // 1. 월별 데이터 집계 (최근 6개월)
    const months: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${d.getMonth() + 1}월`,
      });
    }

    const newMonthlyData = months.map((m) => {
      const monthReports = reports.filter((r) => r.incident_date.startsWith(m.key));
      const counts: Record<string, number> = { 낙상: 0, 투약: 0, 라인발거: 0, 기타: 0 };
      monthReports.forEach((r) => {
        const type = r.incident_type;
        if (type.includes('낙상')) counts['낙상']++;
        else if (type.includes('투약')) counts['투약']++;
        else if (type.includes('라인/튜브 발거') || type.includes('라인발거')) counts['라인발거']++;
        else counts['기타']++;
      });
      return {
        month: m.label,
        낙상: counts['낙상'],
        투약: counts['투약'],
        라인발거: counts['라인발거'],
        기타: counts['기타'],
      };
    });
    setMonthlyData(newMonthlyData);

    // 2. 유형별 비율 집계
    const typeCountMap: Record<string, number> = {
      '낙상 사고': 0,
      '투약 오류': 0,
      '라인/튜브 발거': 0,
      '오식/식사 오류': 0,
      '기타 사건': 0,
    };
    
    reports.forEach((r) => {
      const type = r.incident_type;
      if (type.includes('낙상')) typeCountMap['낙상 사고']++;
      else if (type.includes('투약')) typeCountMap['투약 오류']++;
      else if (type.includes('라인/튜브 발거')) typeCountMap['라인/튜브 발거']++;
      else if (type.includes('오식/식사 오류') || type.includes('오식')) typeCountMap['오식/식사 오류']++;
      else typeCountMap['기타 사건']++;
    });

    const newTypeData = [
      { name: '낙상 사고', value: typeCountMap['낙상 사고'], color: '#3b82f6' },
      { name: '투약 오류', value: typeCountMap['투약 오류'], color: '#f59e0b' },
      { name: '라인/튜브 발거', value: typeCountMap['라인/튜브 발거'], color: '#10b981' },
      { name: '오식/식사 오류', value: typeCountMap['오식/식사 오류'], color: '#8b5cf6' },
      { name: '기타 사건', value: typeCountMap['기타 사건'], color: '#64748b' },
    ];
    setTypeData(newTypeData);

    // 주요 요주의 요인 텍스트 결정
    let maxType = '낙상 사고';
    let maxVal = typeCountMap['낙상 사고'];
    Object.entries(typeCountMap).forEach(([k, v]) => {
      if (v > maxVal) {
        maxVal = v;
        maxType = k;
      }
    });
    const percent = reports.length > 0 ? ((maxVal / reports.length) * 100).toFixed(1) : '0';
    setMajorFactor(`${maxType} (${percent}%)`);

    // 3. 위해 등급 집계
    const newGradeData = harmGrades.map((hg) => {
      const matchName = hg.grade.split(' ')[0];
      const count = reports.filter((r) => r.harm_grade.includes(matchName)).length;
      return { ...hg, count };
    });
    setGradeData(newGradeData);

    // 4. 건수 정보 업데이트
    setReportsCount(reports.length);

    // 당월 건수 구하기
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthCount = reports.filter((r) => r.incident_date.startsWith(thisMonthKey)).length;
    setMonthlyCount(thisMonthCount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    const documentContent = `[위해사건(환자안전사고) 발생 보고서]

1. 사건 개요
- 사건 종류: ${incidentType}
- 위해 등급: ${harmGrade}
- 발생 일시: ${incidentDate || '확인 필요'}
- 발생 부서/병동: ${ward}
- 환자 정보: ${patientInfo || '미기재'}

2. 사건 구체적 경위
${description || '경위 내용 없음.'}

3. 발견 당시 즉각 조치 사항
${actionTaken || '즉각 조치 사항 없음.'}

4. 향후 재발 방지 대책
가. 사건 관련 지표 모니터링 강화 및 현장 간호단위 재교육 실시.
나. 위해 노출 위험 부위(낙상 벨트, 사이드레일 등) 수시 라운딩 점검 의무화.
다. 격주 단위 간호 인계 시 본 사건 경위 전파 및 교육.`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMockMode = !supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-supabase-url');

    if (!isMockMode && session && hospitalInfo) {
      try {
        const supabase = createClient();
        const { error } = await supabase.from('incident_reports').insert([
          {
            hospital_id: hospitalInfo.id,
            user_id: session.user.id,
            incident_type: incidentType,
            harm_grade: harmGrade,
            incident_date: incidentDate.split('T')[0], // yyyy-MM-dd
            ward,
            patient_info: patientInfo || null,
            description,
            action_taken: actionTaken || null,
          },
        ]);

        if (error) {
          console.error('위해사건 DB 삽입 오류:', error);
        } else {
          // 데이터 리로드
          const { data: reports } = await supabase
            .from('incident_reports')
            .select('*')
            .eq('hospital_id', hospitalInfo.id)
            .order('incident_date', { ascending: true });
          
          if (reports) {
            processIncidents(reports);
          }
        }
      } catch (err) {
        console.error('위해사건 DB 삽입 실패:', err);
      }
    }

    setTimeout(() => {
      submitForApproval({
        title: `[환자안전보고] ${incidentType} 위해사건 보고서 (${ward})`,
        type: 'guideline',
        typeName: '보고서',
        dept: 'QPS/감염관리실',
        requester: '김실무자',
        content: documentContent,
        steps: [
          { role: '1차 검토자', name: '김QPS 실장' },
          { role: '최종 승인자', name: '최간호 부장' },
        ],
      });
      setIsSubmitting(false);
      setSuccessMsg('위해사건 보고서가 결재함에 정상적으로 기안되었습니다. (결재 관리에서 확인 가능)');
      
      // 폼 클리어
      setIncidentDate('');
      setPatientInfo('');
      setDescription('');
      setActionTaken('');

      setTimeout(() => setSuccessMsg(''), 5000);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm text-slate-500">위해사건 통계 데이터를 집계하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <AlertTriangle size={20} className="text-rose-500" />
            리스크 리포트 (환자안전보고)
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            원내 위해사건(낙상, 투약, 라인발거 등) 통계를 시각화하고 환자안전사고 발생 시 보고서 기안 상신을 처리합니다.
          </p>
        </div>
        
        {/* 보고서 작성 탭 스위처 */}
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('trends')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              activeTab === 'trends' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            사건 통계/분석
          </button>
          <button
            onClick={() => setActiveTab('form')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer',
              activeTab === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            위해사건 보고서 작성
          </button>
        </div>
      </div>

      {activeTab === 'trends' && (
        <>
          {/* 현황 수치 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Activity size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">당월 총 위해보고 건수</div>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{monthlyCount}건</div>
                <div className="text-[10px] text-slate-500">당월 수집된 원내 누적 건수</div>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">주요 요주의 요인</div>
                <div className="text-2xl font-bold text-amber-600 mt-0.5">{majorFactor}</div>
                <div className="text-[10px] text-slate-500">집계 기준 가장 발생 비중이 높은 리스크</div>
              </div>
            </div>

            <div className="card p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold uppercase">재발방지 중재 이행률</div>
                <div className="text-2xl font-bold text-emerald-600 mt-0.5">100%</div>
                <div className="text-[10px] text-slate-500">보고된 {reportsCount}건 전체 후속 교육 조치 완료</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 6개월 추이 그래프 */}
            <div className="card p-5 lg:col-span-2 space-y-4 min-w-0">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-blue-600" />
                월별 위해사건(환자안전사고) 발생 추이
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="낙상" name="낙상 사건" fill="#3b82f6" barSize={15} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="라인발거" name="라인/튜브 발거" fill="#10b981" barSize={15} radius={[2, 2, 0, 0]} />
                    <Line dataKey="투약" name="투약 오류" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                    <Line dataKey="기타" name="기타 사건" stroke="#64748b" strokeWidth={1.5} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 분류별 분포 원형 차트 */}
            <div className="card p-5 space-y-4 min-w-0">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
                <BarChart3 size={16} className="text-blue-600" />
                유형별 누적 사고 점유비율
              </h3>
              <div className="h-[200px] w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* 차트 범례 설명 */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {typeData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="truncate">{entry.name} ({entry.value}건)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 위해등급 가이드 목록 */}
          <div className="card p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-rose-500" />
              보건복지부 환자안전법 기준 위해 등급 통계 (연간 누적)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {gradeData.map((g) => (
                <div key={g.grade} className={cn("p-3.5 rounded-xl border flex flex-col justify-between space-y-2", g.color)}>
                  <div>
                    <div className="text-xs font-extrabold">{g.grade}</div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{g.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black">{g.count}건</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 보고서 작성 폼 */}
          <div className="card p-5 lg:col-span-2 space-y-4">
            <h3 className="font-black text-sm text-slate-800 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-600" />
              환자안전사고(위해사건) 보고서 기안 작성
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 사건 종류 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">사건 구분</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="낙상">낙상 사고 (Fall)</option>
                    <option value="투약 오류">투약 오류 (Medication Error)</option>
                    <option value="라인/튜브 발거">임상 튜브/라인 자가 발거 (Self-extubation)</option>
                    <option value="오식/식사 오류">식사 처방/오식 전달 오류</option>
                    <option value="기타 환자안전사고">기타 (폭력, 실종, 장비 오작동 등)</option>
                  </select>
                </div>

                {/* 위해 등급 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">위해 등급 분류</label>
                  <select
                    value={harmGrade}
                    onChange={(e) => setHarmGrade(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="근접오류">근접오류 (Near Miss)</option>
                    <option value="잠재적 유해사건">잠재적 유해사건 (No Harm)</option>
                    <option value="유해사건">유해사건 (Adverse Event - 일시적/경미상해)</option>
                    <option value="적신호사건">적신호사건 (Sentinel Event - 중대/영구적장애)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 발생 일시 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">발생 일시</label>
                  <input
                    type="datetime-local"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* 발생 병동 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">발생 병동</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="1병동 (중환자대기)">1병동 (집중관찰실)</option>
                    <option value="2병동 (치매환동)">2병동 (인지치매병동)</option>
                    <option value="3병동 (요양병동)">3병동 (일반요양병동)</option>
                    <option value="5병동 (재활물리)">5병동 (재활물리치료병동)</option>
                  </select>
                </div>

                {/* 환자 정보 */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">환자 정보 (이름, 연령)</label>
                  <input
                    type="text"
                    value={patientInfo}
                    onChange={(e) => setPatientInfo(e.target.value)}
                    placeholder="예: 홍길동 (남/78세) 또는 익명"
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              {/* 구체적 경위 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">사건의 구체적 경위 (6하원칙)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="예: 오전 03:20경 야간 순찰 중 302호 4번 침상의 환자가 사이드레일을 넘어 바닥으로 미끄러져 앉아 있는 것을 발견함. 발견 당시 환자는 자가 탈거한 기저귀를 쥐고 있었음..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              {/* 발견 당시 조치 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">발견 당시 즉각 중재 조치 사항</label>
                <textarea
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  rows={3}
                  placeholder="예: 환자 즉시 침상 안착 유도 후 V/S 측정(130/80 - 72 - 18 - 36.5). 의식 명료하고 외견상 외상 및 혈종 발견되지 않음. 당직의(이의사 과장) 보고 후 X-ray 촬영 대기 및 2시간 간격 신경학적 관찰 진행..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  required
                />
              </div>

              {/* 제출 */}
              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded-lg px-5 py-2.5 transition-colors cursor-pointer"
                >
                  {isSubmitting ? '기안 등록 중...' : (
                    <>
                      결재 관리 상신
                      <Send size={12} />
                    </>
                  )}
                </button>
              </div>

              {successMsg && (
                <p className="text-xs font-semibold text-emerald-600 mt-2 text-center leading-normal animate-pulse">
                  {successMsg}
                </p>
              )}
            </form>
          </div>

          {/* 환자안전보고서 작성 가이드 */}
          <div className="card p-5 bg-gradient-to-br from-slate-50 to-white flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-blue-600 animate-pulse" />
                환자안전보고 작성 핵심 수칙
              </h3>
              <ul className="text-xs text-slate-600 space-y-3 leading-relaxed list-disc pl-4">
                <li>
                  <strong>신속보고의 의무</strong>: 적신호사건(사망, 영구장애 등)의 경우 사건 발견 즉시 구두 보고 후 <strong>24시간 이내</strong>에 QPS실 보고서를 상신해야 인증 요건을 충족합니다.
                </li>
                <li>
                  <strong>비벌 책임 주의</strong>: 보고서에 기재된 임상적 실수나 에러 사항은 의료기관평가인증 규정에 의거하여 작성자에게 어떠한 인사적 처벌 사유로 사용되지 않습니다.
                </li>
                <li>
                  <strong>객관적 사실 위주 서술</strong>: 추측성 의견이나 인물 간의 갈등 사항은 배제하고 발견 당시 상황과 6하원칙에 맞춘 현상 정보만 간결히 서술합니다.
                </li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="text-[11px] font-bold text-blue-800">💡 QPS 팁</div>
              <p className="text-[10px] text-blue-600 mt-1 leading-normal">
                보고 완료된 리스크 리포트는 자동으로 익명화 처리되어 매월 말 적정성 평가 리스크 관리 지표 및 재발방지 매뉴얼 개정의 통계 데이터로 피드백됩니다.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 위해사건 기안 처리 애니메이션 캐릭터 바 */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-md w-full">
            <ProgressCharacterBar 
              duration={1000}
              label="위해사건 보고서를 안전하게 결재 기안 상신 중입니다..." 
            />
          </div>
        </div>
      )}
    </div>
  );
}
