import { Shield, BookOpen, Building2, RefreshCw } from 'lucide-react'

const points = [
  {
    icon: Shield,
    title: '4주기 인증 기준 기반',
    desc: '의료기관평가인증원의 최신 4주기 기준 구조를 그대로 반영했습니다. 영역(PS/PC/GL/QS) — 장 — 기준 — 범주 — 조사항목의 5단계 계층을 따릅니다.',
  },
  {
    icon: Building2,
    title: '6개 병원 종별 대응',
    desc: '요양병원, 급성기 병원, 정신병원, 치과병원, 한방병원, 재활병원 각각의 인증 기준을 종별로 분기하여 제공합니다.',
  },
  {
    icon: RefreshCw,
    title: '조사항목 S/P/O 분류',
    desc: '모든 조사항목을 구조(Structure)·과정(Process)·결과(Outcome)로 구분하고 ME(필수)/권장을 명시하여 정확한 평가가 가능합니다.',
  },
  {
    icon: BookOpen,
    title: '의료법·건강보험 기준 연동',
    desc: '단순 인증 기준 나열이 아니라, 실제 의료 현장에서 적용해야 할 법정 기준 및 건강보험 심사 기준과의 연관성을 함께 고려합니다.',
  },
]

export function TrustSection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            설계 철학 —{' '}
            <span className="text-[#0d9488]">왜 이 구조인가</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            AccrediQ는 실제 의료기관 인증 심사 경험과 의료법 체계를 기반으로 설계되었습니다
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {points.map((p) => (
            <div key={p.title} className="flex gap-4">
              <div className="w-10 h-10 bg-[#f0fdfa] rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <p.icon className="w-5 h-5 text-[#0d9488]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
