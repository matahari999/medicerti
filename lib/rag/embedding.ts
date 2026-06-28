// Gemini text-embedding-004 — API key via header (not URL param) to avoid log exposure
const EMBEDDING_API = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

export async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(EMBEDDING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'models/text-embedding-004',
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) throw new Error(`Embedding API error: ${res.status}`);
  const data = await res.json();
  return data.embedding?.values ?? [];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function chunkText(text: string, maxChars = 2048): string[] {
  const sentences = text.split(/(?<=[.!?。])\s+/);
  const chunks: string[] = [];
  let current = '';
  for (const s of sentences) {
    if (current.length + s.length > maxChars && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
