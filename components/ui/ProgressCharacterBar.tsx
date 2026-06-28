'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ProgressCharacterBarProps {
  duration?: number; // 애니메이션 지속 시간 (ms)
  onComplete?: () => void;
  className?: string;
  label?: string;
}

export function ProgressCharacterBar({
  duration = 1500,
  onComplete,
  className,
  label = '작업을 안전하게 처리하고 있습니다...'
}: ProgressCharacterBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(current);
      
      if (current >= 100) {
        clearInterval(interval);
        if (onComplete) {
          setTimeout(onComplete, 200); // 100% 도달 후 200ms 뒤 완료 콜백
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <div className={cn("w-full space-y-4 py-6 px-4 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-100 shadow-inner", className)}>
      <div className="relative h-14 w-full overflow-hidden">
        {/* 캐릭터 (MediBear) - progress에 따라 left 값 변화 */}
        <div 
          className="absolute bottom-0 transition-all duration-300 ease-out flex flex-col items-center"
          style={{ 
            left: `calc(${progress}% - 20px)`,
            transform: 'translateY(-2px)'
          }}
        >
          {/* 말풍선 */}
          <div className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-md mb-1 shadow-md relative animate-bounce whitespace-nowrap">
            {progress < 30 ? '출발합니다!' : progress < 70 ? '지표 분석 중..' : progress < 100 ? '거의 다 왔어요!' : '완료!'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          </div>

          {/* 귀여운 곰 SVG 캐릭터 (의사 가운 + 청진기 장착) */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 40 40"
            fill="none"
            style={{
              animation: 'wiggle 0.5s ease-in-out infinite alternate'
            }}
          >
            {/* 귀 */}
            <circle cx="12" cy="12" r="5" fill="#94a3b8" />
            <circle cx="12" cy="12" r="2.5" fill="#e2e8f0" />
            <circle cx="28" cy="12" r="5" fill="#94a3b8" />
            <circle cx="28" cy="12" r="2.5" fill="#e2e8f0" />
            
            {/* 얼굴 */}
            <circle cx="20" cy="22" r="12" fill="#cbd5e1" />
            
            {/* 볼터치 */}
            <circle cx="13" cy="24" r="1.5" fill="#f43f5e" fillOpacity="0.6" />
            <circle cx="27" cy="24" r="1.5" fill="#f43f5e" fillOpacity="0.6" />
            
            {/* 눈 */}
            <circle cx="16" cy="20" r="1.5" fill="#1e293b" />
            <circle cx="24" cy="20" r="1.5" fill="#1e293b" />
            
            {/* 코와 입 */}
            <ellipse cx="20" cy="24" rx="2.5" ry="1.8" fill="#e2e8f0" />
            <circle cx="20" cy="23.5" r="1" fill="#0f172a" />
            <path d="M19 25.5C19.5 26 20.5 26 21 25.5" stroke="#0f172a" strokeWidth="0.8" strokeLinecap="round" />
            
            {/* 의사 캡(모자) */}
            <path d="M15 13C17 11 23 11 25 13L26 15H14L15 13Z" fill="#2563eb" />
            <path d="M19 14.5H21M20 13.5V15.5" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 로딩바 */}
      <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 텍스트 정보 */}
      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
        <span className="animate-pulse">{label}</span>
        <span className="font-extrabold text-slate-700">{Math.round(progress)}%</span>
      </div>
      
      {/* CSS Wiggle 애니메이션 정의 */}
      <style jsx>{`
        @keyframes wiggle {
          0% { transform: rotate(-6deg) translateY(0); }
          100% { transform: rotate(6deg) translateY(-2px); }
        }
        svg {
          transform-origin: bottom center;
        }
      `}</style>
    </div>
  );
}
