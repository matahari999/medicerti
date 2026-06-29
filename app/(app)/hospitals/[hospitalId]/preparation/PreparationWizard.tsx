'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ArrowRight, ArrowLeft, RefreshCw, ExternalLink, ClipboardList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const CYCLES = [
  { value: 1, label: '1차 인증', desc: '최초 인증 신청 기관' },
  { value: 2, label: '2차 인증', desc: '1회차 인증 유지 기관' },
  { value: 3, label: '3차 인증', desc: '2회 이상 유지 기관' },
]

const HOSPITAL_TYPES = [
  { value: 'nursing_hospital', label: '요양병원', desc: '의료법 제3조의 요양병원' },
  { value: 'acute_care', label: '급성기 병원', desc: '종합병원·병원·의원 (급성기)' },
  { value: 'psychiatric', label: '정신병원', desc: '정신건강증진시설' },
  { value: 'dental', label: '치과병원', desc: '치과병원·의원' },
  { value: 'korean_medicine', label: '한방병원', desc: '한방병원·의원' },
  { value: 'rehabilitation', label: '재활병원', desc: '재활의료기관' },
]

interface ChecklistItem {
  phase: number
  category: string
  task: string
  details: string
  link?: string
  estimatedWeeks: number
}

const PHASES = [
  { id: 1, label: '1단계: 기본 준비', icon: '01' },
  { id: 2, label: '2단계: 문서 준비', icon: '02' },
  { id: 3, label: '3단계: 자체 점검', icon: '03' },
  { id: 4, label: '4단계: 현장 대비', icon: '04' },
  { id: 5, label: '5단계: 최종 점검', icon: '05' },
]

