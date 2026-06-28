// 프롬프트 인젝션 시도 패턴
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions?|prompts?|rules?)/gi,
  /\bsystem\s*:/gi,
  /\buser\s*:/gi,
  /\bassistant\s*:/gi,
  /<\|(?:im_start|im_end|endoftext)\|>/gi,
  /\[INST\]|\[\/INST\]/gi,
];

export function sanitizeAiInput(input: string, maxLength = 3000): string {
  let result = input.slice(0, maxLength);
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '[필터됨]');
  }
  return result.trim();
}

export function sanitizeErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    // DB 연결 정보, 스택 트레이스 등 내부 정보 제거
    const msg = err.message;
    if (
      msg.includes('postgresql://') ||
      msg.includes('prisma') ||
      msg.includes('database') ||
      msg.includes('ECONNREFUSED')
    ) {
      return '데이터베이스 오류가 발생했습니다.';
    }
    // 일반적인 에러 메시지만 반환 (스택 트레이스 제외)
    return msg.slice(0, 200);
  }
  return '처리 중 오류가 발생했습니다.';
}
