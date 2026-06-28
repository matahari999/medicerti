'use client';

import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5] text-[#141413]" style={{ fontFamily: 'Lora, Georgia, serif' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        h1, h2, h3, h4, h5, h6, .poppins-text { font-family: 'Poppins', Arial, sans-serif !important; }
      `}} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#e8e6dc]">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#d97757] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#6a9bcc] rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#788c5d] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#b0aea5] text-[#b0aea5] poppins-text text-sm font-semibold tracking-widest uppercase mb-8">
            <Sparkles className="w-4 h-4 text-[#d97757]" />
            차원이 다른 의료기관평가인증 솔루션
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-[1.1] tracking-tight text-[#141413]">
            완벽한 인증 준비,<br />
            <span className="text-[#d97757]">메디인</span>과 함께 시작하세요.
          </h1>
          
          <p className="text-xl md:text-2xl text-[#50504a] leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
            복잡하고 막막한 의료기관평가인증, 더 이상 두려워하지 마세요. 
            최신 기준집에 맞춘 완벽한 문서와 실무 지침을 클릭 몇 번으로 완성해 드립니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/generate" 
              className="poppins-text flex items-center justify-center gap-2 bg-[#141413] text-[#faf9f5] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#d97757] transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
            >
              무료로 문서 생성하기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/standards" 
              className="poppins-text flex items-center justify-center gap-2 bg-transparent text-[#141413] border border-[#141413] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#141413] hover:text-[#faf9f5] transition-all duration-300 w-full sm:w-auto"
            >
              인증 기준 탐색
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 md:px-12 bg-[#141413] text-[#faf9f5]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              왜 메디인증<br />문서센터인가요?
            </h2>
            <p className="text-lg text-[#b0aea5] leading-relaxed mb-8">
              의료기관평가인증은 환자의 안전과 의료의 질을 보장하기 위한 필수적인 과정입니다. 
              하지만 방대한 기준과 끊임없이 변화하는 정책 속에서 실무진의 피로도는 극에 달합니다. 
              메디인은 이러한 실무진의 고충을 깊이 이해하고, 가장 효율적이고 전문적인 방법으로 
              인증의 본질에 다가갈 수 있도록 돕습니다.
            </p>
            <ul className="space-y-4">
              {[
                "수천 페이지의 기준집을 학습한 AI 두뇌",
                "요양, 정신, 재활 등 병원 유형별 맞춤 지침 제공",
                "최신 정책 및 인증 개정안 즉각 반영 (PDCA 등)"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#e8e6dc]">
                  <CheckCircle2 className="w-6 h-6 text-[#788c5d] shrink-0 mt-0.5" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="bg-[#30302b] p-8 rounded-3xl border border-[#40403b] hover:border-[#6a9bcc] transition-colors">
                <ShieldCheck className="w-10 h-10 text-[#6a9bcc] mb-4" />
                <h3 className="text-xl font-bold mb-2">공신력 있는 기준</h3>
                <p className="text-[#b0aea5] text-sm">보건복지부 및 의료기관평가인증원의 공식 지침을 100% 반영합니다.</p>
              </div>
              <div className="bg-[#30302b] p-8 rounded-3xl border border-[#40403b] hover:border-[#d97757] transition-colors">
                <FileText className="w-10 h-10 text-[#d97757] mb-4" />
                <h3 className="text-xl font-bold mb-2">원스톱 패키지</h3>
                <p className="text-[#b0aea5] text-sm">규정집, 서식, 체크리스트, 그리고 직원 교육 자료까지 한 번에 자동 생성합니다.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#788c5d] p-8 rounded-3xl text-[#141413]">
                <h3 className="text-xl font-bold mb-4">"메디인 덕분에 4주기 인증 준비 시간을 80% 이상 단축했습니다."</h3>
                <p className="text-sm font-semibold poppins-text">- A 요양병원 QPS 전담자</p>
              </div>
              <div className="bg-[#30302b] p-8 rounded-3xl border border-[#40403b] hover:border-[#e8e6dc] transition-colors">
                <Sparkles className="w-10 h-10 text-[#e8e6dc] mb-4" />
                <h3 className="text-xl font-bold mb-2">세련된 교육 경험</h3>
                <p className="text-[#b0aea5] text-sm">지루한 서류가 아닌, 팟캐스트 브리핑 형태의 살아있는 교육 영상을 제공합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-24 px-6 md:px-12 bg-[#faf9f5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-[#141413]">세 가지 핵심 가치</h2>
            <p className="text-xl text-[#50504a]">메디인이 제공하는 차별화된 경험</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e8e6dc] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#d97757]/10 flex items-center justify-center mb-6">
                <span className="text-2xl font-black text-[#d97757] poppins-text">01</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#141413]">정확성과 신뢰</h3>
              <p className="text-[#50504a] leading-relaxed">
                사람의 실수를 원천 차단합니다. 
                법적 필수 조항, 감염 관리 지침, 환자 안전 수칙 등 단 하나의 기준도 누락되지 않도록 AI가 교차 검증하여 규정을 작성합니다.
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e8e6dc] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#6a9bcc]/10 flex items-center justify-center mb-6">
                <span className="text-2xl font-black text-[#6a9bcc] poppins-text">02</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#141413]">실무 최적화</h3>
              <p className="text-[#50504a] leading-relaxed">
                단순히 보기 좋은 문서가 아닙니다. 
                PDCA 5단계 성과관리 체계를 강제 적용하여, 실제 조사위원의 질문에 완벽하게 방어할 수 있는 현장 밀착형 지표를 제시합니다.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-[#e8e6dc] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-[#788c5d]/10 flex items-center justify-center mb-6">
                <span className="text-2xl font-black text-[#788c5d] poppins-text">03</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#141413]">아름다운 사용자 경험</h3>
              <p className="text-[#50504a] leading-relaxed">
                최고의 서비스는 디자인에서 완성됩니다. 
                메디인증 문서센터는 쾌적한 인터페이스와 고급스러운 타이포그래피를 통해 인증 준비 과정 자체를 즐거운 경험으로 탈바꿈시킵니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 px-6 md:px-12 bg-[#141413] text-center border-t border-[#30302b]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#faf9f5]">
            병원 인증의 새로운 표준
          </h2>
          <p className="text-xl text-[#b0aea5] mb-12">
            지금 메디인과 함께 가장 스마트한 인증 준비를 경험하세요.
          </p>
          <Link 
            href="/hospitals" 
            className="poppins-text inline-flex items-center justify-center gap-3 bg-[#faf9f5] text-[#141413] px-10 py-5 rounded-full font-bold text-xl hover:bg-[#d97757] hover:text-[#faf9f5] transition-all duration-300"
          >
            병원 유형 선택하기
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
