import MediLogo from '@/components/MediLogo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-sidebar overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div
        className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-teal-500/10 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-navy-500/20 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md px-4 py-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4 drop-shadow-[0_4px_16px_rgba(20,184,166,0.4)]">
            <MediLogo size={52} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white tracking-tight">메디인증</h1>
          <p className="text-sm text-slate-400 mt-1.5">의료기관 인증 문서 자동화 플랫폼</p>
        </div>
        {children}
        <p className="text-center text-[11px] text-slate-500 mt-8">
          © {new Date().getFullYear()} Medicerti. 의료기관인증 준비의 새로운 기준.
        </p>
      </div>
    </div>
  )
}
