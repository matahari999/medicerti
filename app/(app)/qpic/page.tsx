// QPIC 전문 섹션 — 환자안전(QPS) / 감염관리(IM) / 적정성평가 구조화
// 관련법규, 가이드라인, 서식자료, 소식 분류

import { QPIC_SECTION_LABELS, QPIC_RESOURCE_TYPE_LABELS } from '@/types';
import type { QpicSection, QpicResource, QpicResourceType } from '@/types';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  ShieldPlus,
  FileText,
  BookOpen,
  Newspaper,
  Globe,
  Download,
  ExternalLink,
  Scale,
  Activity,
} from 'lucide-react';

// QPIC Mock 데이터
const mockQpicResources: QpicResource[] = [
  // QPS 자료
  {
    id: 'qpic-001',
    section: 'qps',
    resourceType: 'law',
    title: '환자안전법 (법률 제19358호)',
    description: '환자안전사고 예방 및 보고에 관한 법률',
    url: 'https://www.law.go.kr',
    fileUrl: null,
    publishedAt: '2023-03-28',
    source: '국가법령정보센터',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-002',
    section: 'qps',
    resourceType: 'guideline',
    title: '환자안전 보고학습시스템 운영 지침',
    description: '의료기관 환자안전사건 보고 및 학습 절차 지침서',
    url: 'https://www.kops.or.kr',
    fileUrl: null,
    publishedAt: '2025-01-01',
    source: '환자안전보고학습시스템(KOPS)',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-003',
    section: 'qps',
    resourceType: 'form',
    title: '환자안전사건 보고 서식 (자발적 보고용)',
    description: '낙상, 투약오류, 의료기기 관련 사건 보고서식',
    url: null,
    fileUrl: '/forms/patient-safety-report.docx',
    publishedAt: '2026-01-01',
    source: '메디인증 문서센터',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-004',
    section: 'qps',
    resourceType: 'news',
    title: '2026년 환자안전 주요 통계 발표',
    description: '한국환자안전재단 2026년 1분기 보고서',
    url: 'https://www.kops.or.kr',
    fileUrl: null,
    publishedAt: '2026-04-15',
    source: '한국환자안전재단',
    createdAt: '2026-04-15T00:00:00Z',
  },
  // 감염관리 자료
  {
    id: 'qpic-005',
    section: 'infection',
    resourceType: 'law',
    title: '의료법 제47조 (의료기관 감염관리)',
    description: '의료기관의 감염관리위원회 및 감염관리실 설치 의무',
    url: 'https://www.law.go.kr',
    fileUrl: null,
    publishedAt: '2024-01-23',
    source: '국가법령정보센터',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-006',
    section: 'infection',
    resourceType: 'guideline',
    title: '의료관련감염 표준예방지침 2024',
    description: '손위생, 격리, 의료기기 관련 감염 예방 표준지침',
    url: 'https://www.kdca.go.kr',
    fileUrl: null,
    publishedAt: '2024-01-01',
    source: '질병관리청',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-007',
    section: 'infection',
    resourceType: 'form',
    title: '손위생 모니터링 월간 대장',
    description: '손위생 수행률 모니터링 결과 기록 서식',
    url: null,
    fileUrl: '/forms/hand-hygiene-monitoring.xlsx',
    publishedAt: '2026-01-01',
    source: '메디인증 문서센터',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-008',
    section: 'infection',
    resourceType: 'news',
    title: '신종 감염병 대응 의료기관 매뉴얼 업데이트',
    description: '질병관리청 신종감염병 의료기관 대응 지침 2026년 개정',
    url: 'https://www.kdca.go.kr',
    fileUrl: null,
    publishedAt: '2026-03-01',
    source: '질병관리청',
    createdAt: '2026-03-01T00:00:00Z',
  },
  // 적정성평가 자료
  {
    id: 'qpic-009',
    section: 'adequacy',
    resourceType: 'guideline',
    title: '적정성평가 결과 활용 가이드',
    description: '심평원 적정성평가 결과를 의료기관 질 향상에 활용하는 방법',
    url: 'https://www.hira.or.kr',
    fileUrl: null,
    publishedAt: '2025-12-01',
    source: '건강보험심사평가원',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'qpic-010',
    section: 'adequacy',
    resourceType: 'law',
    title: '건강보험 요양급여 기준에 관한 규칙',
    description: '적정성평가 관련 요양급여 기준 법령',
    url: 'https://www.law.go.kr',
    fileUrl: null,
    publishedAt: '2024-06-01',
    source: '국가법령정보센터',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

// 리소스 타입 아이콘
function ResourceTypeIcon({ type }: { type: QpicResourceType }) {
  const icons: Record<QpicResourceType, React.ReactNode> = {
    law: <Scale size={14} />,
    guideline: <BookOpen size={14} />,
    form: <FileText size={14} />,
    news: <Newspaper size={14} />,
    link: <Globe size={14} />,
  };
  return <>{icons[type]}</>;
}

// 리소스 카드
function ResourceCard({ resource }: { resource: QpicResource }) {
  const typeColors: Record<QpicResourceType, string> = {
    law: 'bg-purple-50 text-purple-700 border-purple-200',
    guideline: 'bg-blue-50 text-blue-700 border-blue-200',
    form: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    news: 'bg-amber-50 text-amber-700 border-amber-200',
    link: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeColors[resource.resourceType]}`}>
        <ResourceTypeIcon type={resource.resourceType} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`badge text-xs border ${typeColors[resource.resourceType]}`}>
            {QPIC_RESOURCE_TYPE_LABELS[resource.resourceType]}
          </span>
        </div>
        <div className="font-medium text-sm text-slate-800">{resource.title}</div>
        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">{resource.description}</div>
        <div className="data-source mt-1">
          <span>출처: {resource.source}</span>
          {resource.publishedAt && (
            <>
              <span>·</span>
              <span>{formatDate(resource.publishedAt, 'yyyy.MM.dd')}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {resource.fileUrl && (
          <button className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
            <Download size={14} />
          </button>
        )}
        {resource.url && (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

// 섹션 탭 + 자료 목록
function QpicSection({
  section,
  resources,
}: {
  section: QpicSection;
  resources: QpicResource[];
}) {
  const resourceTypes: QpicResourceType[] = ['law', 'guideline', 'form', 'news', 'link'];

  return (
    <div className="space-y-4">
      {resourceTypes.map((type) => {
        const filtered = resources.filter((r) => r.resourceType === type);
        if (filtered.length === 0) return null;

        return (
          <div key={type}>
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <ResourceTypeIcon type={type} />
              {QPIC_RESOURCE_TYPE_LABELS[type]}
              <span className="ml-auto text-xs font-normal text-slate-400">{filtered.length}건</span>
            </h4>
            <div className="space-y-2">
              {filtered.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// QPIC 페이지
export default function QpicPage() {
  const sections: QpicSection[] = ['qps', 'infection', 'adequacy'];

  const sectionIcons: Record<QpicSection, React.ReactNode> = {
    qps: <ShieldPlus size={16} />,
    infection: <Activity size={16} />,
    adequacy: <FileText size={16} />,
  };

  const sectionColors: Record<QpicSection, string> = {
    qps: 'text-blue-600',
    infection: 'text-teal-600',
    adequacy: 'text-purple-600',
  };

  return (
    <div className="space-y-6 fade-in">
      {/* 헤더 */}
      <div>
        <h1 className="section-title flex items-center gap-2">
          <ShieldPlus size={20} className="text-blue-600" />
          QPIC 전문 섹션
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          환자안전(QPS), 감염관리(IM), 적정성평가 자료를 구조적으로 제공합니다.
        </p>
      </div>

      {/* 섹션별 탭 (각 섹션 카드) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => {
          const resources = mockQpicResources.filter((r) => r.section === section);
          return (
            <div key={section} className="card p-5">
              <div className={`flex items-center gap-2 font-bold text-base mb-4 ${sectionColors[section]}`}>
                {sectionIcons[section]}
                {QPIC_SECTION_LABELS[section]}
                <span className="ml-auto text-xs text-slate-400 font-normal">{resources.length}건</span>
              </div>
              <QpicSection section={section} resources={resources} />
            </div>
          );
        })}
      </div>

      {/* 관련 사이트 링크 */}
      <div className="card p-5">
        <h3 className="font-bold text-slate-800 mb-3">관련 기관 바로가기</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: '환자안전보고학습시스템', url: 'https://www.kops.or.kr', desc: 'KOPS' },
            { name: '질병관리청', url: 'https://www.kdca.go.kr', desc: '감염병 정보' },
            { name: '건강보험심사평가원', url: 'https://www.hira.or.kr', desc: '적정성평가' },
            { name: '의료기관평가인증원', url: 'https://www.koiha.or.kr', desc: '인증기준' },
          ].map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-3 border border-slate-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-all group"
            >
              <Globe size={14} className="text-slate-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-800 group-hover:text-blue-700">{site.name}</div>
                <div className="text-xs text-slate-500">{site.desc}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
