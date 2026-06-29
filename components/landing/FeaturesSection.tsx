const features = [
  {
    id: 'structure',
    title: '인증 기준 자동 구조화',
    desc: '5단계 계층(영역→장→기준→범주→조사항목)을 자동으로 정리하고 병원 종별(요양·급성기·정신·치과·한방)에 맞게 분기합니다. 검색으로 원하는 기준을 즉시 찾을 수 있습니다.',
    gradient: 'from-[#0d9488] to-[#14b8a6]',
    mockup: (
      <div className="space-y-2 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        {[
          { depth: 0, label: '환자안전 영역 (PS)', color: 'text-[#0d9488] border-l-[#0d9488]' },
          { depth: 1, label: 'PS 1. 감염관리', color: 'text-gray-700 border-l-[#14b8a6]' },
          { depth: 2, label: 'PS 1.1 손위생 관리 기준', color: 'text-gray-600 border-l-[#2dd4bf]' },
          { depth: 3, label: 'ME 1.1.1 손위생 수행률 모니터링', color: 'text-gray-500 border-l-[#5eead4]' },
        ].map((item) => (
          <div key={item.depth} className="flex items-center gap-2" style={{ paddingLeft: `${item.depth * 20 + 12}px` }}>
            <div className={`w-0.5 h-4 ${item.color.split(' ')[1]}`} />
            <span className={`text-xs ${item.color.split(' ')[0]}`}>{item.label}</span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
          <span className="px-2 py-0.5 rounded bg-[#f0fdfa] text-[#0d9488]">요양병원</span>
          <span>|</span>
          <span className="text-gray-300">총 247개 조사항목</span>
        </div>
      </div>
    ),
  },
  {
    id: 'ai-docs',
    title: 'AI 규정 문서 자동 생성',
    desc: '갭 분석에서 부적합/부분적합 판정된 항목에 대해 Gemini AI가 정책 초안을 즉시 작성합니다. 담당 부서, 주기, 기록 방법까지 포함된 실무 문서가 생성되며 관리 문서로 바로 가져올 수 있습니다.',
    gradient: 'from-[#2563eb] to-[#3b82f6]',
    mockup: (
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">AI</span>
          </div>
          <span className="text-xs font-medium text-gray-700">생성된 정책 초안</span>
          <span className="ml-auto text-[10px] text-gray-400">v1.0-auto</span>
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-gray-100 rounded" />
          <div className="h-2.5 w-4/5 bg-gray-100 rounded" />
          <div className="h-2.5 w-11/12 bg-gray-100 rounded" />
          <div className="h-2.5 w-3/5 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] text-amber-600 font-medium">● 부분적합</span>
          <button className="text-xs text-blue-600 font-medium hover:underline disabled">관리 문서로 가져오기</button>
        </div>
      </div>
    ),
  },
  {
    id: 'self-assessment',
    title: '자가 갭분석 체크리스트',
    desc: '각 조사항목별로 충족/부분충족/미충족/미검토를 직접 평가하고, 심각도·PS 도메인·의무 여부 기반 가중치로 자동 산정된 우선순위를 확인하세요. 가장 시급한 항목부터 개선을 시작할 수 있습니다.',
    gradient: 'from-[#059669] to-[#10b981]',
    mockup: (
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
        {[
          { code: 'ME 1.1', title: '손위생 수행률 모니터링', status: '충족', color: 'text-green-600', bg: 'bg-green-50' },
          { code: 'ME 2.2', title: '낙상 위험도 평가', status: '부분충족', color: 'text-amber-600', bg: 'bg-amber-50' },
          { code: 'ME 3.1', title: '구두처방 안전 관리', status: '미충족', color: 'text-red-600', bg: 'bg-red-50' },
        ].map((item) => (
          <div key={item.code} className={`flex items-center justify-between px-3 py-2 rounded-lg ${item.bg}`}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-400">{item.code}</span>
              <span className="text-sm text-gray-800">{item.title}</span>
            </div>
            <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1 text-xs text-gray-400 border-t border-gray-50 mt-1">
          <span>우선순위 점수: <span className="text-red-600 font-bold">87</span> / 100</span>
          <span>전체 진행률: 34%</span>
        </div>
      </div>
    ),
  },
  {
    id: 'rounding',
    title: '모의조사·라운딩 추적',
    desc: '월 1회 정기 라운딩 점수를 카테고리별로 기록하고 시간에 따른 추세를 꺾은선 그래프로 확인하세요. 손위생·서명누락·낙상률 등 핵심 지표도 자동 집계됩니다.',
    gradient: 'from-[#7c3aed] to-[#8b5cf6]',
    mockup: (
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Mini recharts-like chart */}
        <svg viewBox="0 0 200 60" className="w-full h-16 mb-3">
          <path d="M0,45 Q25,40 40,35 T80,30 T120,38 T160,25 T200,20" fill="none" stroke="#7c3aed" strokeWidth="2" />
          <path d="M0,50 Q25,48 40,42 T80,38 T120,45 T160,30 T200,35" fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <circle cx="200" cy="20" r="3" fill="#7c3aed" />
          <circle cx="200" cy="35" r="3" fill="#8b5cf6" />
        </svg>
        <div className="flex items-center justify-between text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#7c3aed]" /> 전체 점수</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#8b5cf6]" /> 환자안전</span>
          <span className="text-gray-600 font-medium">94.2점 ↗</span>
        </div>
      </div>
    ),
  },
  {
    id: 'acknowledgments',
    title: '직원 교육 이수 로그',
    desc: '누가, 언제, 어떤 규정을 확인했는지 전자 증빙으로 남깁니다. 부서별 미확인 인원을 한눈에 파악하고 정기 재확인 리마인더를 설정할 수 있습니다.',
    gradient: 'from-[#d97706] to-[#f59e0b]',
    mockup: (
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-50">
          <span className="font-medium text-gray-700">부서별 인지 현황</span>
          <span className="text-gray-400">8월 3주차</span>
        </div>
        {[
          { dept: '간호부', done: '95%', color: 'text-green-600' },
          { dept: '약제부', done: '82%', color: 'text-amber-600' },
          { dept: '행정부', done: '60%', color: 'text-red-600' },
        ].map((d) => (
          <div key={d.dept} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-12">{d.dept}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${d.color.replace('text-', 'bg-')}`}
                style={{ width: d.done }}
              />
            </div>
            <span className={`text-xs font-medium ${d.color}`}>{d.done}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'kpi',
    title: '핵심지표 통합 대시보드',
    desc: '갭분석 점수, 라운딩 추세, 인지 확인 현황, 문서 완결률 등 조사위원이 가장 많이 묻는 핵심 지표를 한 화면에 모아 보여줍니다. 엑셀 없이 시스템에서 바로 추출 가능합니다.',
    gradient: 'from-[#dc2626] to-[#ef4444]',
    mockup: (
      <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: '인증준비도', value: '72', unit: '점', color: 'text-amber-600' },
            { label: '라운딩', value: '94', unit: '점', color: 'text-green-600' },
            { label: '인지율', value: '84', unit: '%', color: 'text-blue-600' },
          ].map((k) => (
            <div key={k.label} className="text-center p-2 rounded-lg bg-gray-50">
              <div className={`text-lg font-bold ${k.color}`}>{k.value}<span className="text-xs font-normal">{k.unit}</span></div>
              <div className="text-[10px] text-gray-400">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] text-gray-400 pt-2 border-t border-gray-50">
          <span>PDF 출력</span>
          <span>·</span>
          <span>추세 1개월</span>
        </div>
      </div>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            하나의 플랫폼에서
            <br />
            <span className="text-[#0d9488]">인증 준비 전 과정</span>을
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            기준 분석부터 갭 평가, 문서 생성, 직원 증빙까지 — 엑셀과 이메일을 벗어나세요
          </p>
        </div>

        <div className="space-y-20 lg:space-y-28">
          {features.map((f, i) => (
            <div
              key={f.id}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 items-center`}
            >
              {/* Text */}
              <div className="flex-1 space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${f.gradient} text-white text-xs font-semibold`}>
                  <span className="text-white/70">0{i + 1}</span>
                  <span>Feature</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{f.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">{f.desc}</p>
              </div>

              {/* Mockup */}
              <div className="flex-1 w-full max-w-md">
                <div className="relative">
                  {/* Decorative bg */}
                  <div className={`absolute -inset-4 bg-gradient-to-r ${f.gradient} opacity-5 rounded-3xl blur-xl`} />
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg">
                    {f.mockup}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
