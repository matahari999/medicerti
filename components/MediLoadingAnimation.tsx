'use client';
import { useEffect, useState } from 'react';

const loadingMessages = [
  '인증기준을 분석하고 있어요...',
  '문서 구조를 설계하는 중이에요...',
  '서식과 체크리스트를 작성하고 있어요...',
  '내용을 다듬고 있어요...',
  '거의 다 됐어요!',
];

export default function MediLoadingAnimation() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIdx(i => (i + 1) % loadingMessages.length);
    }, 2200);
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => { clearInterval(msgTimer); clearInterval(dotTimer); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6">
      {/* 달리는 트랙 */}
      <div className="relative w-full max-w-xs h-20 overflow-hidden">
        {/* 트랙 라인 */}
        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-blue-100 rounded-full" />

        {/* 달리는 메디인 로고 */}
        <div className="absolute bottom-4 animate-medi-run">
          {/* 그림자 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-blue-200 rounded-full opacity-40 animate-shadow-pulse" />
          {/* 방패 아이콘 + 다리 */}
          <div className="animate-medi-bounce">
            <svg width="44" height="52" viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* 방패 몸통 */}
              <path d="M22 2L4 9V22C4 32 11 40 22 43C33 40 40 32 40 22V9L22 2Z" fill="url(#runGrad)" />
              <path d="M22 2L4 9V22C4 32 11 40 22 43C33 40 40 32 40 22V9L22 2Z" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none"/>
              {/* 십자 */}
              <rect x="19" y="11" width="6" height="20" rx="1.5" fill="white" fillOpacity="0.95"/>
              <rect x="12" y="18" width="20" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
              {/* 눈 (귀엽게) */}
              <circle cx="18" cy="19" r="1.2" fill="url(#runGrad)"/>
              <circle cx="26" cy="19" r="1.2" fill="url(#runGrad)"/>
              {/* 왼쪽 팔 */}
              <line x1="4" y1="22" x2="0" y2="28" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
              {/* 오른쪽 팔 */}
              <line x1="40" y1="22" x2="44" y2="16" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round"/>
              {/* 왼쪽 다리 */}
              <line x1="17" y1="42" x2="12" y2="52" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
              {/* 오른쪽 다리 */}
              <line x1="27" y1="42" x2="32" y2="48" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round"/>
              <defs>
                <linearGradient id="runGrad" x1="4" y1="2" x2="40" y2="43">
                  <stop offset="0%" stopColor="#60A5FA"/>
                  <stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* 발자국들 */}
        {[10, 30, 55, 75, 100, 130, 155, 180].map((x, i) => (
          <div
            key={i}
            className="absolute bottom-3 w-2 h-2 rounded-full bg-blue-200 opacity-60"
            style={{
              left: x,
              animationDelay: `${i * 0.15}s`,
              animation: 'footprint-fade 1.6s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      {/* 메시지 */}
      <div className="text-center space-y-1">
        <p className="font-bold text-blue-700 text-base">
          메디인이 생성중입니다{dots}
        </p>
        <p className="text-sm text-gray-400 transition-all duration-500">
          {loadingMessages[msgIdx]}
        </p>
      </div>

      {/* 진행 바 */}
      <div className="w-full max-w-xs h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-progress-bar" />
      </div>

      <style jsx>{`
        @keyframes medi-run {
          0%   { left: -60px; }
          100% { left: calc(100% + 10px); }
        }
        @keyframes medi-bounce {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes shadow-pulse {
          0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.4; }
          50%       { transform: translateX(-50%) scaleX(0.6); opacity: 0.2; }
        }
        @keyframes footprint-fade {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50%       { opacity: 0.6; transform: scale(1); }
        }
        @keyframes progress-bar {
          0%   { width: 5%; }
          20%  { width: 30%; }
          50%  { width: 60%; }
          80%  { width: 80%; }
          95%  { width: 92%; }
          100% { width: 92%; }
        }
        .animate-medi-run {
          animation: medi-run 2.5s linear infinite;
        }
        .animate-medi-bounce {
          animation: medi-bounce 0.5s ease-in-out infinite;
        }
        .animate-shadow-pulse {
          animation: shadow-pulse 0.5s ease-in-out infinite;
        }
        .animate-progress-bar {
          animation: progress-bar 15s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
