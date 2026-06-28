import Link from 'next/link';
import { Check, Zap, Shield, Heart } from 'lucide-react';

const features = [
  '모든 병원 유형 문서 생성 (요양·급성기·치과·한방 등 11종)',
  '규정집·지침서·서식·체크리스트 전체 패키지 생성',
  '인증기준집 탐색 및 장 전체 규정집 생성',
  '빈 서식 직접 입력 및 인쇄 기능',
  '의료기관평가인증원 4주기 기준 반영',
  'API 키 보유 시 무제한 생성 (Google AI Studio 무료 키 지원)',
];

export default function PricingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
          <Heart className="w-4 h-4" />
          현재 무료 운영 중
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-3">완전 무료</h1>
        <p className="text-gray-500 text-base">
          메디인증은 현재 모든 기능을 무료로 제공합니다.<br/>
          의료기관 인증 준비에 부담 없이 활용하세요.
        </p>
      </div>

      {/* 무료 카드 */}
      <div className="bg-white border-2 border-green-400 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">전체 기능 무료</h2>
            <p className="text-gray-500 text-sm mt-1">회원가입 없이 바로 사용 가능</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-green-600">₩0</span>
            <p className="text-gray-400 text-xs mt-0.5">영원히</p>
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-gray-700">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/generate"
          className="block text-center py-4 rounded-xl font-bold text-base bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          <Zap className="w-4 h-4 inline mr-2" />
          지금 바로 시작하기 →
        </Link>
      </div>

      {/* 안내 */}
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-700 space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <Shield className="w-4 h-4" />
          사용 안내
        </div>
        <p>• 생성된 문서는 실무 참고용 초안이며, 최종 사용 전 내부 검토가 필요합니다.</p>
        <p>• API 키는 서버에서만 처리되며 외부에 노출되지 않습니다.</p>
        <p>• 개인정보는 마스킹 처리(홍○○ 등)되어 생성됩니다.</p>
      </div>
    </div>
  );
}
