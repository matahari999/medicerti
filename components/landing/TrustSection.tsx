import { Shield, BookOpen, Building2, RefreshCw, BadgeCheck } from 'lucide-react'
import { Reveal } from './Reveal'

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

const badges = [
  { stat: '4주기', label: '인증기준 100% 반영' },
  { stat: '247개', label: '조사항목 자동 구조화' },
  { stat: '6개', label: '병원 종별 지원' },
  { stat: '원문 기반', label: '실제 규정집 근거 생성' },
]

function SealIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="badgeSealGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <path
        d="M50 2 L58 8 L67 5 L72 13 L82 13 L84 23 L93 27 L91 37 L98 44 L92 52 L96 61 L87 65 L86 75 L76 76 L71 85 L61 82 L53 89 L46 82 L36 85 L31 76 L21 75 L20 65 L11 61 L15 52 L9 44 L16 37 L14 27 L23 23 L25 13 L35 13 L40 5 L49 8 Z"
        fill="url(#badgeSealGrad)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />
      <circle cx="50" cy="48" r="30" fill="rgba(255,255,255,0.14)" />
    </svg>
  )
}

export function TrustSection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            설계 철학 —{' '}
            <span className="text-[#0d9488]">왜 이 구조인가</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            메디인증은 실제 의료기관 인증 심사 경험과 의료법 체계를 기반으로 설계되었습니다
          </p>
        </Reveal>

        {/* 신뢰 배지 */}
        <Reveal className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {badges.map((b) => (
              <div
                key={b.label}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-gradient-to-b from-[#f0fdfa] to-white border border-[#99f6e4]/50 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative w-12 h-12 drop-shadow-[0_4px_10px_rgba(13,148,136,0.35)]">
                  <SealIcon />
                  <BadgeCheck className="absolute inset-0 m-auto w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 tracking-tight">{b.stat}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-snug">{b.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 90} className="flex gap-4 p-5 rounded-2xl hover:bg-[#f0fdfa]/50 transition-colors duration-300">
              <div className="w-11 h-11 bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1] rounded-xl flex items-center justify-center shrink-0 mt-0.5 ring-1 ring-[#99f6e4]/40">
                <p.icon className="w-5 h-5 text-[#0d9488]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
