import { FileText, Layers, Users, TrendingUp } from 'lucide-react'
import { Reveal } from './Reveal'

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
    <section className="font-nanum relative py-24 lg:py-32 bg-[#0a1830] overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-jalnan text-2xl sm:text-3xl font-bold text-white leading-snug">
            왜 요양병원 인증 준비가
            <br />
            <span className="text-teal-300">어려운가요?</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            매 달 반복되는 서류 작업과 누락된 증빙이 인증 준비를 더 힘들게 만듭니다
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p, i) => (
            <Reveal key={p.title} delay={i * 90}>
              <div className="group relative h-full bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-elevated hover:bg-white/[0.07] hover:border-teal-400/30 hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 bg-white/[0.06] rounded-xl flex items-center justify-center mb-4 ring-1 ring-teal-400/20 group-hover:from-[#14b8a6] group-hover:to-[#0d9488] group-hover:bg-gradient-to-br group-hover:ring-0 group-hover:shadow-lg group-hover:shadow-teal-500/30 transition-all duration-300">
                  <p.icon className="w-5 h-5 text-teal-300 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
