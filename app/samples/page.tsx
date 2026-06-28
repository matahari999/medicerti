import Link from 'next/link';
import { FileText, ArrowRight } from 'lucide-react';

const samples = [
  {
    title: '낙상 예방관리 규정집 샘플',
    type: '요양병원',
    docType: '규정집',
    desc: '낙상 위험 평가, 예방 중재, 보고 절차를 포함한 표준 규정집 예시',
    tags: ['낙상관리', '환자안전', '요양병원'],
  },
  {
    title: '감염관리 체크리스트 샘플',
    type: '급성기병원',
    docType: '체크리스트',
    desc: '의료관련감염 예방을 위한 일일·주간·월간 점검 항목',
    tags: ['감염관리', '손위생', '급성기'],
  },
  {
    title: 'AED 점검표 샘플',
    type: '공통',
    docType: '점검표',
    desc: 'AED 일일 점검, 월별 유지관리, 배터리 교체 이력 기록 양식',
    tags: ['AED', '응급장비', '안전관리'],
  },
  {
    title: '욕창 예방 케어 기록지 샘플',
    type: '요양병원',
    docType: '서식',
    desc: 'Braden Scale 기반 위험도 평가와 욕창 케어 기록 양식',
    tags: ['욕창', '간호기록', '요양병원'],
  },
  {
    title: '정신과 격리·강박 관리 기록지',
    type: '정신병원',
    docType: '서식',
    desc: '격리·강박 적용 사유, 동의, 모니터링, 해제 기록 양식',
    tags: ['격리강박', '인권', '정신병원'],
  },
  {
    title: '재활치료 계획서 샘플',
    type: '재활병원',
    docType: '서식',
    desc: '다학제 회의 결과를 반영한 개인별 재활치료 목표 및 계획',
    tags: ['재활계획', '다학제', '재활병원'],
  },
];

export default function SamplesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">샘플 보기</h1>
        <p className="text-gray-500">메디인이 생성한 문서 샘플을 미리 확인하세요. 실제 생성 시 병원 정보에 맞게 커스터마이징됩니다.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {samples.map((sample, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sample.docType}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{sample.title}</h3>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">{sample.desc}</p>
            <div className="flex flex-wrap gap-1 mb-4">
              {sample.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{tag}</span>
              ))}
            </div>
            <Link
              href="/generate"
              className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              이 유형 문서 생성하기
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center bg-blue-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">직접 생성해보세요</h2>
        <p className="text-gray-500 mb-4">병원 유형과 요청 내용만 입력하면 메디인이 맞춤 문서를 즉시 생성합니다</p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          문서 생성하기
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
