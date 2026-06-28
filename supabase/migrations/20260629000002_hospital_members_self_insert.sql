-- 병원 생성자가 자기 자신을 첫 admin 멤버로 추가할 수 있는 정책
-- service_role 없이도 createHospital 동작하기 위해 필요

DO $$ BEGIN
  CREATE POLICY "hospital_members: 병원 생성자 자기자신 추가"
    ON hospital_members FOR INSERT
    WITH CHECK (
      user_id = auth.uid()
      AND role = 'admin'
      AND EXISTS (
        SELECT 1 FROM hospitals
        WHERE hospitals.id = hospital_id
          AND hospitals.created_by = auth.uid()
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
