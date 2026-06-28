'use client';

interface Segment {
  value: number;
  color: string;
}

interface Props {
  segments: Segment[];
  centerText?: string;
  size?: number;
  thickness?: number;
}

export default function DonutChart({ segments, centerText, size = 80, thickness = 10 }: Props) {
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  // 각 슬라이스의 dashArray / dashOffset 사전 계산
  let cumulativePct = 0;
  const slices = segments.map(seg => {
    const pct = total > 0 ? seg.value / total : 0;
    const dashArray = `${pct * circumference} ${(1 - pct) * circumference}`;
    const dashOffset = circumference * (1 - cumulativePct);
    cumulativePct += pct;
    return { color: seg.color, value: seg.value, dashArray, dashOffset };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* 배경 원 */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={thickness}
      />
      {/* 데이터 슬라이스 */}
      {total > 0 && slices.map((sl, i) =>
        sl.value > 0 ? (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={sl.color}
            strokeWidth={thickness}
            strokeDasharray={sl.dashArray}
            strokeDashoffset={sl.dashOffset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ) : null
      )}
      {/* 중앙 텍스트 */}
      {centerText && (
        <text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.floor(size * 0.2)}
          fontWeight="700"
          fill="#111827"
        >
          {centerText}
        </text>
      )}
    </svg>
  );
}
