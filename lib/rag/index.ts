import { createClient } from '@supabase/supabase-js';
import { embedText } from './embedding';

export interface RagChunk {
  content: string;
  chapterNumber: string | null;
  itemNumber: string | null;
  score: number;
}

export async function retrieveRelevantChunks(
  query: string,
  hospitalType?: string,
  apiKey?: string,
  topK = 5,
): Promise<RagChunk[]> {
  if (!apiKey || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [];
  }

  try {
    const queryEmbedding = await embedText(query, apiKey);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

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

export function formatRagContext(chunks: RagChunk[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map((c, i) => `[기준 ${i + 1}] ${c.content}`)
    .join('\n\n');
}
