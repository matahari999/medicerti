import Link from 'next/link'
import { ChevronDown, ShieldCheck, Sparkles, BadgeCheck } from 'lucide-react'

const treeData = [
  { depth: 0, label: '인증 영역', width: 'w-full', color: 'bg-[#0d9488]' },
  { depth: 1, label: '장', width: 'w-4/5', color: 'bg-[#14b8a6]' },
  { depth: 2, label: '기준', width: 'w-3/5', color: 'bg-[#2dd4bf]' },
  { depth: 3, label: '범주', width: 'w-2/5', color: 'bg-[#5eead4]' },
  { depth: 4, label: '조사항목', width: 'w-1/3', color: 'bg-[#99f6e4]' },
]

const statusMock = [
  { label: '충족', color: 'bg-emerald-400' },
  { label: '부분충족', color: 'bg-amber-400' },
  { label: '미충족', color: 'bg-rose-400' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-sidebar pt-20">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />

      {/* Grain texture for editorial depth */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      {/* Decorative glows */}
      <div className="absolute top-1/4 -left-32 w-[480px] h-[480px] bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-[480px] h-[480px] bg-navy-500/25 rounded-full blur-3xl" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[300px] bg-teal-400/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.06] border border-teal-400/25 rounded-full text-sm text-teal-300 font-medium backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              의료기관인증 갭 분석 플랫폼
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.15] text-balance tracking-tight">
              인증 기준,
              <br />
              <span className="bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400 bg-clip-text text-transparent">서류 더미</span>에서
              <br />꺼내는 순간
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-lg">
              요양병원 4주기 인증 준비,<br />
              AI가 기준 구조를 자동 정리하고<br />
              부족한 항목을 찾아 규정집 초안까지 작성합니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-xl hover:from-[#0d9488] hover:to-[#0f766e] transition-all shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5"
              >
                무료로 시작하기
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-7 py-3.5 text-base font-medium text-slate-200 bg-white/[0.04] border border-white/15 rounded-xl hover:bg-white/[0.08] hover:border-white/25 hover:text-white transition-all backdrop-blur-sm"
              >
                기능 살펴보기
                <ChevronDown className="w-4 h-4 ml-2" />
              </a>
            </div>

            {/* Status legend */}
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="text-slate-400 font-medium">조사항목 상태</span>
              {statusMock.map((s) => (
                <span key={s.label} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: criteria tree visualization */}
          <div className="relative flex items-center justify-center pt-6">
            {/* Glow behind card */}
            <div className="absolute inset-8 bg-teal-500/15 rounded-full blur-3xl" />

            {/* Card + floating decorations share one bounding box so offsets anchor to the card, not the grid column */}
            <div className="relative w-full max-w-md">
              {/* Floating AI chip — offset enough to clear the card entirely, no text overlap */}
              <div
                className="hidden sm:flex absolute -left-8 -top-12 z-20 items-center gap-2 px-3.5 py-2 bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-xl shadow-elevated animate-float"
                style={{ '--float-rotate': '-2deg', animationDelay: '0.4s' } as React.CSSProperties}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span className="text-xs font-medium text-slate-200 whitespace-nowrap">AI 자동 갭분석</span>
              </div>

              {/* Certification seal badge — dips only into the card's outer padding, never the text */}
              <div
                className="absolute -top-10 -right-6 sm:-right-8 z-20 animate-float"
                style={{ '--float-rotate': '6deg', animationDelay: '1.1s' } as React.CSSProperties}
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(20,184,166,0.4)]">
                    <defs>
                      <linearGradient id="sealGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#0d9488" />
                      </linearGradient>
                    </defs>
                    {/* Scalloped seal edge */}
                    <path
                      d="M50 2 L58 8 L67 5 L72 13 L82 13 L84 23 L93 27 L91 37 L98 44 L92 52 L96 61 L87 65 L86 75 L76 76 L71 85 L61 82 L53 89 L46 82 L36 85 L31 76 L21 75 L20 65 L11 61 L15 52 L9 44 L16 37 L14 27 L23 23 L25 13 L35 13 L40 5 L49 8 Z"
                      fill="url(#sealGrad)"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="1"
                    />
                    <circle cx="50" cy="48" r="30" fill="rgba(255,255,255,0.12)" />
                    <path
                      d="M38 48 L46 56 L63 39"
                      fill="none"
                      stroke="white"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="50" y="80" textAnchor="middle" fontSize="8" fontWeight="700" fill="white" opacity="0.85">
                      인증완료
                    </text>
                  </svg>
                </div>
              </div>

              <div className="relative space-y-4 p-8 bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/10 shadow-elevated">
                {/* Card header */}
                <div className="flex items-center gap-2 pb-1">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-semibold text-slate-300 tracking-wide">인증 기준 구조 분석</span>
                  <span className="ml-auto flex items-center gap-1.5 text-[10px] text-teal-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    LIVE
                  </span>
                </div>

                {/* Tree steps */}
                {treeData.map((item) => (
                  <div key={item.depth} className="flex items-center gap-4">
                    <div className={`h-3 ${item.width} rounded-full ${item.color} transition-all duration-500 shadow-[0_0_12px_rgba(20,184,166,0.25)]`} />
                    <span className="text-xs font-medium text-slate-400 shrink-0">{item.label}</span>
                  </div>
                ))}

                {/* Divider with arrow */}
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <ChevronDown className="w-4 h-4 text-teal-400" />
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Survey items Mock */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">조사항목 예시</p>
                  {[
                    { code: 'ME 1.1', title: '손위생 수행률 모니터링', status: '충족', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                    { code: 'ME 2.2', title: '낙상 위험도 평가 도구 적용', status: '부분충족', color: 'text-amber-400', dot: 'bg-amber-400' },
                    { code: 'ME 3.1', title: '구두처방 안전 관리 절차', status: '미충족', color: 'text-rose-400', dot: 'bg-rose-400' },
                    { code: 'QPS 1.1', title: '질 향상 활동 연간 계획', status: '미충족', color: 'text-rose-400', dot: 'bg-rose-400' },
                  ].map((item) => (
                    <div key={item.code} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.04] border border-white/[0.05]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                        <span className="text-xs font-mono text-slate-500">{item.code}</span>
                        <span className="text-sm text-slate-200">{item.title}</span>
                      </div>
                      <span className={`text-xs font-semibold ${item.color}`}>{item.status}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom stat chip */}
                <div className="flex items-center gap-2 pt-1 -mb-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[11px] text-slate-400">247개 조사항목 · 5단계 구조 자동 정리 완료</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to light sections */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white/95 pointer-events-none" />
    </section>
  )
}
