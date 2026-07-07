-- KOIHA(의료기관평가인증원) 인트라넷 자동 동기화
-- notices 테이블(공지 대시보드) + koiha_sync_log(멱등성/감사로그) + koiha-archive 버킷

-- ============================================================
-- notices 테이블 — app/(app)/notices 페이지가 이미 기대하는 스키마
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  content               TEXT NOT NULL DEFAULT '',
  source                TEXT NOT NULL,
  source_url            TEXT,
  urgency               TEXT NOT NULL DEFAULT 'medium',
  target_hospital_types TEXT[] NOT NULL DEFAULT '{}',
  published_at          TIMESTAMPTZ NOT NULL,
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notices_source_idx ON notices (source);
CREATE INDEX IF NOT EXISTS notices_published_at_idx ON notices (published_at DESC);

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notices_select" ON notices;
CREATE POLICY "notices_select" ON notices FOR SELECT USING (true);
DROP POLICY IF EXISTS "notices_upsert" ON notices;
CREATE POLICY "notices_upsert" ON notices
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- koiha_sync_log — 스크래핑 멱등성 + 감사 추적
-- ============================================================
CREATE TABLE IF NOT EXISTS koiha_sync_log (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board                   TEXT NOT NULL,
  post_key                TEXT NOT NULL,
  post_title              TEXT NOT NULL,
  content_hash            TEXT NOT NULL,
  attachment_names        TEXT[] NOT NULL DEFAULT '{}',
  notice_id               UUID REFERENCES notices(id) ON DELETE SET NULL,
  standard_chunks_synced  BOOLEAN NOT NULL DEFAULT false,
  first_seen_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  ALTER TABLE koiha_sync_log
    ADD CONSTRAINT koiha_sync_log_board_post_uq UNIQUE (board, post_key);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE koiha_sync_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "koiha_sync_log_service_only" ON koiha_sync_log;
CREATE POLICY "koiha_sync_log_service_only" ON koiha_sync_log
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- koiha-archive Storage 버킷 — 원본 PDF/HWP 보관 (비공개)
-- 경로 구조: koiha-archive/{board}/{post_key}/파일명
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'koiha-archive',
  'koiha-archive',
  false,
  104857600,
  ARRAY['application/pdf', 'application/x-hwp', 'application/octet-stream']
)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
CREATE POLICY "koiha-archive storage: service_role만 접근"
  ON storage.objects FOR ALL
  USING (bucket_id = 'koiha-archive' AND auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
