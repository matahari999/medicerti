// data.go.kr 계열 OpenAPI는 XML만 반환하는 오퍼레이션이 많아, 여기서 공통으로 사용할
// 최소 XML 파서를 둔다. 각 <item> 안의 필드는 중첩 없이 평평한 구조라 정규식으로 충분하다.

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

export function parseXmlItems(xml: string): Record<string, string>[] {
  const items: Record<string, string>[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemRegex.exec(xml))) {
    const fields: Record<string, string> = {};
    const fieldRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
    let fieldMatch: RegExpExecArray | null;
    while ((fieldMatch = fieldRegex.exec(itemMatch[1]))) {
      fields[fieldMatch[1]] = decodeXmlEntities(fieldMatch[2].trim());
    }
    items.push(fields);
  }
  return items;
}

export function parseXmlResultCode(xml: string): { resultCode: string | null; resultMsg: string | null } {
  const codeMatch = xml.match(/<resultCode>([\s\S]*?)<\/resultCode>/);
  const msgMatch = xml.match(/<resultMsg>([\s\S]*?)<\/resultMsg>/);
  return {
    resultCode: codeMatch ? codeMatch[1].trim() : null,
    resultMsg: msgMatch ? decodeXmlEntities(msgMatch[1].trim()) : null,
  };
}
