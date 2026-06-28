import type { Metadata } from 'next';
import { IngestButton } from '@/components/admin/IngestButton';

export const metadata: Metadata = { title: '어드민 도구 — 메디인증' };

export default function AdminToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">어드민 도구</h1>
        <p className="text-sm text-muted-foreground mt-1">플랫폼 유지관리 작업을 실행합니다.</p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-3">
        <h2 className="text-base font-semibold">인증기준 RAG 임베딩</h2>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-xs bg-gray-100 px-1 rounded">standardCatalog.ts</code>의 전체 항목을
          Gemini text-embedding-004로 임베딩하여 Supabase <code className="font-mono text-xs bg-gray-100 px-1 rounded">standard_chunks</code>에 저장합니다.
          AI 문서 생성 시 관련 인증기준이 자동으로 참조됩니다.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
          <li>중복 실행 안전 (upsert — 기존 데이터 덮어쓰기)</li>
          <li>소요 시간: 약 30~90초 (청크 수 × API 응답시간)</li>
          <li>전제 조건: <code className="font-mono text-xs">GEMINI_API_KEY</code>, <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code> 설정, pgvector 마이그레이션 적용</li>
        </ul>
        <IngestButton />
      </div>
    </div>
  );
}
