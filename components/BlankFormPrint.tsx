'use client';
import { GenerationResult } from '@/lib/types';

interface Props {
  result: GenerationResult;
}

const PRINT_CSS = `
  body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 20px; font-size: 11px; color: #111; }
  h2 { font-size: 14px; font-weight: 900; margin-bottom: 10px; text-align: center; }
  .approval { display: flex; justify-content: flex-end; margin-bottom: 12px; }
  .approval table { border-collapse: collapse; }
  .approval th { border: 1px solid #888; padding: 4px 16px; background: #f3f4f6; font-weight: 700; text-align: center; min-width: 60px; font-size: 11px; }
  .approval td { border: 1px solid #888; height: 40px; min-width: 60px; }
  table.main { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
  table.main th { border: 1px solid #555; padding: 6px 8px; background: #374151; color: white; text-align: center; font-size: 11px; }
  table.main td { border: 1px solid #aaa; padding: 5px 8px; font-size: 11px; min-height: 28px; }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb; }
  @media print { body { padding: 10px; } }
`;

function approvalHtml() {
  return `<div class="approval"><table><tr><th>담당</th><th>팀장</th><th>부서장</th><th>병원장</th></tr><tr><td></td><td></td><td></td><td></td></tr></table></div>`;
}
function footerHtml() {
  return `<div class="footer"><span>문서번호: ___________</span><span>작성일: ___________</span><span>작성자: ___________</span></div>`;
}
function openPrint(title: string, bodyHtml: string) {
  const w = window.open('', '_blank');
  if (!w) { alert('팝업이 차단되어 있습니다.\n브라우저 주소창 오른쪽 팝업 허용 후 다시 눌러주세요.'); return; }
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${PRINT_CSS}</style></head><body>${bodyHtml}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// 테이블 DOM에서 현재 입력값 읽어서 인쇄
function printFromDom(tableId: string, title: string) {
  const table = document.getElementById(tableId) as HTMLTableElement | null;
  if (!table) return;
  const headerCells = Array.from(table.querySelectorAll('thead th'));
  const headerHtml = headerCells.map(th => `<th>${(th as HTMLElement).innerText}</th>`).join('');
  const bodyRows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
    `<tr>${Array.from(tr.querySelectorAll('td')).map(td =>
      `<td>${(td as HTMLElement).innerText || ''}</td>`
    ).join('')}</tr>`
  ).join('');
  openPrint(title, `<h2>${title}</h2>${approvalHtml()}<table class="main"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyRows}</tbody></table>${footerHtml()}`);
}

// 마크다운 표 헤더 추출
function extractHeaders(md: string): string[] {
  if (!md) return [];
  for (const line of md.split('\n')) {
    const t = line.trim();
    if (t.startsWith('|') && t.replace(/[\|\-\s:]/g, '').length > 0)
      return t.split('|').map(c => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
  }
  return [];
}

// 카드 공통 래퍼
function FormCard({ title, tableId, onPrint, children }: {
  title: string; tableId: string;
  onPrint: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-700 text-white flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold">{title}</span>
        <button onClick={onPrint}
          className="text-xs bg-white text-gray-800 px-4 py-1.5 rounded font-bold hover:bg-gray-100 transition-colors">
          인쇄
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function BlankFormPrint({ result }: Props) {
  const docName = result.summaryCard?.documentName || '서식';
  const formTitle = result.blankForm?.formTitle || docName;
  const headers = (() => {
    const h = extractHeaders(result.blankForm?.templateMarkdown || '');
    return h.length > 0 ? h : ['항목', '내용', '담당자', '일자', '비고'];
  })();
  const checklist = result.checklist || [];

  const CELL_STYLE = 'border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:bg-blue-50';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-700">
        각 칸을 클릭하면 바로 입력할 수 있습니다. 작성 후 <strong>인쇄</strong> 버튼을 눌러 출력하세요.
      </div>

      {/* 빈 양식 */}
      <FormCard
        title={`빈 양식 — ${formTitle}`}
        tableId="editable-form-table"
        onPrint={() => printFromDom('editable-form-table', `빈 양식 — ${formTitle}`)}
      >
        <div className="overflow-x-auto">
          <table id="editable-form-table" className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-700 text-white">
                {headers.map((h, i) => (
                  <th key={i} className="border border-gray-500 px-3 py-2 text-center">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, r) => (
                <tr key={r} className={r % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {headers.map((_, c) => (
                    <td
                      key={c}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={`${CELL_STYLE} ${c === 0 ? 'w-8 text-center text-gray-400' : ''}`}
                      style={{ minHeight: '28px', minWidth: c === 0 ? '32px' : '72px' }}
                    >
                      {c === 0 ? String(r + 1) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormCard>

      {/* 빈 체크리스트 */}
      {checklist.length > 0 && (
        <FormCard
          title={`빈 체크리스트 — ${docName}`}
          tableId="editable-checklist-table"
          onPrint={() => printFromDom('editable-checklist-table', `빈 체크리스트 — ${docName}`)}
        >
          <div className="overflow-x-auto">
            <table id="editable-checklist-table" className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="border border-gray-500 px-2 py-2 w-8">번호</th>
                  <th className="border border-gray-500 px-3 py-2">점검항목</th>
                  <th className="border border-gray-500 px-2 py-2 w-16">주기</th>
                  <th className="border border-gray-500 px-2 py-2 w-20">담당부서</th>
                  <th className="border border-gray-500 px-2 py-2 w-16 bg-gray-500">결과</th>
                  <th className="border border-gray-500 px-2 py-2 bg-gray-500">조치사항</th>
                </tr>
              </thead>
              <tbody>
                {checklist.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className={`${CELL_STYLE} text-center text-gray-400`}>{i + 1}</td>
                    <td
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={CELL_STYLE}
                    >{item.item}</td>
                    <td
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={`${CELL_STYLE} text-center`}
                    >{item.frequency}</td>
                    <td
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={`${CELL_STYLE} text-center`}
                    >{item.responsibleDepartment}</td>
                    {/* 결과 - 빈칸 */}
                    <td
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={`${CELL_STYLE} bg-yellow-50`}
                      style={{ minHeight: '28px' }}
                    ></td>
                    {/* 조치사항 - 빈칸 */}
                    <td
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={`${CELL_STYLE} bg-yellow-50`}
                      style={{ minHeight: '28px' }}
                    ></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FormCard>
      )}

      {/* 빈 기록지 */}
      <FormCard
        title={`빈 기록지 — ${docName}`}
        tableId="editable-record-table"
        onPrint={() => printFromDom('editable-record-table', `빈 기록지 — ${docName}`)}
      >
        <div className="overflow-x-auto">
          <table id="editable-record-table" className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="border border-gray-500 px-2 py-2 w-8">번호</th>
                <th className="border border-gray-500 px-3 py-2 w-24">일시</th>
                <th className="border border-gray-500 px-3 py-2">내용</th>
                <th className="border border-gray-500 px-2 py-2 w-16">담당자</th>
                <th className="border border-gray-500 px-2 py-2 w-12">서명</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 15 }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className={`${CELL_STYLE} text-center text-gray-400`}>{i + 1}</td>
                  {[0,1,2,3].map(c => (
                    <td
                      key={c}
                      contentEditable={true}
                      suppressContentEditableWarning={true}
                      className={CELL_STYLE}
                      style={{ minHeight: '28px' }}
                    ></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormCard>
    </div>
  );
}
