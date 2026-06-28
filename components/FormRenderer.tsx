'use client';

interface FormRendererProps {
  title: string;
  usageGuide: string;
  templateMarkdown: string;
}

// 마크다운 표를 파싱해서 HTML 표로 변환
function parseMarkdownTable(markdown: string) {
  const lines = markdown.split('\n').filter(line => line.trim());
  const tables: string[][][] = [];
  let currentTable: string[][] = [];

  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      // 구분선 행 건너뜀 (|---|---|)
      if (line.replace(/[\|\-\s:]/g, '').length === 0) continue;
      const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      if (cells.length > 0) currentTable.push(cells);
    } else {
      if (currentTable.length > 0) {
        tables.push(currentTable);
        currentTable = [];
      }
    }
  }
  if (currentTable.length > 0) tables.push(currentTable);
  return tables;
}

export default function FormRenderer({ title, usageGuide, templateMarkdown }: FormRendererProps) {
  const tables = parseMarkdownTable(templateMarkdown);

  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden print:shadow-none">
      {/* 문서 제목 */}
      <div className="bg-gray-800 text-white text-center py-4 px-6">
        <h2 className="text-lg font-black tracking-wide">{title}</h2>
      </div>

      {/* 결재란 */}
      <div className="flex justify-end p-3 border-b border-gray-200 bg-gray-50">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              {['담당', '팀장', '부서장', '병원장'].map(h => (
                <th key={h} className="border border-gray-400 px-4 py-1 bg-gray-100 font-semibold text-gray-700 w-16 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {[0,1,2,3].map(i => (
                <td key={i} className="border border-gray-400 h-10 w-16" />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 작성 안내 */}
      {usageGuide && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 text-xs text-blue-700">
          💡 {usageGuide}
        </div>
      )}

      {/* 표 렌더링 */}
      <div className="p-4 space-y-4 overflow-x-auto">
        {tables.length > 0 ? (
          tables.map((table, tIdx) => (
            <table key={tIdx} className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-700 text-white">
                  {table[0].map((cell, cIdx) => (
                    <th
                      key={cIdx}
                      className="border border-gray-500 px-3 py-2 text-center font-semibold text-xs"
                      dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-gray-300 px-3 py-2.5 text-xs text-gray-800 align-top leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/□/g, '<span class="mr-1">□</span>') }}
                      />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))
        ) : (
          // 마크다운 표가 없으면 원본 텍스트 표시
          <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
            {templateMarkdown}
          </pre>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>문서번호: ___________</span>
        <span>개정일: ___________</span>
        <span>버전: 1.0</span>
      </div>
    </div>
  );
}
