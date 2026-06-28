'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type IngestStatus = 'idle' | 'running' | 'done' | 'error';

interface IngestResult {
  total: number;
  processed: number;
  failed: number;
}

export function IngestButton() {
  const [status, setStatus] = useState<IngestStatus>('idle');
  const [result, setResult] = useState<IngestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIngest = async () => {
    if (status === 'running') return;
    setStatus('running');
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/ingest', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setResult(data);
      setStatus('done');
    } catch (e: any) {
      setError(e.message ?? '알 수 없는 오류');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleIngest}
        disabled={status === 'running'}
        className="gap-2"
      >
        {status === 'running' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        {status === 'running' ? '임베딩 처리 중...' : '인증기준 임베딩 실행'}
      </Button>

      {status === 'done' && result && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">완료</p>
            <p>전체 {result.total}건 중 {result.processed}건 성공
              {result.failed > 0 ? `, ${result.failed}건 실패` : ''}
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">오류 발생</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
