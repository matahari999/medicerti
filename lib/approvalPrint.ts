import type { DocumentApproval } from '@/stores/documentStore';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 결재 완료 문서 → 서명이 결재란에 찍힌 인쇄용 HTML
export function buildApprovalPrintHtml(doc: DocumentApproval): string {
  const stepCells = doc.steps
    .map(
      (s) => `
    <td class="appr-cell">
      <div class="appr-role">${esc(s.role)}</div>
      <div class="appr-sign">${
        s.signature
          ? `<img src="${s.signature}" alt="서명" />`
          : s.status === 'approved'
            ? '<span class="stamp">承認</span>'
            : s.status === 'rejected'
              ? '<span class="stamp reject">반려</span>'
              : ''
      }</div>
      <div class="appr-name">${esc(s.name)}</div>
      <div class="appr-date">${s.date ? esc(s.date) : '—'}</div>
    </td>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>${esc(doc.title)}</title>
<style>
@page { size: A4; margin: 18mm 14mm 16mm 14mm; }
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'맑은 고딕','나눔고딕',Arial,sans-serif;font-size:10pt;color:#000;line-height:1.6;padding:20px;}
.doc-header{border:2px solid #000;border-collapse:collapse;width:100%;margin-bottom:4px;}
.doc-header td{border:1px solid #000;padding:5px 8px;font-size:8.5pt;}
.doc-header .hd{background:#dce6f1;font-weight:700;width:80px;text-align:center;}
.title{font-size:15pt;font-weight:800;text-align:center;padding:12px 0;}
.appr-tbl{border-collapse:collapse;margin:0 0 14px auto;}
.appr-tbl td{border:1px solid #000;}
.appr-label{background:#dce6f1;font-weight:700;font-size:8.5pt;text-align:center;width:26px;padding:4px;}
.appr-cell{width:92px;text-align:center;vertical-align:top;}
.appr-role{background:#f1f5f9;font-size:8pt;font-weight:700;padding:2px;border-bottom:1px solid #000;}
.appr-sign{height:44px;display:flex;align-items:center;justify-content:center;}
.appr-sign img{max-height:40px;max-width:86px;}
.stamp{color:#b91c1c;font-weight:800;font-size:12pt;border:2px solid #b91c1c;border-radius:50%;padding:4px 6px;}
.stamp.reject{border-radius:4px;font-size:9pt;}
.appr-name{font-size:8pt;border-top:1px solid #000;padding:2px;}
.appr-date{font-size:7pt;color:#555;padding-bottom:2px;}
.content{white-space:pre-wrap;font-size:9.5pt;border:1px solid #cbd5e1;border-radius:4px;padding:14px;margin-top:6px;}
.reject-box{border:1.5px solid #b91c1c;background:#fef2f2;padding:8px 10px;margin-top:8px;font-size:8.5pt;color:#7f1d1d;}
.footer{margin-top:16px;font-size:7.5pt;color:#666;display:flex;justify-content:space-between;border-top:1px solid #ccc;padding-top:6px;}
@media print{ .no-print{display:none;} }
</style>
</head>
<body>
<div class="title">${esc(doc.title)}</div>

<table class="appr-tbl">
  <tr>
    <td class="appr-label" rowspan="1">결<br>재</td>
    ${stepCells}
  </tr>
</table>

<table class="doc-header">
  <tr>
    <td class="hd">문서번호</td><td>${esc(doc.id)}</td>
    <td class="hd">문서구분</td><td>${esc(doc.typeName)}</td>
    <td class="hd">버전</td><td>${esc(doc.version)}</td>
  </tr>
  <tr>
    <td class="hd">기안부서</td><td>${esc(doc.dept)}</td>
    <td class="hd">기안자</td><td>${esc(doc.requester)}</td>
    <td class="hd">기안일</td><td>${esc(doc.date)}</td>
  </tr>
  <tr>
    <td class="hd">결재상태</td><td colspan="5">${esc(doc.statusLabel)}</td>
  </tr>
</table>

${doc.rejectReason ? `<div class="reject-box"><b>반려 사유:</b> ${esc(doc.rejectReason)}</div>` : ''}

<div class="content">${esc(doc.content)}</div>

<div class="footer">
  <span>메디인증(medicerti.vercel.app) 전자결재 출력본</span>
  <span>출력일: ${new Date().toISOString().slice(0, 10)}</span>
</div>

<script>
  const btn = document.createElement('button');
  btn.textContent = '🖨 인쇄 / PDF 저장';
  btn.className = 'no-print';
  btn.style.cssText = 'position:fixed;top:10px;right:10px;padding:8px 16px;background:#1f3864;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;z-index:9999;';
  btn.onclick = () => window.print();
  document.body.appendChild(btn);
</script>
</body>
</html>`;
}
