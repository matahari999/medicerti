-- ============================================================
-- AccrediQ — 교육자료 등 관리문서에 외부 동영상 링크(YouTube 등) 첨부 지원
-- ============================================================

ALTER TABLE managed_documents
  ADD COLUMN IF NOT EXISTS video_url TEXT;
