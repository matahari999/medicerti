import { NextResponse } from 'next/server';
import { listApprovals, createApproval } from '@/lib/services/approval.service';

export async function GET() {
  try {
    const result = await listApprovals();
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error('결재 목록 조회 실패:', (e as Error).message);
    return NextResponse.json({ isMock: true }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body?.title || !Array.isArray(body?.steps)) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }
    const result = await createApproval(body);
    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error('결재 상신 실패:', (e as Error).message);
    return NextResponse.json({ isMock: true }, { status: 200 });
  }
}
