import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: '스타터',
    desc: '소규모 요양병원 / 개인',
    price: '[가격 미정 — 추후 입력]',
    period: '/월',
    features: [
      '병원 1개 등록',
      '인증 기준 구조화',
      '기본 갭 분석',
      'AI 규정집 생성 (월 10회)',
    ],
    cta: '무료로 시작하기',
    href: '/register',
    popular: false,
  },
  {
    name: '프로',
    desc: '중규모 병원 / 인증 전담팀',
    price: '[가격 미정 — 추후 입력]',
    period: '/월',
    features: [
      '병원 최대 3개',
      '모든 기능 무제한',
      '자가 갭분석 + 우선순위',
      '라운딩/모의조사 추적',
      '직원 인지 확인 로그',
      'KPI 대시보드',
      'PDF 보고서 출력',
    ],
    cta: '무료로 시작하기',
    href: '/register',
    popular: true,
  },
  {
    name: '엔터프라이즈',
    desc: '병원그룹 / 컨설팅 기관',
    price: '[가격 미정 — 추후 입력]',
    period: '/월',
    features: [
      '병원 무제한',
      '모든 프로 기능 포함',
      '멀티병원 비교 대시보드',
      '교차 인증기준 매핑',
      '맞춤형 온보딩 지원',
      '전담 CSM 배정',
      'SLA 보장',
    ],
    cta: '문의하기',
    href: '/register',
    popular: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            병원 규모에 맞는
            <br />
            <span className="text-[#0d9488]">가격 플랜</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            모든 플랜 14일 무료 체험 — 신용카드 필요 없음
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border p-6 lg:p-8 flex flex-col ${
                plan.popular
                  ? 'border-[#0d9488] shadow-xl shadow-[#0d9488]/10 ring-1 ring-[#0d9488] scale-[1.02] lg:scale-105'
                  : 'border-gray-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0d9488] text-white text-xs font-semibold rounded-full">
                  가장 많이 선택
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-400">{plan.price}</div>
                <div className="text-xs text-gray-400 mt-0.5">{plan.period}</div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#0d9488] mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 px-6 rounded-xl text-sm font-semibold transition-all ${
                  plan.popular
                    ? 'bg-[#0d9488] text-white hover:bg-[#0f766e] shadow-lg shadow-[#0d9488]/20'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
