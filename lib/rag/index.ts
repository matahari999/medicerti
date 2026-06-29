import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedding';

export interface RagChunk {
  content: string;
  chapterNumber: string | null;
  itemNumber: string | null;
  score: number;
}

async function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function retrieveRelevantChunks(
  query: string,
  hospitalType?: string,
  apiKey?: string,
  topK = 5,
): Promise<RagChunk[]> {
  if (!apiKey) return [];

  const supabase = await getSupabaseClient();
  if (!supabase) return [];

  try {
    const queryEmbedding = await embedText(query, apiKey);

    const { data, error } = await supabase.rpc('match_standard_chunks', {
      query_embedding: queryEmbedding,
      hospital_type_filter: hospitalType ?? '',
      match_count: topK,
    });

    if (error || !data) return [];

    return (data as any[]).map((row) => ({
      content: row.content as string,
      chapterNumber: (row.chapter_number as string) ?? null,
      itemNumber: (row.item_number as string) ?? null,
      score: (row.score as number) ?? 0,
    }));
  } catch {
    return [];
  }
}

export async function retrieveSelfAssessmentContext(
  hospitalId: string,
  criterionTitle: string,
): Promise<string> {
  const supabase = await getSupabaseClient();
  if (!supabase) return '';

  try {
    const { data } = await supabase
      .from('self_assessment_results')
      .select('compliance_status, priority_score, notes, survey_items(title, sop_type)')
      .eq('hospital_id', hospitalId)
      .textSearch('survey_items.title', criterionTitle, { config: 'simple' })
      .limit(3);

    if (!data || data.length === 0) return '';

    return data
      .map((r: any) => {
        const item = r.survey_items as { title: string; sop_type: string } | null;
        const statusLabel: Record<string, string> = {
          compliant: '충족', partial: '부분충족', non_compliant: '미충족', not_reviewed: '미검토',
        };
        return `[자가진단] ${item?.title ?? ''} — 상태: ${statusLabel[r.compliance_status] ?? r.compliance_status}${r.priority_score != null ? `, 우선순위 점수: ${r.priority_score}` : ''}`;
      })
      .join('\n');
  } catch {
    return '';
  }
}

export async function retrieveRelatedCriteria(
  criterionCode: string,
  hospitalType: string,
): Promise<string> {
  const supabase = await getSupabaseClient();
  if (!supabase) return '';

  try {
    const { data } = await supabase
      .from('standard_chunks')
      .select('content, chapter_number, item_number')
      .textSearch('content', criterionCode.replace(/-/g, ' '), { config: 'simple' })
      .limit(3);

    if (!data || data.length === 0) return '';

    return data
      .map((r: any) => `[관련 기준 ${r.chapter_number ?? ''}] ${r.content}`)
      .join('\n\n');
  } catch {
    return '';
  }
}

export function formatRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map((c, i) => `[기준 ${i + 1}] ${c.content}`)
    .join('\n\n');
}
