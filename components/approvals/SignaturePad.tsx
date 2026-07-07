'use client';

import { useRef, useState } from 'react';

// signflow의 손글씨 서명 캔버스 이식 (마우스·터치 지원)
export default function SignaturePad({
  onSave,
  onCancel,
}: {
  onSave: (dataUrl: string) => void;
  onCancel?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasStroke, setHasStroke] = useState(false);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const ctx = () => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext('2d');
    if (c) {
      c.lineWidth = 2.5;
      c.lineCap = 'round';
      c.strokeStyle = '#1e293b';
    }
    return c;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = ctx();
    if (!c) return;
    const pos = getPos(e);
    c.beginPath();
    c.moveTo(pos.x, pos.y);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!drawing) return;
    const c = ctx();
    if (!c) return;
    const pos = getPos(e);
    c.lineTo(pos.x, pos.y);
    c.stroke();
    setHasStroke(true);
  };

  const stopDrawing = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext('2d');
    if (canvas && c) c.clearRect(0, 0, canvas.width, canvas.height);
    setHasStroke(false);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-slate-700">
        ✍️ 결재 서명 — 아래 칸에 서명을 그려주세요 (마우스/터치)
      </div>
      <canvas
        ref={canvasRef}
        width={440}
        height={140}
        className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 touch-none w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded px-3 py-1.5"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={clear}
          className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded px-3 py-1.5"
        >
          다시 쓰기
        </button>
        <button
          type="button"
          disabled={!hasStroke}
          onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) onSave(canvas.toDataURL('image/png'));
          }}
          className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 rounded px-4 py-1.5"
        >
          서명하고 승인
        </button>
      </div>
    </div>
  );
}
