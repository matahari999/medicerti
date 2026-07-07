import { createClient, createServiceClient } from '@/lib/supabase/server';
import type { DocumentApproval, ApprovalStep } from '@/stores/documentStore';

// 서비스 키가 설정돼 있으면 사용(RLS 우회), 없으면 요청자 세션 기반 클라이언트
async function getDb() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createServiceClient()
    : createClient();
}

// 테이블 미생성/DB 미설정 시 데모(localStorage) 모드로 폴백하기 위한 판별
function isTableMissing(e: unknown): boolean {
  const err = e as { code?: string; message?: string } | null;
  return !!err && (err.code === '42P01' || /does not exist|schema cache/.test(err.message || ''));
}

const STATUS_LABELS: Record<string, string> = {
  in_progress: '검토 중',
  rejected: '반려',
  completed: '완료',
};

function fmtDate(iso: string | null): string | null {
  if (!iso) return null;
  const t = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(t.getMonth() + 1)}-${p(t.getDate())} ${p(t.getHours())}:${p(t.getMinutes())}`;
}

interface StepRow {
  step_order: number;
  role: string;
  approver_name: string;
  status: 'pending' | 'approved' | 'rejected';
  signature_data: string | null;
  decided_at: string | null;
}

interface DocRow {
  id: string;
  doc_no: string;
  title: string;
  doc_type: string;
  type_name: string;
  dept: string;
  requester: string;
  content: string;
  form_html: string | null;
  status: 'in_progress' | 'rejected' | 'completed';
  reject_reason: string | null;
  version: string;
  created_at: string;
  approval_steps: StepRow[];
}

function mapDoc(row: DocRow): DocumentApproval {
  const steps: ApprovalStep[] = [...row.approval_steps]
    .sort((a, b) => a.step_order - b.step_order)
    .map((s) => ({
      role: s.role,
      name: s.approver_name,
      status: s.status,
      date: fmtDate(s.decided_at),
      signature: s.signature_data,
    }));
  return {
    id: row.doc_no,
    title: row.title,
    type: row.doc_type as DocumentApproval['type'],
    typeName: row.type_name,
    dept: row.dept,
    requester: row.requester,
    date: row.created_at.slice(0, 10),
    content: row.content,
    status: row.status,
    statusLabel: STATUS_LABELS[row.status] || row.status,
    rejectReason: row.reject_reason || undefined,
    steps,
    version: row.version,
    formats: ['pdf'],
  };
}

const SELECT = '*, approval_steps(*)';

export async function listApprovals() {
  try {
    const supabase = await getDb();
    const { data, error } = await supabase
      .from('approval_documents')
      .select(SELECT)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const docs = (data as unknown as DocRow[]).map(mapDoc);
    return {
      isMock: false,
      pending: docs.filter((d) => d.status === 'in_progress'),
      sent: docs,
      completed: docs.filter((d) => d.status === 'completed'),
    };
  } catch (e) {
    if (isTableMissing(e)) return { isMock: true };
    throw e;
  }
}

export async function createApproval(input: {
  title: string;
  type: string;
  typeName: string;
  dept: string;
  requester: string;
  content: string;
  formHtml?: string;
  steps: { role: string; name: string }[];
}) {
  try {
    const supabase = await getDb();
    const docNo = `APP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const { data: doc, error } = await supabase
      .from('approval_documents')
      .insert([{
        doc_no: docNo,
        title: input.title,
        doc_type: input.type,
        type_name: input.typeName,
        dept: input.dept,
        requester: input.requester,
        content: input.content,
        form_html: input.formHtml || null,
      }])
      .select('id')
      .single();
    if (error) throw error;

    const stepRows = [
      { document_id: doc.id, step_order: 0, role: '기안자', approver_name: input.requester, status: 'approved', decided_at: new Date().toISOString() },
      ...input.steps.map((s, i) => ({
        document_id: doc.id, step_order: i + 1, role: s.role, approver_name: s.name, status: 'pending',
      })),
    ];
    const { error: stepErr } = await supabase.from('approval_steps').insert(stepRows);
    if (stepErr) throw stepErr;

    return { isMock: false, docNo };
  } catch (e) {
    if (isTableMissing(e)) return { isMock: true };
    throw e;
  }
}

export async function decideApproval(input: {
  docNo: string;
  action: 'approve' | 'reject';
  signatureData?: string;
  rejectReason?: string;
}) {
  try {
    const supabase = await getDb();
    const { data, error } = await supabase
      .from('approval_documents')
      .select(SELECT)
      .eq('doc_no', input.docNo)
      .single();
    if (error) throw error;
    const row = data as unknown as DocRow;
    if (row.status !== 'in_progress') return { isMock: false, error: '이미 처리된 문서입니다.' };

    // 순차 결재: 첫 번째 대기 단계만 처리
    const pendingSteps = [...row.approval_steps]
      .sort((a, b) => a.step_order - b.step_order)
      .filter((s) => s.status === 'pending');
    const target = pendingSteps[0] as (StepRow & { id?: string }) | undefined;
    if (!target) return { isMock: false, error: '처리할 결재 단계가 없습니다.' };

    const now = new Date().toISOString();
    const { error: stepErr } = await supabase
      .from('approval_steps')
      .update({
        status: input.action === 'approve' ? 'approved' : 'rejected',
        signature_data: input.signatureData || null,
        decided_at: now,
      })
      .eq('document_id', row.id)
      .eq('step_order', target.step_order);
    if (stepErr) throw stepErr;

    const isLast = pendingSteps.length === 1;
    const nextStatus = input.action === 'reject' ? 'rejected' : isLast ? 'completed' : 'in_progress';
    const { error: docErr } = await supabase
      .from('approval_documents')
      .update({
        status: nextStatus,
        reject_reason: input.action === 'reject' ? input.rejectReason || '' : null,
        updated_at: now,
      })
      .eq('id', row.id);
    if (docErr) throw docErr;

    return { isMock: false, status: nextStatus };
  } catch (e) {
    if (isTableMissing(e)) return { isMock: true };
    throw e;
  }
}
