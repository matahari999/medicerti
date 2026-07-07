// guidelines/ 하위 인증기준 PDF에서 텍스트를 추출해 raw_text.txt로 저장
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const G = path.join(__dirname, '..', 'guidelines');

const TARGETS = [
  ['nursing-4th', '붙임2. 4주기 요양병원 인증기준(Ver. 4.1) (1).pdf'],
  ['acute-5th', '붙임1. 급성기병원 인증기준 Ver. 5.0(2025.12.공표).pdf'],
  ['dental-4th', '붙임2. 4주기 치과병원 인증기준(Ver. 4.1) (2).pdf'],
  ['rehab-2nd', '붙임2. 2주기 재활의료기관 인증기준(Ver. 2.1) (1).pdf'],
  ['basic-1st', '붙임1. 기본 인증기준 Ver. 1.0(2025.12.공표).pdf'],
  ['basic-1st', '붙임1. 기본 인증기준 규정 사례집(Ver. 1.0)(2026. 3. 30.)(수정) (1).pdf', 'casebook_raw_text.txt'],
];

(async () => {
  for (const [dir, file, outName] of TARGETS) {
    const src = path.join(G, dir, file);
    const out = path.join(G, dir, outName || 'raw_text.txt');
    try {
      const data = await pdfParse(fs.readFileSync(src));
      fs.writeFileSync(out, data.text, 'utf-8');
      console.log(`OK  ${dir} → ${path.basename(out)} (${data.numpages}p, ${data.text.length.toLocaleString()} chars)`);
    } catch (e) {
      console.error(`FAIL ${dir}/${file}: ${e.message}`);
    }
  }
})();
