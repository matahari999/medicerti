// Gemini 임베딩 — API key via header (not URL param) to avoid log exposure.
// text-embedding-004는 지원 종료(404)되어 gemini-embedding-001로 교체했다.
// DB의 vector(768) 컬럼에 맞춰 768차원으로 요청하며, 3072 미만으로 자른 벡터는
// 코사인 유사도가 어긋나므로 반드시 정규화해서 저장/조회해야 한다.
const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_API = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`;
export const EMBEDDING_DIMENSIONS = 768;

export async function embedText(text: string, apiKey: string): Promise<number[]> {
  const res = await fetch(EMBEDDING_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      model: `models/${EMBEDDING_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });
  if (!res.ok) throw new Error(`Embedding API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return normalize(data.embedding?.values ?? []);
}

/**
 * 임베딩 호출은 동시 요청이 몰리면 429(rate limit)가 난다.
 * 대량 색인 시에는 이 래퍼로 재시도해야 절반 이상이 조용히 누락되는 일을 막을 수 있다.
 */
export async function embedTextWithRetry(text: string, apiKey: string, attempts = 4): Promise<number[]> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      return await embedText(text, apiKey);
    } catch (e) {
      lastError = e
      // 429/5xx는 잠시 뒤 재시도, 그 외(400 등)는 즉시 포기
      const msg = e instanceof Error ? e.message : String(e)
      if (!/\b(429|500|502|503|504)\b/.test(msg)) throw e
      await new Promise((r) => setTimeout(r, 800 * Math.pow(2, i)))
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

function normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
  return norm === 0 ? v : v.map((x) => x / norm);
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
