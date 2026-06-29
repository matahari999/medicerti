-- Fix: get_accreditation_tree — wrap nested jsonb_agg with COALESCE
-- to prevent null chapters/entries/categories/items in the JSON result
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
