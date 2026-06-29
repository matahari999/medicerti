import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

const treeData = [
  { depth: 0, label: '인증 영역', width: 'w-full', color: 'bg-[#0d9488]' },
  { depth: 1, label: '장', width: 'w-4/5', color: 'bg-[#14b8a6]' },
  { depth: 2, label: '기준', width: 'w-3/5', color: 'bg-[#2dd4bf]' },
  { depth: 3, label: '범주', width: 'w-2/5', color: 'bg-[#5eead4]' },
  { depth: 4, label: '조사항목', width: 'w-1/3', color: 'bg-[#99f6e4]' },
]

const statusMock = [
  { label: '충족', color: 'bg-green-500' },
  { label: '부분충족', color: 'bg-amber-500' },
  { label: '미충족', color: 'bg-red-500' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-white via-[#f0fdfa]/40 to-white pt-20">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0d9488]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#14b8a6]/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f0fdfa] border border-[#99f6e4] rounded-full text-sm text-[#0d9488] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0d9488] animate-pulse" />
              의료기관인증 갭 분석 플랫폼
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance">
              인증 기준,
              <br />
              <span className="text-[#0d9488]">서류 더미</span>에서
              <br />꺼내는 순간
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg">
              요양병원 4주기 인증 준비,<br />
              AI가 기준 구조를 자동 정리하고<br />
              부족한 항목을 찾아 규정집 초안까지 작성합니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-[#0d9488] rounded-xl hover:bg-[#0f766e] transition-colors shadow-lg shadow-[#0d9488]/20"
              >
                무료로 시작하기
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-900 transition-all"
              >
                기능 살펴보기
                <ChevronDown className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Status legend */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="text-gray-500 font-medium">조사항목 상태</span>
              {statusMock.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: criteria tree visualization */}
          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-md space-y-4 p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl">
              {/* Tree steps */}
              {treeData.map((item) => (
                <div key={item.depth} className="flex items-center gap-4">
                  <div className={`h-3 ${item.width} rounded-full ${item.color} transition-all duration-500 opacity-90`} />
                  <span className="text-xs font-medium text-gray-500 shrink-0">{item.label}</span>
                </div>
              ))}

              {/* Divider with arrow */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <ChevronDown className="w-4 h-4 text-[#0d9488]" />
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Survey items Mock */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">조사항목 예시</p>
                {[
                  { code: 'ME 1.1', title: '손위생 수행률 모니터링', status: '충족', color: 'text-green-600', dot: 'bg-green-500' },
                  { code: 'ME 2.2', title: '낙상 위험도 평가 도구 적용', status: '부분충족', color: 'text-amber-600', dot: 'bg-amber-500' },
                  { code: 'ME 3.1', title: '구두처방 안전 관리 절차', status: '미충족', color: 'text-red-600', dot: 'bg-red-500' },
                  { code: 'QPS 1.1', title: '질 향상 활동 연간 계획', status: '미충족', color: 'text-red-600', dot: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.code} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-gray-50/80">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                      <span className="text-xs font-mono text-gray-400">{item.code}</span>
                      <span className="text-sm text-gray-800">{item.title}</span>
                    </div>
                    <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
