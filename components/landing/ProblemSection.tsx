import { FileText, Layers, Users, TrendingUp } from 'lucide-react'

const problems = [
  {
    icon: Layers,
    title: '기준 구조가 복잡합니다',
    desc: '4개 영역 — 15개 장 — 40여 개 기준 — 하위 범주 — 수백 개 조사항목으로 이어지는 5단계 구조를 일일이 파악하기 어렵습니다.',
  },
  {
    icon: FileText,
    title: '문서만 준비하면 현장에서 탈락합니다',
    desc: '규정집을 아무리 잘 만들어도 라운딩 기록, 교육 증빙, 직원 인지 확인이 없으면 현장조사에서 지적을 받습니다.',
  },
  {
    icon: Users,
    title: '직원 교육 증빙이 누락됩니다',
    desc: '누가, 언제, 어떤 규정을 확인했는지 증빙하지 못하면 인증 항목 미충족 처리됩니다.',
  },
  {
    icon: TrendingUp,
    title: '라운딩 결과를 엑셀로 관리합니다',
    desc: '월별 라운딩 점수, 부서별 트렌드, 개선 과제 추적을 엑셀과 이메일로 하다 보면 데이터가 분산됩니다.',
  },
]

export function ProblemSection() {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            왜 요양병원 인증 준비가
            <br />
            <span className="text-[#0d9488]">어려운가요?</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            매 달 반복되는 서류 작업과 누락된 증빙이 인증 준비를 더 힘들게 만듭니다
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p) => (
            <div
              key={p.title}
              className="group relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg hover:border-[#99f6e4] transition-all duration-300"
            >
              <div className="w-11 h-11 bg-[#f0fdfa] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0d9488] transition-colors duration-300">
                <p.icon className="w-5 h-5 text-[#0d9488] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
