-- ============================================================
-- AccrediQ — 인증기준 5단계 계층 데이터 모델
-- 영역(area) → 장(chapter) → 기준(criterion) → 범주(category) → 조사항목(survey_item)
-- 병원 종별 분리 + S/P/O 타입 + 정규/시범 태깅
-- ============================================================

-- 기존 accreditation_criteria는 하위호환성을 위해 유지
-- 새 시스템은 아래 5개 테이블로 운영

-- ============================================================
-- 1. 영역 (Area) — 환자안전(PS), 환자중심(PC) 등 최상위 분류
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  name_en     TEXT,
  description TEXT,
  color       TEXT,
  weight      NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. 장 (Chapter) — 영역 하위, 병원 종별 필터 포함
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_chapters (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id        UUID NOT NULL REFERENCES accreditation_areas(id),
  code           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  hospital_types TEXT[] NOT NULL DEFAULT '{}',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_area ON accreditation_chapters(area_id);
CREATE INDEX IF NOT EXISTS idx_chapters_types ON accreditation_chapters USING GIN(hospital_types);

-- ============================================================
-- 3. 기준 (Criterion) — 장 하위, 평가의 독립 단위
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id     UUID NOT NULL REFERENCES accreditation_chapters(id),
  code           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  hospital_types TEXT[] NOT NULL DEFAULT '{}',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entries_chapter ON accreditation_entries(chapter_id);
CREATE INDEX IF NOT EXISTS idx_entries_types ON accreditation_entries USING GIN(hospital_types);

-- ============================================================
-- 4. 범주 (Category) — 기준 내 논리적 그룹핑 (선택)
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id     UUID NOT NULL REFERENCES accreditation_entries(id),
  name         TEXT NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_entry ON accreditation_categories(entry_id);

-- ============================================================
-- 5. 조사항목 (Survey Item) — ME 1.1 같은 실제 평가 leaf 노드
-- S/P/O 타입 + 정규/시범 태깅 + 병원 종별 필터
-- ============================================================
CREATE TABLE IF NOT EXISTS accreditation_survey_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id       UUID REFERENCES accreditation_categories(id),
  entry_id          UUID NOT NULL REFERENCES accreditation_entries(id),
  code              TEXT NOT NULL,            -- ME 1.1, ME 1.2
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  assessment_method TEXT,                     -- 서류 검토, 직원 면담, 병동 관찰
  -- S/P/O 타입
  sop_type          TEXT NOT NULL DEFAULT 'process'
                    CHECK (sop_type IN ('structure', 'process', 'outcome')),
  -- 정규(true)/시범(false)
  is_pilot          BOOLEAN NOT NULL DEFAULT false,
  -- 심각도
  severity          TEXT NOT NULL DEFAULT 'major'
                    CHECK (severity IN ('critical', 'major', 'minor')),
  weight            NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  is_mandatory      BOOLEAN NOT NULL DEFAULT true,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  -- 인증 주기 버전
  version           TEXT NOT NULL DEFAULT '2024',
  -- 적용 병원 종류 배열
  hospital_types    TEXT[] NOT NULL DEFAULT '{}',
  required_evidence TEXT,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(code, version)
);

CREATE INDEX IF NOT EXISTS idx_survey_items_entry ON accreditation_survey_items(entry_id);
CREATE INDEX IF NOT EXISTS idx_survey_items_category ON accreditation_survey_items(category_id) WHERE category_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_survey_items_active ON accreditation_survey_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_survey_items_types ON accreditation_survey_items USING GIN(hospital_types);
CREATE INDEX IF NOT EXISTS idx_survey_items_sop ON accreditation_survey_items(sop_type);
CREATE INDEX IF NOT EXISTS idx_survey_items_pilot ON accreditation_survey_items(is_pilot) WHERE is_pilot = true;

-- ============================================================
-- RLS: 모든 인증기준 데이터는 읽기 전용(전체 공개)
-- ============================================================
ALTER TABLE accreditation_areas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_chapters     ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE accreditation_survey_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "areas_select_all"       ON accreditation_areas        FOR SELECT USING (true);
CREATE POLICY "chapters_select_all"    ON accreditation_chapters     FOR SELECT USING (true);
CREATE POLICY "entries_select_all"     ON accreditation_entries      FOR SELECT USING (true);
CREATE POLICY "categories_select_all"  ON accreditation_categories   FOR SELECT USING (true);
CREATE POLICY "survey_items_select_all" ON accreditation_survey_items FOR SELECT USING (true);

