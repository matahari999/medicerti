import Link from 'next/link';
import { HelpCircle, BookOpen, FileText, ArrowRight, MessageCircle } from 'lucide-react';

const faqs = [
  {
    q: '메디인이 생성한 문서를 바로 사용할 수 있나요?',
    a: '메디인이 생성한 문서는 참고용 초안입니다. 반드시 병원 실정에 맞게 수정하고, 공식 인증기준과 비교·검토 후 사용하시기 바랍니다. 의료기관평가인증원의 공식 자료를 함께 확인하는 것을 권장합니다.',
  },
  {
    q: '어떤 병원 유형을 지원하나요?',
    a: '상급종합병원, 종합병원, 병원, 요양병원, 정신병원, 재활의료기관, 치과병원, 한방병원 등 11개 유형을 지원합니다. 각 유형별 공식 인증기준집 목차를 반영합니다.',
  },
  {
    q: 'API 키는 어떻게 설정하나요?',
    a: 'Vercel 프로젝트의 Settings → Environment Variables에서 GEMINI_API_KEY를 설정합니다. Google 메디인 Studio(aistudio.google.com)에서 무료로 API 키를 발급받을 수 있습니다.',
  },
  {
    q: '공식 인증기준집을 직접 입력할 수 있나요?',
    a: '문서 생성 페이지에서 "공식 자료 입력" 섹션을 펼쳐 공식 인증기준 텍스트를 붙여넣을 수 있습니다. 공식 자료를 입력하면 더 정확한 문서가 생성됩니다.',
  },
  {
    q: '생성된 문서는 저장되나요?',
    a: '현재 버전에서는 생성된 문서가 서버에 저장되지 않습니다. 필요한 내용은 복사하여 별도로 저장해 주세요.',
  },
];

const guides = [
  { icon: <FileText className="w-5 h-5 text-blue-500" />, title: '병원 유형 선택', desc: '인증받을 병원 유형을 선택합니다', href: '/hospitals' },
  { icon: <BookOpen className="w-5 h-5 text-green-500" />, title: '기준집 탐색', desc: '공식 인증기준집 목차를 확인합니다', href: '/standards' },
  { icon: <FileText className="w-5 h-5 text-purple-500" />, title: '문서 생성', desc: '메디인으로 필요한 문서를 생성합니다', href: '/generate' },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">도움말</h1>
        <p className="text-gray-500">메디인증 문서센터 사용 가이드와 자주 묻는 질문입니다</p>
      </div>

      {/* 시작 가이드 */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🚀 시작 가이드</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {guides.map((g, i) => (
            <Link
              key={i}
              href={g.href}
              className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {g.icon}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="w-5 h-5 bg-gray-200 rounded-full text-xs font-bold text-gray-600 flex items-center justify-center">{i + 1}</span>
                  <span className="font-bold text-gray-900 text-sm">{g.title}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">❓ 자주 묻는 질문</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <HelpCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-gray-900 text-sm">{faq.q}</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed ml-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 문의 */}
      <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
        <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
        <h2 className="font-bold text-gray-900 mb-1">추가 문의</h2>
        <p className="text-sm text-gray-600 mb-4">더 궁금한 점이 있으시면 문서 생성 페이지에서 직접 확인해보세요</p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          문서 생성하기
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
