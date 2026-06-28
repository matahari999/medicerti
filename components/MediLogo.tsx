// 메디인증 전용 로고 아이콘
export default function MediLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 방패 배경 */}
      <path
        d="M20 3L5 9V20C5 28.5 11.5 35.5 20 38C28.5 35.5 35 28.5 35 20V9L20 3Z"
        fill="url(#shieldGrad)"
      />
      {/* 방패 테두리 */}
      <path
        d="M20 3L5 9V20C5 28.5 11.5 35.5 20 38C28.5 35.5 35 28.5 35 20V9L20 3Z"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.4"
        fill="none"
      />
      {/* 십자가 (의료) */}
      <rect x="17" y="11" width="6" height="18" rx="1.5" fill="white" fillOpacity="0.95"/>
      <rect x="11" y="17" width="18" height="6" rx="1.5" fill="white" fillOpacity="0.95"/>
      {/* 중앙 작은 원 */}
      <circle cx="20" cy="20" r="3" fill="url(#shieldGrad)" />
      <defs>
        <linearGradient id="shieldGrad" x1="5" y1="3" x2="35" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#1D4ED8"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