function getChecklist(cycle: number, type: string): ChecklistItem[] {
  const items: ChecklistItem[] = [
    { phase: 1, category: '팀 구성', task: '인증 전담팀(TFT) 구성', details: '의료질평가팀, 각 부서장, QA 담당자 포함', estimatedWeeks: 1 },
    { phase: 1, category: '팀 구성', task: '인증 업무 분장 및 일정 수립', details: '부서별 담당자 지정, 주간 단위 실행 계획', estimatedWeeks: 1 },
    { phase: 1, category: '팀 구성', task: '인증 관련 교육 실시', details: '전 직원 대상 인증 기준 교육', link: '/education', estimatedWeeks: 2 },
    { phase: 1, category: '기준 분석', task: '인증 기준서 검토 및 분석', details: '해당 병원 유형별 조사항목 파악', link: '/standards', estimatedWeeks: 2 },
    { phase: 1, category: '기준 분석', task: '갭(Gap) 분석 실시', details: '현재 상태 대비 부족 항목 식별', link: '/self-assessment', estimatedWeeks: 3 },
    { phase: 2, category: '규정 정비', task: '진료매뉴얼 검토 및 개정', details: '최신 의료법·건강보험 기준 반영', estimatedWeeks: 4 },
    { phase: 2, category: '규정 정비', task: '감염관리 규정 정비', details: '감염관리위원회, 표준주의지침, 손위생', estimatedWeeks: 4 },
    { phase: 2, category: '규정 정비', task: '환자안전 규정 정비', details: '환자확인, 낙상예방, 투약오류 예방', estimatedWeeks: 4 },
    { phase: 2, category: '규정 정비', task: '의무기록 관리 규정 정비', details: '기록 작성 및 보존, 전자의무기록', estimatedWeeks: 3 },
    { phase: 2, category: '문서화', task: '부서별 업무 매뉴얼 작성/개정', details: '간호·약제·영양·검사 등 각 부서', estimatedWeeks: 4 },
    { phase: 2, category: '문서화', task: '각종 대장 및 점검표 정비', details: '법정 대장, 소독 점검표, 장비 점검표', estimatedWeeks: 3 },
    { phase: 2, category: '문서화', task: '직원 교육 기록 체계화', details: '신규교육, 보수교육, 직무교육 기록', estimatedWeeks: 2 },
    { phase: 3, category: '자가 점검', task: '자가 갭분석 항목별 충족도 평가', details: 'ME 항목 우선 점검, S/P/O 유형별 확인', link: '/self-assessment', estimatedWeeks: 2 },
    { phase: 3, category: '자가 점검', task: '라운딩/모의조사 실시', details: '월 1회 정기 라운딩, 분기별 모의조사', link: '/rounding', estimatedWeeks: 4 },
    { phase: 3, category: '자가 점검', task: '미흡 항목 개선 계획 수립', details: '우선순위 기반 개선 과제 할당', estimatedWeeks: 4 },
    { phase: 3, category: '자가 점검', task: '개선 과제 이행 및 추적', details: '주간 점검 회의, 진행률 모니터링', estimatedWeeks: 8 },
    { phase: 4, category: '현장 대비', task: '조사위원 면접 대비', details: '주요 질문 목록 숙지, 모의 면접 실시', estimatedWeeks: 2 },
    { phase: 4, category: '현장 대비', task: '시설 환경 점검', details: '소방, 감염관리, 환자안전 시설 점검', estimatedWeeks: 2 },
    { phase: 4, category: '현장 대비', task: '참관자 교육', details: '조사위원 동선, 질의응답 요령 교육', estimatedWeeks: 1 },
    { phase: 4, category: '현장 대비', task: '현장 제출 자료 준비', details: '증빙 문서 바인더, 발표자료 준비', estimatedWeeks: 2 },
    { phase: 5, category: '최종 점검', task: '전체 준비 상태 최종 점검', details: 'KPI 대시보드로 핵심 지표 확인', link: '/kpi', estimatedWeeks: 1 },
    { phase: 5, category: '최종 점검', task: '보고서 및 증빙 자료 최종 검토', details: '모든 보고서 출력, 간사 회의', link: '/reports', estimatedWeeks: 1 },
    { phase: 5, category: '최종 점검', task: '현장 조사 대비 모의 훈련', details: '전체 워크스루, 타임라인 점검', estimatedWeeks: 1 },
    { phase: 5, category: '최종 점검', task: '직원 인지도 확인', details: '모든 직원 인증 기준 인지 확인', link: '/acknowledgments', estimatedWeeks: 1 },
  ]

  if (cycle >= 2) {
    items.push(
      { phase: 1, category: '사전 검토', task: '이전 인증 결과 검토', details: '이전 조사 지적사항 및 개선 이행 확인', estimatedWeeks: 1 },
      { phase: 1, category: '사전 검토', task: '주기적 평가 항목 확인', details: '인증 유지 조건 충족 여부 확인', estimatedWeeks: 1 },
    )
  }

  if (['psychiatric', 'dental', 'korean_medicine', 'rehabilitation'].includes(type)) {
    items.push(
      { phase: 2, category: '특화 기준', task: `${HOSPITAL_TYPES.find(t => t.value === type)?.label} 특화 기준 확인`, details: '해당 유형에만 적용되는 추가 조사항목 반영', link: '/standards', estimatedWeeks: 2 },
    )
  }

  return items.sort((a, b) => a.phase - b.phase)
}

const totalWeeks = (items: ChecklistItem[]) => {
  const phases = [...new Set(items.map(i => i.phase))]
  return phases.reduce((sum, p) => {
    return sum + Math.max(...items.filter(i => i.phase === p).map(i => i.estimatedWeeks))
  }, 0)
}

