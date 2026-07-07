-- 전자결재 시스템: 결재 문서 + 순차 결재 단계 (손글씨 서명 포함)
create table if not exists public.approval_documents (
  id uuid primary key default gen_random_uuid(),
  doc_no text not null unique,                 -- 표시용 문서번호 (APP-2026-0001)
  title text not null,
  doc_type text not null default 'regulation',
  type_name text not null default '규정집',
  dept text not null default '',
  requester text not null default '',
  content text not null default '',
  form_html text,                              -- 서식류인 경우 인쇄용 HTML
  status text not null default 'in_progress' check (status in ('in_progress','rejected','completed')),
  reject_reason text,
  version text not null default 'v1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.approval_steps (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.approval_documents(id) on delete cascade,
  step_order int not null,
  role text not null,                          -- 기안자 / 1차 검토자 / 최종 승인자
  approver_name text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  signature_data text,                         -- 손글씨 서명 (dataURL)
  decided_at timestamptz
);

create index if not exists idx_approval_steps_doc on public.approval_steps(document_id, step_order);
create index if not exists idx_approval_documents_status on public.approval_documents(status, created_at desc);

alter table public.approval_documents enable row level security;
alter table public.approval_steps enable row level security;

-- 서버 API는 service_role로 접근(RLS 우회). 클라이언트 직접 접근은 로그인 사용자만 허용.
drop policy if exists "approval_documents_authenticated" on public.approval_documents;
create policy "approval_documents_authenticated" on public.approval_documents
  for all to authenticated using (true) with check (true);

drop policy if exists "approval_steps_authenticated" on public.approval_steps;
create policy "approval_steps_authenticated" on public.approval_steps
  for all to authenticated using (true) with check (true);
