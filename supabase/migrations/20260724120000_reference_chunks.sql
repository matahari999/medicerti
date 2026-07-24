-- 규정집 생성 근거 코퍼스: 업로드 PDF·인증기준집·규정 사례집·지침 원문을 기준번호 단위 청크로 보관.
-- 기존 standard_chunks(인증기준 카탈로그 요약, 기준당 1행)와 역할이 다르다 — 이쪽은 규정 '원문'이고 한 문서에서 수십~수백 청크가 나온다.
--
-- 서버(서비스 롤)에서만 읽고 쓴다. 구독자에게 다른 병원 규정 원문이 그대로 노출되면 안 되므로 RLS 정책을 두지 않는다
-- (RLS 활성화 + 정책 없음 = anon/authenticated 접근 전면 차단, service_role은 RLS 우회).

CREATE TABLE IF NOT EXISTS reference_chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'uploaded_pdf' = 어드민이 /admin/criteria에서 올린 참고자료
  -- 'guideline'    = repo guidelines/ 의 인증기준집·표준지침서
  -- 'casebook'     = 규정 사례집
  source_kind   TEXT NOT NULL,
  -- uploaded_pdf면 storage 경로(criteria/uuid.pdf), 그 외엔 코퍼스 키(nursing-4th 등)
  source_id     TEXT NOT NULL,
  source_title  TEXT NOT NULL,
  -- 'long_term_care' | 'psychiatric' | NULL(종별 공통)
  hospital_type TEXT,
  chapter_no    INTEGER,
  chapter_title TEXT,
  -- 규정/기준 번호. 예: '7.1', '7.1.2'
  reg_code      TEXT,
  reg_title     TEXT,
  page_from     INTEGER,
  page_to       INTEGER,
  content       TEXT NOT NULL,
  char_count    INTEGER NOT NULL DEFAULT 0,
  embedding     vector(768),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reference_chunks_source  ON reference_chunks(source_kind, source_id);
CREATE INDEX IF NOT EXISTS idx_reference_chunks_code    ON reference_chunks(hospital_type, reg_code);
CREATE INDEX IF NOT EXISTS idx_reference_chunks_chapter ON reference_chunks(hospital_type, chapter_no);

ALTER TABLE reference_chunks ENABLE ROW LEVEL SECURITY;

-- 의미 검색 RPC. 기준번호 정확매칭으로 못 찾는 사례집·지침 본문을 보완한다.
-- hospital_type_filter가 빈 문자열이면 종별 무관, 값이 있으면 해당 종별 + 종별 공통(NULL)을 함께 본다.
CREATE OR REPLACE FUNCTION match_reference_chunks(
  query_embedding      vector(768),
  hospital_type_filter TEXT    DEFAULT '',
  source_kind_filter   TEXT    DEFAULT '',
  match_count          INTEGER DEFAULT 8
)
RETURNS TABLE (
  id            UUID,
  source_kind   TEXT,
  source_title  TEXT,
  hospital_type TEXT,
  chapter_no    INTEGER,
  chapter_title TEXT,
  reg_code      TEXT,
  reg_title     TEXT,
  page_from     INTEGER,
  page_to       INTEGER,
  content       TEXT,
  score         DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rc.id, rc.source_kind, rc.source_title, rc.hospital_type,
    rc.chapter_no, rc.chapter_title, rc.reg_code, rc.reg_title,
    rc.page_from, rc.page_to, rc.content,
    (1 - (rc.embedding <=> query_embedding))::DOUBLE PRECISION AS score
  FROM reference_chunks rc
  WHERE rc.embedding IS NOT NULL
    AND (hospital_type_filter = '' OR rc.hospital_type = hospital_type_filter OR rc.hospital_type IS NULL)
    AND (source_kind_filter = '' OR rc.source_kind = source_kind_filter)
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 생성된 규정 문서가 어떤 원문을 근거로 삼았는지 기록(관리자에게만 노출).
-- [{ sourceTitle, sourceKind, regCode, pageFrom, pageTo, matchedBy }, ...]
ALTER TABLE managed_documents ADD COLUMN IF NOT EXISTS source_refs JSONB;

COMMENT ON TABLE reference_chunks IS '규정집 자동 생성 근거 코퍼스 원문 (서비스 롤 전용)';
COMMENT ON COLUMN managed_documents.source_refs IS '생성 시 사용한 근거 원문 출처 (관리자 전용 표시)';
