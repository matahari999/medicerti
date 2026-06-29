import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: '교육 이수증' }

export default async function CertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; title?: string; date?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const params = await searchParams
  const employeeName = params.name ?? profile?.full_name ?? '홍길동'
  const courseTitle = params.title ?? '인증 기준 교육'
  const completeDate = params.date ?? new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl mx-auto">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div className="no-print flex justify-end mb-4">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1.5" />
          PDF 출력
        </Button>
      </div>

      <div className="bg-white border-2 border-brand-600 rounded-2xl p-10 text-center relative overflow-hidden">
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-brand-600" />
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-brand-600" />

        <div className="space-y-8 py-8">
          <p className="text-sm text-muted-foreground tracking-widest uppercase">Certificate of Completion</p>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">교 육 이 수 증</h1>
            <div className="w-20 h-0.5 bg-brand-600 mx-auto" />
          </div>

          <p className="text-base text-muted-foreground">위 사람은 다음과 같이 교육을 이수하였음을 증명합니다</p>

          <div className="space-y-4 text-lg max-w-md mx-auto">
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">성 명</span>
              <span className="font-bold">{employeeName}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">교 육 명</span>
              <span className="font-bold">{courseTitle}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-muted-foreground">교육 일자</span>
              <span className="font-bold">{new Date(completeDate).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-muted-foreground">발급 기관</span>
              <span className="font-bold">AccrediQ</span>
            </div>
          </div>

          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              본 이수증은 인증 준비 교육 과정을 이수하였음을 증명합니다.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-6 py-2 bg-brand-50 rounded-lg border border-brand-200">
              <span className="text-brand-600 font-semibold">AccrediQ</span>
              <span className="text-brand-400">|</span>
              <span className="text-sm text-muted-foreground">의료기관 인증 갭 분석 플랫폼</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