-- service_role만 쓰기 가능
CREATE POLICY "areas_write_service"       ON accreditation_areas        FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "chapters_write_service"    ON accreditation_chapters     FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "entries_write_service"     ON accreditation_entries      FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "categories_write_service"  ON accreditation_categories   FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "survey_items_write_service" ON accreditation_survey_items FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- 헬퍼 함수: hospital_type으로 필터링된 전체 트리 조회
-- ============================================================
CREATE OR REPLACE FUNCTION get_accreditation_tree(p_hospital_type TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH filtered_areas AS (
    SELECT * FROM accreditation_areas ORDER BY sort_order
  ),
  filtered_chapters AS (
    SELECT c.* FROM accreditation_chapters c
    WHERE p_hospital_type IS NULL OR p_hospital_type = ANY(c.hospital_types) OR array_length(c.hospital_types, 1) IS NULL
    ORDER BY c.sort_order
  ),
  filtered_entries AS (
    SELECT e.* FROM accreditation_entries e
    WHERE p_hospital_type IS NULL OR p_hospital_type = ANY(e.hospital_types) OR array_length(e.hospital_types, 1) IS NULL
    ORDER BY e.sort_order
  ),
  filtered_categories AS (
    SELECT cat.* FROM accreditation_categories cat
    ORDER BY cat.sort_order
  ),
  filtered_items AS (
    SELECT si.* FROM accreditation_survey_items si
    WHERE p_hospital_type IS NULL OR p_hospital_type = ANY(si.hospital_types) OR array_length(si.hospital_types, 1) IS NULL
    ORDER BY si.sort_order
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'code', a.code,
      'name', a.name,
      'name_en', a.name_en,
      'color', a.color,
      'chapters', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ch.id,
            'code', ch.code,
            'title', ch.title,
            'description', ch.description,
            'entries', COALESCE((
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', e.id,
                  'code', e.code,
                  'title', e.title,
                  'description', e.description,
                  'categories', COALESCE((
                    SELECT jsonb_agg(
                      jsonb_build_object(
                        'id', cat.id,
                        'name', cat.name,
                        'items', COALESCE((
                          SELECT jsonb_agg(
                            jsonb_build_object(
                              'id', si.id,
                              'code', si.code,
                              'title', si.title,
                              'description', si.description,
                              'assessment_method', si.assessment_method,
                              'sop_type', si.sop_type,
                              'is_pilot', si.is_pilot,
                              'severity', si.severity,
                              'is_mandatory', si.is_mandatory,
                              'required_evidence', si.required_evidence,
                              'category_id', si.category_id
                            ) ORDER BY si.sort_order
                          ) FROM filtered_items si WHERE si.category_id = cat.id
                        ), '[]'::JSONB)
                      ) ORDER BY cat.sort_order
                    ) FROM filtered_categories cat WHERE cat.entry_id = e.id
                  ), '[]'::JSONB),
                  'items', COALESCE((
                    SELECT jsonb_agg(
                      jsonb_build_object(
                        'id', si.id,
                        'code', si.code,
                        'title', si.title,
                        'description', si.description,
                        'assessment_method', si.assessment_method,
                        'sop_type', si.sop_type,
                        'is_pilot', si.is_pilot,
                        'severity', si.severity,
                        'is_mandatory', si.is_mandatory,
                        'required_evidence', si.required_evidence,
                        'category_id', si.category_id
                      ) ORDER BY si.sort_order
                    ) FROM filtered_items si WHERE si.entry_id = e.id AND si.category_id IS NULL
                  ), '[]'::JSONB)
                ) ORDER BY e.sort_order
              ) FROM filtered_entries e WHERE e.chapter_id = ch.id
            ), '[]'::JSONB)
          ) ORDER BY ch.sort_order
        ) FROM filtered_chapters ch WHERE ch.area_id = a.id
      ), '[]'::JSONB)
    ) ORDER BY a.sort_order
  ) INTO v_result FROM filtered_areas a;

  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$;

-- ============================================================
-- updated_at 트리거
-- ============================================================
CREATE OR REPLACE FUNCTION touch_accreditation_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_survey_items_updated_at ON accreditation_survey_items;
CREATE TRIGGER trg_survey_items_updated_at
  BEFORE UPDATE ON accreditation_survey_items
  FOR EACH ROW EXECUTE FUNCTION touch_accreditation_updated_at();
