'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: '요양병원만 사용할 수 있나요?',
    a: '아닙니다. 요양병원뿐 아니라 급성기 병원, 정신병원, 치과병원, 한방병원, 재활병원 등 6개 의료기관 종별 인증 기준을 모두 지원합니다. 회원가입 시 병원 종류를 선택하면 해당 유형에 맞는 기준 구조로 초기화됩니다.',
  },
  {
    q: '다른 의료기관 종별(예: 정신병원) 인증도 지원하나요?',
    a: '네. 각 의료기관 종별로 서로 다른 인증 기준을 별도로 관리합니다. 예를 들어 정신병원은 정신건강증진시설 인증 기준이, 요양병원은 요양병원 인증 기준이 각각 적용됩니다. 병원 등록 시 선택한 종별에 따라 기준 구조가 자동 분기됩니다.',
  },
  {
    q: '기존에 만들어둔 규정집을 가져올 수 있나요?',
    a: '네. 관리 문서 기능을 통해 기존 규정/지침/서식을 업로드하거나 직접 작성할 수 있습니다. AI 생성 초안을 관리 문서로 가져와서 수정/보완하는 것도 가능합니다.',
  },
  {
    q: '인증 기준 업데이트는 어떻게 반영되나요?',
    a: '의료기관평가인증원의 기준 개정이 있을 때 데이터베이스가 업데이트됩니다. 기준 변경 시 대시보드에 알림이 표시되며, 영향받는 조사항목을 자동으로 식별해드립니다.',
  },
  {
    q: '데이터 보안은 어떻게 보장되나요?',
    a: '모든 데이터는 SSL 암호화 전송되며, Supabase(PostgreSQL)에 저장됩니다. 병원별 데이터는 완전히 격리되어 다른 병원의 데이터를 볼 수 없습니다. 자세한 내용은 별도 문의 바랍니다.',
  },
  {
    q: '무료 체험 이후 결제는 어떻게 하나요?',
    a: '14일 무료 체험 기간 동안 모든 기능을 제한 없이 사용할 수 있습니다. 체험 종료 후 원하는 플랜을 선택하여 결제하면 계속 사용 가능합니다. 현재 가격은 추후 공개 예정입니다.',
  },
]

export function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(0)

  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            자주 묻는 질문
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenId(openId === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50/50 transition-colors"
              >
                {faq.q}
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    openId === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openId === i ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
