import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isPlatformAdmin } from '@/lib/services/admin.service';
import { STANDARD_CATALOG } from '@/lib/standardCatalog';
import { embedText } from '@/lib/rag/embedding';
import type { HospitalTypeKey } from '@/lib/types';

// Vercel max duration (Pro plan: 300s, configure in vercel.json if needed)
export const maxDuration = 300;

const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 150;
const SKIP_TYPES: HospitalTypeKey[] = ['other', 'custom'];

function buildChunkContent(
  typeKey: string,
  chapterNumber: string,
  chapterTitle: string,
  item: {
    itemNumber: string;
    itemTitle: string;
    summary: string;
    requiredDocuments: string[];
    requiredForms: string[];
    requiredChecklists: string[];
    requiredEvidence: string[];
  },
): string {
  const lines = [
    `[${typeKey}] ${item.itemNumber} ${item.itemTitle}`,
    `장: ${chapterNumber}. ${chapterTitle}`,
    `개요: ${item.summary}`,
  ];
  if (item.requiredDocuments.length) lines.push(`필수문서: ${item.requiredDocuments.join(', ')}`);
  if (item.requiredForms.length) lines.push(`필수서식: ${item.requiredForms.join(', ')}`);
  if (item.requiredChecklists.length) lines.push(`필수체크리스트: ${item.requiredChecklists.join(', ')}`);
  if (item.requiredEvidence.length) lines.push(`근거자료: ${item.requiredEvidence.join(', ')}`);
  return lines.join('\n');
}

export async function POST() {
  const isAdmin = await isPlatformAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase service role key not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Collect all chunks from catalog
  type Chunk = {
    hospital_type: string;
    chapter_number: string;
    item_number: string;
    item_title: string;
    content: string;
  };
  const chunks: Chunk[] = [];

  for (const [typeKey, catalog] of Object.entries(STANDARD_CATALOG)) {
    if (SKIP_TYPES.includes(typeKey as HospitalTypeKey)) continue;
    for (const chapter of catalog.chapters) {
      for (const item of chapter.items) {
        chunks.push({
          hospital_type: typeKey,
          chapter_number: chapter.chapterNumber,
          item_number: item.itemNumber,
          item_title: item.itemTitle,
          content: buildChunkContent(typeKey, chapter.chapterNumber, chapter.chapterTitle, item),
        });
      }
    }
  }

  let processed = 0;
  let failed = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (chunk) => {
        try {
          const embedding = await embedText(chunk.content, apiKey);
          const { error } = await supabase
            .from('standard_chunks')
            .upsert({ ...chunk, embedding }, { onConflict: 'hospital_type,item_number' });
          if (error) throw error;
          processed++;
        } catch (e) {
          console.error(`[ingest] failed chunk ${chunk.hospital_type}/${chunk.item_number}:`, e);
          failed++;
        }
      }),
    );

    if (i + BATCH_SIZE < chunks.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return NextResponse.json({ total: chunks.length, processed, failed });
}
