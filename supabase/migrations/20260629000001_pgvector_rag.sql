-- RAG: pgvector extension + standard_chunks table
-- 인증기준 카탈로그를 벡터 임베딩으로 저장하여 의미 검색 지원

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS standard_chunks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_type  TEXT NOT NULL,
  chapter_number TEXT NOT NULL,
  item_number    TEXT NOT NULL,
  item_title     TEXT NOT NULL,
  content        TEXT NOT NULL,
  embedding      vector(768),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE standard_chunks
    ADD CONSTRAINT standard_chunks_type_item_uq UNIQUE (hospital_type, item_number);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- 카탈로그 데이터는 테넌트 비격리 — 전체 읽기 허용
ALTER TABLE standard_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "standard_chunks_select" ON standard_chunks;
CREATE POLICY "standard_chunks_select" ON standard_chunks FOR SELECT USING (true);

-- 서비스롤만 upsert 가능
DROP POLICY IF EXISTS "standard_chunks_upsert" ON standard_chunks;
CREATE POLICY "standard_chunks_upsert" ON standard_chunks
  FOR ALL USING (auth.role() = 'service_role');

-- pgvector 코사인 유사도 검색 RPC
CREATE OR REPLACE FUNCTION match_standard_chunks(
  query_embedding      vector(768),
  hospital_type_filter TEXT    DEFAULT '',
  match_count          INTEGER DEFAULT 5
)
RETURNS TABLE (
  id             UUID,
  hospital_type  TEXT,
  chapter_number TEXT,
  item_number    TEXT,
  item_title     TEXT,
  content        TEXT,
  score          DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.hospital_type,
    sc.chapter_number,
    sc.item_number,
    sc.item_title,
    sc.content,
    (1 - (sc.embedding <=> query_embedding))::DOUBLE PRECISION AS score
  FROM standard_chunks sc
  WHERE sc.embedding IS NOT NULL
    AND (hospital_type_filter = '' OR sc.hospital_type = hospital_type_filter)
  ORDER BY sc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