export default function PreparationWizard({
  hospitalId, hospitalName, currentCycle, hospitalType,
}: {
  hospitalId: string
  hospitalName: string
  currentCycle: number | null
  hospitalType: string
}) {
  const [step, setStep] = useState<'intro' | 'cycle' | 'type' | 'result'>('intro')
  const [selectedCycle, setSelectedCycle] = useState(currentCycle ?? 1)
  const [selectedType, setSelectedType] = useState(hospitalType)
  const [completed, setCompleted] = useState<string[]>([])

  const checklist: (ChecklistItem & { id: string })[] = getChecklist(selectedCycle, selectedType).map((item, idx) => ({ ...item, id: `item_${idx}` }))
  const phases = [...new Set(checklist.map(i => i.phase))]
  const weekEstimate = totalWeeks(checklist)

  const toggleItem = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const phaseProgress = (phaseId: number) => {
    const phaseItems = checklist.filter(i => i.phase === phaseId)
    const done = phaseItems.filter(i => completed.includes(i.id)).length
    return phaseItems.length > 0 ? Math.round((done / phaseItems.length) * 100) : 0
  }

  if (step === 'intro') {
    return (
      <div className="bg-white border rounded-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto">
          <ClipboardList className="w-8 h-8 text-brand-600" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h2 className="text-xl font-bold">인증 준비 위자드</h2>
          <p className="text-sm text-muted-foreground">
            인증 주기와 병원 유형에 맞춰 맞춤형 체크리스트를 생성합니다.<br />
            단계별로 진행 상황을 추적하고 필요한 문서를 준비하세요.
          </p>
        </div>
        <Button size="lg" onClick={() => setStep('cycle')}>
          시작하기 <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    )
  }

  if (step === 'cycle') {
    return (
      <div className="bg-white border rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <span>인증 주기 선택</span>
        </div>
        <p className="text-sm text-muted-foreground">
          해당하는 인증 주기를 선택하세요
        </p>
        <div className="grid gap-3">
          {CYCLES.map((c) => (
            <button
              key={c.value}
              onClick={() => { setSelectedCycle(c.value); setStep('type') }}
              className={cn(
                'text-left p-4 border rounded-xl transition-all hover:border-brand-400 hover:bg-brand-50/30',
                selectedCycle === c.value && 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
                  selectedCycle === c.value ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                )}>
                  {c.value}차
                </div>
                <div>
                  <p className="font-semibold">{c.label}</p>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep('intro')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> 이전
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'type') {
    return (
      <div className="bg-white border rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
          <span className="text-muted-foreground">인증 주기 선택 완료</span>
          <span className="text-muted-foreground mx-1">→</span>
          <span className="w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <span>병원 유형 선택</span>
        </div>
        <p className="text-sm text-muted-foreground">
          병원의 유형을 선택하세요
        </p>
        <div className="grid gap-3">
          {HOSPITAL_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setSelectedType(t.value); setStep('result') }}
              className={cn(
                'text-left p-4 border rounded-xl transition-all hover:border-brand-400 hover:bg-brand-50/30',
                selectedType === t.value && 'border-brand-500 bg-brand-50 ring-1 ring-brand-500'
              )}
            >
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{t.label}</p>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setStep('cycle')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> 이전
          </Button>
        </div>
      </div>
    )
  }

  // Result step
  const totalDone = completed.length
  const totalItems = checklist.length
  const overallProgress = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <Badge variant="outline">✓ 인증 주기: {selectedCycle}차</Badge>
          <Badge variant="outline">{HOSPITAL_TYPES.find(t => t.value === selectedType)?.label}</Badge>
          <Badge variant="outline">예상 소요: 약 {weekEstimate}주</Badge>
        </div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">전체 진행률</h2>
          <span className={cn('text-lg font-bold', overallProgress === 100 ? 'text-green-600' : 'text-brand-600')}>
            {overallProgress}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {totalDone}/{totalItems}개 완료
        </p>
      </div>

      {/* Phase sections */}
      <div className="space-y-4">
        {PHASES.filter(p => phases.includes(p.id)).map((phase) => {
          const items = checklist.filter(i => i.phase === phase.id)
          const progress = phaseProgress(phase.id)
          return (
            <div key={phase.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    {phase.icon}
                  </span>
                  <div>
                    <h3 className="font-semibold">{phase.label}</h3>
                    <p className="text-xs text-muted-foreground">{items.length}개 항목</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                </div>
              </div>
              <div className="divide-y">
                {items.map((item) => {
                  const done = completed.includes(item.id)
                  return (
                    <div key={item.id} className={cn('flex items-start gap-3 p-3', done && 'bg-green-50/30')}>
                      <button onClick={() => toggleItem(item.id)} className="mt-0.5 shrink-0">
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 hover:text-brand-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm font-medium', done && 'line-through text-gray-400')}>
                            {item.task}
                          </p>
                          <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">예상 {item.estimatedWeeks}주</Badge>
                          {item.link && (
                            <a
                              href={item.link}
                              className="text-xs text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="w-3 h-3" /> 바로가기
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reset button */}
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={() => setCompleted([])}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> 전체 초기화
        </Button>
        <Button variant="ghost" onClick={() => setStep('intro')}>
          위자드 다시 시작
        </Button>
      </div>
    </div>
  )
}
