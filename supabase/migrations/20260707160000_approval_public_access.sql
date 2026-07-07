-- 전자결재 접근 정책 완화 (테스트 운영 단계)
-- 현재 앱은 결재 페이지가 로그인 없이 열리는 구조이므로 anon 접근을 허용한다.
-- ⚠️ 직원 계정 체계 도입 시 이 정책을 authenticated 전용으로 되돌리고
--    hospital_id 격리를 추가할 것.

drop policy if exists "approval_documents_authenticated" on public.approval_documents;
create policy "approval_documents_public" on public.approval_documents
  for all to anon, authenticated using (true) with check (true);

drop policy if exists "approval_steps_authenticated" on public.approval_steps;
create policy "approval_steps_public" on public.approval_steps
  for all to anon, authenticated using (true) with check (true);
