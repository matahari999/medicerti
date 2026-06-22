-- ============================================================
-- AccrediQ — Storage 버킷 설정
-- 생성일: 2026-06-22
-- ============================================================

-- 문서 저장 버킷 (비공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 보고서 저장 버킷 (비공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  20971520,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS 정책 (idempotent via DO block)
-- ============================================================

-- 문서: 병원 멤버만 접근 가능
-- 경로 구조: documents/{hospitalId}/{uuid}.pdf
DO $$ BEGIN
CREATE POLICY "documents storage: 병원 멤버 접근"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] IN (
      SELECT hospital_id::TEXT FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 보고서: 병원 멤버만 접근 가능
-- 경로 구조: reports/{hospitalId}/{analysisId}.pdf
DO $$ BEGIN
CREATE POLICY "reports storage: 병원 멤버 접근"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'reports'
    AND (storage.foldername(name))[1] IN (
      SELECT hospital_id::TEXT FROM hospital_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
