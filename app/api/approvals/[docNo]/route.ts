import { NextResponse } from 'next/server';
import { decideApproval } from '@/lib/services/approval.service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ docNo: string }> },
) {
  try {
    const { docNo } = await params;
    const body = await request.json();
    if (!['approve', 'reject'].includes(body?.action)) {
      return NextResponse.json({ error: 'action은 approve 또는 reject여야 합니다.' }, { status: 400 });
    }
    const result = await decideApproval({
      docNo,
      action: body.action,
      signatureData: body.signatureData,
      rejectReason: body.rejectReason,
    });
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error('결재 처리 실패:', (e as Error).message);
    return NextResponse.json({ isMock: true }, { status: 200 });
  }
}
