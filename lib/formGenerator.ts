import { QpicItem } from './qpicData';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  all: '전체 공통', acute: '급성기병원', nursing: '요양병원',
  psychiatric: '정신병원', rehabilitation: '재활병원', dental: '치과병원', korean: '한방병원',
};

interface HeaderArgs {
  title: string;
  formNo: string;
  version: string;
  date: string;
  related: string;
  target: string;
}

// NOTE: header()는 반드시 footer()와 쌍으로 사용해야 함 — form-wrap div를 header에서 열고 footer에서 닫음
function header({ title, formNo, version, date, related, target }: HeaderArgs) {
  return `
<div class="form-wrap">
<table class="header-tbl">
  <tr>
    <td class="logo-cell" rowspan="3">메디인증<br>MEDICERTI</td>
    <td class="title-cell" rowspan="3"><span class="main-title">${esc(title)}</span></td>
    <td class="meta-label">문서번호</td><td class="meta-val">${esc(formNo)}</td>
  </tr>
  <tr><td class="meta-label">개정일자</td><td class="meta-val">${esc(date)}</td></tr>
  <tr><td class="meta-label">관련기준</td><td class="meta-val">${esc(related)}</td></tr>
</table>
<table class="approval-tbl">
  <tr>
    <td class="appr-label">결재</td>
    <td class="appr-role">작성<div class="sign-box"></div></td>
    <td class="appr-role">검토<div class="sign-box"></div></td>
    <td class="appr-role">승인<div class="sign-box"></div></td>
    <td class="appr-info">개정차수: ${esc(version)}<br>적용부서: ${esc(target)}<br>페이지: 1 of 1</td>
  </tr>
</table>`;
}

function footer(source: string) {
  return `
<div class="form-footer">
  <span>제공: ${esc(source)} | 메디인증(medicerti-v2.vercel.app)</span>
  <span>본 서식은 참고용이며 병원 내부 규정에 맞추어 수정 후 활용하십시오.</span>
</div>
</div>`;
}

// ── 공통 CSS ──────────────────────────────────────────────────────────
const CSS = `
<style>
@page { size: A4; margin: 18mm 14mm 16mm 14mm; }
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'맑은 고딕','나눔고딕',Arial,sans-serif;font-size:9pt;color:#000;line-height:1.45;}
.form-wrap{width:100%;}

/* ── 헤더 테이블 ── */
.header-tbl{width:100%;border-collapse:collapse;border:2px solid #000;}
.header-tbl td{border:1px solid #000;padding:4px 7px;vertical-align:middle;}
.logo-cell{width:90px;text-align:center;font-weight:700;font-size:9.5pt;background:#1f3864;color:#fff;border-right:2px solid #000;}
.title-cell{text-align:center;vertical-align:middle;}
.main-title{font-size:13pt;font-weight:700;}
.meta-label{width:65px;background:#dce6f1;font-weight:600;font-size:8pt;text-align:center;}
.meta-val{width:140px;font-size:8pt;}

/* ── 결재 테이블 ── */
.approval-tbl{width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;margin-bottom:6px;}
.approval-tbl td{border:1px solid #000;padding:3px 6px;font-size:8pt;vertical-align:top;}
.appr-label{width:35px;background:#dce6f1;text-align:center;font-weight:700;vertical-align:middle;}
.appr-role{width:75px;text-align:center;font-weight:600;}
.sign-box{height:38px;border:1px dashed #aaa;margin:2px 4px;background:#f9f9f9;}
.appr-info{color:#444;font-size:7.5pt;line-height:1.7;}

/* ── 공통 섹션 타이틀 ── */
.sec-title{background:#1f3864;color:#fff;padding:4px 10px;font-weight:700;font-size:9pt;margin:8px 0 0 0;}
.sec-sub{background:#dce6f1;padding:3px 8px;font-weight:600;font-size:8.5pt;border:1px solid #000;border-top:none;}
.info-box{border:1px solid #000;border-top:none;padding:5px 10px;font-size:8.5pt;background:#fafafa;margin-bottom:6px;}

/* ── 데이터 테이블 ── */
table.data{width:100%;border-collapse:collapse;margin-top:4px;font-size:8.5pt;}
table.data th{background:#dce6f1;border:1px solid #000;padding:4px 3px;text-align:center;font-weight:700;font-size:8pt;}
table.data td{border:1px solid #000;padding:3px 5px;vertical-align:middle;min-height:22px;}
table.data td.c{text-align:center;}
table.data td.hd{background:#f0f0f0;font-weight:600;text-align:center;}
table.data tr.data-r td{height:22px;}
table.data tr.tall td{height:40px;}
.check-o{font-size:12pt;}

/* ── 푸터 ── */
.form-footer{margin-top:8px;border-top:1px solid #888;padding-top:5px;font-size:7pt;color:#666;display:flex;justify-content:space-between;}

@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style>`;

// ── 서식 생성 함수들 ────────────────────────────────────────────────────

function makeQpsTemp1() {
  const rows = Array.from({ length: 8 }, () =>
    `<tr class="data-r"><td class="c"></td><td></td><td class="c"></td><td class="c"></td><td></td><td></td><td></td></tr>`
  ).join('');
  return `
<div class="sec-title">■ 1. 기본 정보</div>
<table class="data">
  <tr>
    <td class="hd" style="width:80px">보고일시</td><td></td>
    <td class="hd" style="width:70px">보고자</td><td></td>
    <td class="hd" style="width:70px">소속부서</td><td></td>
  </tr>
  <tr>
    <td class="hd">사고 발생일시</td><td></td>
    <td class="hd">사고 발생장소</td><td></td>
    <td class="hd">관련 환자번호</td><td></td>
  </tr>
  <tr>
    <td class="hd">환자 나이/성별</td><td></td>
    <td class="hd">진료과</td><td></td>
    <td class="hd">주치의</td><td></td>
  </tr>
</table>

<div class="sec-title">■ 2. 사고 유형 (해당 항목에 ✓ 표시)</div>
<table class="data">
  <tr>
    <td style="width:25%">☐ 낙상/낙상 직전 (Near Miss)</td>
    <td style="width:25%">☐ 투약 오류</td>
    <td style="width:25%">☐ 수혈 관련 오류</td>
    <td style="width:25%">☐ 검사/처치 오류</td>
  </tr>
  <tr>
    <td>☐ 의료기기/장비 오작동</td>
    <td>☐ 수술/시술 관련 사고</td>
    <td>☐ 압박궤양(욕창) 발생</td>
    <td>☐ 기타: ________</td>
  </tr>
</table>

<div class="sec-title">■ 3. 사고 경위 및 상세 내용</div>
<table class="data">
  <tr><td class="hd" style="width:120px">사고 경위<br>(육하원칙으로 기술)</td>
    <td style="height:70px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">환자에게<br>미친 영향</td>
    <td style="height:40px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">즉각 취한<br>조치 내용</td>
    <td style="height:40px;vertical-align:top;padding:6px;"></td></tr>
</table>

<div class="sec-title">■ 4. 원인 분석 (해당 항목에 ✓ 표시 — 복수 선택 가능)</div>
<table class="data">
  <tr>
    <td>☐ 인력 부족/과부하</td>
    <td>☐ 소통·인계 오류</td>
    <td>☐ 절차·프로세스 미준수</td>
    <td>☐ 교육·훈련 미흡</td>
  </tr>
  <tr>
    <td>☐ 시설·환경 문제</td>
    <td>☐ 의료기기·장비 결함</td>
    <td>☐ 환자 비협조</td>
    <td>☐ 기타: ________</td>
  </tr>
</table>

<div class="sec-title">■ 5. 개선 대책</div>
<table class="data">
  <tr><td class="hd" style="width:120px">단기 개선 대책<br>(즉시 시행)</td>
    <td style="height:40px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">장기 개선 대책<br>(1개월 내)</td>
    <td style="height:40px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">부서장 확인 및 의견</td>
    <td style="height:30px;vertical-align:top;padding:6px;"></td></tr>
</table>`;
}

function makeQpsTemp2() {
  return `
<div class="sec-title">■ Morse Fall Scale (MFS) 낙상위험도 평가</div>
<table class="data">
  <tr>
    <th style="width:30px">No.</th><th>평가 항목</th><th style="width:90px">세부 기준</th><th style="width:50px">점수</th><th style="width:70px">해당 점수</th>
  </tr>
  <tr><td class="c">1</td><td>낙상 병력 (최근 3개월)</td><td>없음</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>있음</td><td class="c">25</td><td class="c"></td></tr>
  <tr><td class="c">2</td><td>이차 진단 (2가지 이상 진단)</td><td>없음</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>있음</td><td class="c">15</td><td class="c"></td></tr>
  <tr><td class="c">3</td><td>보행 보조기구 사용</td><td>없음/침상안정/간호사 부축</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>목발/지팡이/보행기</td><td class="c">15</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>가구 붙잡고 이동</td><td class="c">30</td><td class="c"></td></tr>
  <tr><td class="c">4</td><td>정맥주사/헤파린잠금 여부</td><td>없음</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>있음</td><td class="c">20</td><td class="c"></td></tr>
  <tr><td class="c">5</td><td>보행 상태</td><td>정상/침상안정/휠체어</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>허약한 보행</td><td class="c">10</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>보행 장애</td><td class="c">20</td><td class="c"></td></tr>
  <tr><td class="c">6</td><td>인지 상태</td><td>자신의 기동성을 인지함</td><td class="c">0</td><td class="c"></td></tr>
  <tr><td class="c"></td><td></td><td>자신의 기동성을 망각/과대평가</td><td class="c">15</td><td class="c"></td></tr>
  <tr><td colspan="4" class="hd" style="text-align:right;padding-right:20px;">합계 점수</td><td class="c" style="font-weight:700;font-size:11pt;"></td></tr>
</table>

<div class="info-box" style="margin-top:4px;">
  <b>판정 기준:</b>&nbsp; 0~24점: 저위험 / 25~44점: 중위험 → 표준 낙상 예방 중재 적용 / 45점 이상: 고위험 → 집중 낙상 예방 중재 적용
</div>

<div class="sec-title">■ 예방 활동 체크리스트 (해당 항목 ✓)</div>
<table class="data">
  <tr><th style="width:30px">No.</th><th>낙상 예방 활동 항목</th><th style="width:70px">시행여부</th><th style="width:80px">확인 간호사</th></tr>
  ${['침대 높이 최저로 설정 및 사이드레일 올림 확인',
    '콜벨이 환자 손에 닿는 위치에 있는지 확인',
    '미끄럼 방지 신발 착용 교육 및 제공',
    '욕실·화장실 내 안전 손잡이 점검 및 환자 안내',
    '야간 조명(야간등) 작동 확인',
    '필요 시 억제대 사용 여부 검토 및 설명',
    '낙상 위험 경고 표지판 부착 (침상 및 병실 입구)',
    '환자/보호자 낙상 예방 교육 실시 및 서명 수령'].map((t, i) =>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td><td class="c">☐ 예 &nbsp;☐ 아니오</td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 정기 평가 이력</div>
<table class="data">
  <tr><th>평가일</th><th>MFS 점수</th><th>위험 등급</th><th style="width:150px">중재 적용 내용 요약</th><th>평가자 서명</th></tr>
  ${Array.from({length:5},()=>`<tr class="data-r"><td></td><td class="c"></td><td class="c"></td><td></td><td></td></tr>`).join('')}
</table>`;
}

function makeQpsTemp3() {
  return `
<div class="sec-title">■ 1. FMEA 팀 구성 및 분석 대상</div>
<table class="data">
  <tr><td class="hd" style="width:110px">분석 대상 프로세스</td><td colspan="3"></td></tr>
  <tr><td class="hd">팀 리더</td><td></td><td class="hd" style="width:80px">작성일</td><td></td></tr>
  <tr><td class="hd">팀원</td><td colspan="3"></td></tr>
  <tr><td class="hd">분석 기간</td><td></td><td class="hd">관련 부서</td><td></td></tr>
</table>

<div class="sec-title">■ 2. 위험우선순위(RPN) 평가 기준 (각 항목 1~10점)</div>
<table class="data">
  <tr><th style="width:100px">평가 항목</th><th>1~3점 (낮음)</th><th>4~6점 (보통)</th><th>7~10점 (높음)</th></tr>
  <tr><td class="hd c">심각도 (S)</td><td class="c">환자에게 영향 없음~경미</td><td class="c">중등도 손상</td><td class="c">심각/치명적/사망 가능</td></tr>
  <tr><td class="hd c">발생 빈도 (O)</td><td class="c">매우 낮음~드물게</td><td class="c">가끔 발생</td><td class="c">자주~항상 발생</td></tr>
  <tr><td class="hd c">발견 가능성 (D)</td><td class="c">반드시 발견됨</td><td class="c">발견 가능성 보통</td><td class="c">발견 어려움~불가</td></tr>
</table>
<div class="info-box" style="margin-top:4px;"><b>RPN = S × O × D</b> &nbsp;|&nbsp; RPN ≥ 125: 즉각 개선 필요 &nbsp;|&nbsp; 50~124: 중기 개선 &nbsp;|&nbsp; &lt;50: 모니터링</div>

<div class="sec-title">■ 3. 고장 유형 분석 워크시트 (FMEA Worksheet)</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th style="width:22px">No.</th>
    <th style="width:90px">프로세스 단계</th>
    <th style="width:110px">잠재적 고장 유형</th>
    <th style="width:110px">잠재적 원인</th>
    <th style="width:38px">RPN<br><span style="font-weight:normal;font-size:7pt;">(S×O×D)</span></th>
    <th>개선 대책 및 담당자</th>
    <th style="width:55px">완료 예정일</th>
  </tr>
  ${Array.from({length:8},(_,i)=>
  `<tr class="tall"><td class="c">${i+1}</td><td></td><td></td><td></td>
  <td class="c"></td><td></td><td class="c"></td></tr>`).join('')}
</table>

<div class="sec-title">■ 4. 사후 개선 효과 평가</div>
<table class="data">
  <tr><th>No.</th><th>개선 대책 요약</th><th style="width:80px">실제 완료일</th><th>개선 후 결과 / 효과</th><th style="width:70px">팀 리더 확인</th></tr>
  ${Array.from({length:4},(_,i)=>`<tr class="tall"><td class="c">${i+1}</td><td></td><td class="c"></td><td></td><td class="c"></td></tr>`).join('')}
</table>`;
}

function makeQpsTemp4() {
  const drugs = [
    '고농도 KCl (염화칼륨 주사액 15% 이상)',
    '고농도 NaCl (3% 이상)',
    '인슐린 (속효성/지속형)',
    '헤파린 (미분획/저분자량)',
    '항응고제 경구 (와파린/NOAC)',
    '항암제 (세포독성)',
    '마약성 진통제 (모르핀/옥시코돈)',
    '신경근차단제',
    '농축 전해질 (MgSO₄ 50%)',
    '기타 고위험 약물',
  ];
  return `
<div class="sec-title">■ 1. 고위험 약물(High-Alert Medication) 현황 및 보관 점검</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th style="width:20px">No.</th>
    <th>약물명 (성분/농도)</th>
    <th style="width:50px">보관위치</th>
    <th style="width:55px">별도잠금<br>보관</th>
    <th style="width:55px">고위험라벨<br>부착</th>
    <th style="width:55px">유효기간<br>적정</th>
    <th style="width:60px">보유수량</th>
    <th style="width:60px">점검자 서명</th>
    <th style="width:60px">2차 확인자</th>
  </tr>
  ${drugs.map((d, i) =>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${d}</td><td class="c"></td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td><td class="c">☐ 예 &nbsp;☐ 아니오</td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td><td class="c"></td><td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 투약 전 2인 교차확인 기록 (Double-Check Log)</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th>날짜</th><th>환자명/병록번호</th><th>약물명/용량/경로</th>
    <th style="width:70px">1차 확인<br>간호사</th><th style="width:70px">2차 확인<br>간호사</th>
    <th style="width:55px">이상 유무</th><th style="width:70px">비고</th>
  </tr>
  ${Array.from({length:10},()=>
    `<tr class="data-r"><td></td><td></td><td></td><td></td><td></td>
    <td class="c">☐ 없음 &nbsp;☐ 있음</td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 월별 점검 이상 현황 및 조치</div>
<table class="data">
  <tr><th>발견일</th><th>해당 약물</th><th>이상 내용</th><th>조치 내용</th><th>조치자</th><th>부서장 확인</th></tr>
  ${Array.from({length:4},()=>
    `<tr class="tall"><td></td><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 4. 점검 총평</div>
<table class="data">
  <tr>
    <td class="hd" style="width:80px">점검일자</td><td></td>
    <td class="hd" style="width:80px">점검 부서</td><td></td>
    <td class="hd" style="width:80px">점검 책임자</td><td></td>
  </tr>
  <tr><td class="hd">종합 의견</td><td colspan="5" style="height:45px;vertical-align:top;padding:6px;"></td></tr>
</table>`;
}

function makeImTemp1() {
  return `
<div class="sec-title">■ 제1조. 목적 및 적용 범위</div>
<div class="info-box">
본 감염관리 규정은 의료관련감염(Healthcare-Associated Infection, HAI) 예방 및 최소화를 위해 직원의 준수 사항을 정하며, 원내 모든 부서 및 직종(의사, 간호사, 의료기사, 행정직 포함)에 적용한다.
</div>

<div class="sec-title">■ 제2조. 감염관리위원회 구성 및 운영</div>
<table class="data">
  <tr><th>직책</th><th>성명/직종</th><th>역할</th><th>연락처</th></tr>
  <tr class="data-r"><td class="c">위원장 (감염관리 총괄)</td><td></td><td>정책 결정, 결재 최종 승인</td><td></td></tr>
  <tr class="data-r"><td class="c">감염관리전담간호사</td><td></td><td>일일 모니터링, 교육, 대장 관리</td><td></td></tr>
  <tr class="data-r"><td class="c">진단검사의학과 전문의</td><td></td><td>검사 결과 자문, 역학조사 지원</td><td></td></tr>
  <tr class="data-r"><td class="c">약무부서장</td><td></td><td>항생제 내성 모니터링</td><td></td></tr>
  <tr class="data-r"><td class="c">시설·환경팀장</td><td></td><td>환경 소독·정화 관리</td><td></td></tr>
</table>

<div class="sec-title">■ 제3조. 손위생 지침 (WHO 5 Moments 기준)</div>
<table class="data">
  <tr><th style="width:25px">No.</th><th>손위생 시점</th><th style="width:180px">세부 지침</th><th style="width:80px">이행 방법</th></tr>
  ${[
    ['환자 접촉 전','직접 접촉(활력징후, 투약, 드레싱) 직전','비누/물 또는 ABHR 30초'],
    ['무균 처치 전','주사, 상처 처치, 카테터 삽입 전','비누/물 또는 ABHR 30초'],
    ['체액 노출 위험 후','혈액·분비물 접촉 가능 처치 후','비누/물 60초 (장갑 착용 후도 동일)'],
    ['환자 접촉 후','직접 접촉(드레싱, 이동 도움 등) 직후','ABHR 또는 비누/물 30초'],
    ['환자 주변 환경 접촉 후','침상 난간, 링거대, 의료기기 접촉 후','ABHR 20~30초'],
  ].map(([t,d,m],i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td><td>${d}</td><td class="c">${m}</td></tr>`).join('')}
</table>

<div class="sec-title">■ 제4조. 멸균 및 소독 기준</div>
<table class="data">
  <tr><th>의료기구 분류</th><th>해당 기구 예시</th><th style="width:120px">처리 방법</th><th style="width:80px">담당</th></tr>
  <tr><td class="hd c">Critical (고위험)</td><td>수술기구, 임플란트, 혈관내 카테터</td><td class="c">고압증기멸균(AutoClave) 또는 EO가스</td><td></td></tr>
  <tr><td class="hd c">Semi-critical (준위험)</td><td>내시경, 호흡치료기구, 마취기구</td><td class="c">고수준소독 (글루타르알데하이드 2%)</td><td></td></tr>
  <tr><td class="hd c">Non-critical (비위험)</td><td>혈압계커프, 청진기, 침상난간</td><td class="c">저수준소독 (70% 알코올, 염소계)</td><td></td></tr>
</table>

<div class="sec-title">■ 월별 감염관리 활동 이행 현황</div>
<table class="data">
  <tr><th>점검 항목</th>
    ${['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'].map(m=>`<th style="width:35px">${m}</th>`).join('')}
  </tr>
  ${['손위생 이행률 관찰(월1회)','의료기기 소독 점검','격리환자 현황 및 관리','의료폐기물 적정 처리 확인','환경 소독 실시 및 기록','직원 감염예방 교육 이수']
    .map(t=>`<tr class="data-r"><td>${t}</td>${Array.from({length:12},()=>'<td class="c"></td>').join('')}</tr>`).join('')}
</table>`;
}

function makeImTemp2() {
  return `
<div class="sec-title">■ 손위생 이행도 관찰 기록지 (WHO 5 Moments)</div>
<div class="info-box"><b>관찰 기간:</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 년 &nbsp;&nbsp; 월 &nbsp;&nbsp; 일 ~ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 년 &nbsp;&nbsp; 월 &nbsp;&nbsp; 일 &nbsp;&nbsp;&nbsp;&nbsp; <b>관찰 부서:</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>관찰자:</b></div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th rowspan="2" style="width:25px">No.</th>
    <th rowspan="2" style="width:55px">관찰일시</th>
    <th rowspan="2" style="width:50px">직종</th>
    <th colspan="5">손위생 시점 (O=이행 / X=미이행 / N/A=해당없음)</th>
    <th rowspan="2" style="width:55px">이행 횟수</th>
    <th rowspan="2" style="width:55px">관찰 기회</th>
    <th rowspan="2" style="width:60px">이행률(%)</th>
    <th rowspan="2" style="width:50px">비고</th>
  </tr>
  <tr>
    <th style="width:40px">① 환자<br>접촉 전</th>
    <th style="width:40px">② 무균<br>처치 전</th>
    <th style="width:40px">③ 체액<br>노출 후</th>
    <th style="width:40px">④ 환자<br>접촉 후</th>
    <th style="width:40px">⑤ 환경<br>접촉 후</th>
  </tr>
  ${Array.from({length:15},(_,i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td></td><td class="c"></td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td></td></tr>`).join('')}
  <tr style="background:#f5f5f5;font-weight:700;">
    <td colspan="7" class="c">합 계</td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td></td>
  </tr>
</table>

<div class="sec-title">■ 월별 부서별 집계표</div>
<table class="data">
  <tr>
    <th>부서명</th>
    ${['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월','연간 평균'].map(m=>`<th style="width:38px">${m}</th>`).join('')}
  </tr>
  ${['내과병동','외과병동','중환자실','응급실','수술실','외래','기타'].map(d=>
    `<tr class="data-r"><td class="hd">${d}</td>${Array.from({length:13},()=>'<td class="c"></td>').join('')}</tr>`).join('')}
  <tr style="background:#dce6f1;font-weight:700;"><td class="hd c">원내 전체</td>${Array.from({length:13},()=>'<td class="c"></td>').join('')}</tr>
</table>

<div class="sec-title">■ 개선 활동 기록</div>
<table class="data">
  <tr><th>문제점</th><th>원인 분석</th><th>개선 계획</th><th>담당자</th><th>완료 예정일</th><th>효과 평가</th></tr>
  ${Array.from({length:4},()=>`<tr class="tall"><td></td><td></td><td></td><td class="c"></td><td class="c"></td><td></td></tr>`).join('')}
</table>`;
}

function makeImTemp3() {
  return `
<div class="sec-title">■ 1. 멸균기 기본 정보</div>
<table class="data">
  <tr>
    <td class="hd" style="width:100px">멸균기 제조사/모델</td><td></td>
    <td class="hd" style="width:90px">설치 위치</td><td></td>
  </tr>
  <tr>
    <td class="hd">멸균기 일련번호</td><td></td>
    <td class="hd">최근 정기점검일</td><td></td>
  </tr>
</table>

<div class="sec-title">■ 2. 일별 멸균 작동 일지</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th>날짜</th><th>사이클 번호</th><th style="width:55px">멸균 방법</th>
    <th style="width:60px">설정온도(℃)</th><th style="width:55px">압력(kPa)</th>
    <th style="width:55px">멸균 시간</th>
    <th style="width:60px">화학적<br>지시제 결과</th>
    <th style="width:60px">생물학적<br>지시제 결과</th>
    <th style="width:55px">담당자</th><th style="width:55px">이상 유무</th>
  </tr>
  ${Array.from({length:15},()=>
    `<tr class="data-r"><td></td><td class="c"></td><td class="c"></td>
    <td class="c"></td><td class="c"></td><td class="c"></td>
    <td class="c">☐ 적합 &nbsp;☐ 불합</td>
    <td class="c">☐ 음성 &nbsp;☐ 양성</td>
    <td></td>
    <td class="c">☐ 없음 &nbsp;☐ 있음</td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 치과 핸드피스 소독 기록</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th>날짜</th><th>핸드피스 번호</th><th style="width:70px">사용 환자수</th>
    <th style="width:80px">소독 방법</th><th style="width:70px">소독완료 시간</th>
    <th style="width:70px">담당자</th><th style="width:70px">포장 확인</th>
  </tr>
  ${Array.from({length:10},()=>
    `<tr class="data-r"><td></td><td class="c"></td><td class="c"></td>
    <td class="c">☐ 고압멸균 &nbsp;☐ 기타</td><td class="c"></td><td></td>
    <td class="c">☐ 정상 &nbsp;☐ 불량</td></tr>`).join('')}
</table>

<div class="sec-title">■ 4. 이상 발생 및 조치 기록</div>
<table class="data">
  <tr><th>발생일</th><th>사이클/기구</th><th>이상 내용</th><th>즉각 조치</th><th>재검사 결과</th><th>보고 경로</th></tr>
  ${Array.from({length:4},()=>`<tr class="tall"><td></td><td></td><td></td><td></td><td class="c"></td><td></td></tr>`).join('')}
</table>`;
}

function makeImTemp4() {
  return `
<div class="sec-title">■ 1. 탕전실 환경 위생 점검</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th style="width:25px">No.</th><th>점검 항목</th>
    <th style="width:60px">오전 점검</th><th style="width:60px">오후 점검</th>
    <th style="width:70px">점검자 서명</th><th style="width:80px">비고</th>
  </tr>
  ${[
    '조제대 표면 알코올(70%) 소독 실시',
    '바닥 청소 및 물기 제거 완료',
    '냉장고 내부 온도 (2~8℃) 확인',
    '창문·환기구 개방 및 환기 실시',
    '손씻기 시설(비누·건조기) 정상 작동',
    '조제 담당자 앞치마·마스크 착용 여부',
    '사용 후 기구 세척 및 건조 보관',
    '유통기한 경과 한약재 확인 및 폐기',
  ].map((t,i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td>
    <td class="c">☐ 적합 &nbsp;☐ 부적합</td>
    <td class="c">☐ 적합 &nbsp;☐ 부적합</td>
    <td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 침·부항 자재 소독 및 일회용품 사용 확인</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>날짜</th><th>자재 종류</th><th style="width:70px">일회용 여부</th>
    <th style="width:80px">소독 방법</th><th style="width:60px">소독 일시</th>
    <th style="width:60px">재고 수량</th><th style="width:70px">담당자</th>
  </tr>
  ${['호침(1회용)', '부항컵', '약침용 주사기', '뜸 기구', '기타 소모품'].map(t=>
    `<tr class="data-r"><td></td><td>${t}</td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td>
    <td class="c">☐ 고압멸균 &nbsp;☐ 알코올</td>
    <td></td><td class="c"></td><td></td></tr>`).join('')}
  ${Array.from({length:3},()=>
    `<tr class="data-r"><td></td><td></td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td>
    <td class="c">☐ 고압멸균 &nbsp;☐ 알코올</td>
    <td></td><td class="c"></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 재사용 금지 자재 처리 확인</div>
<div class="info-box">일회용 자재(호침, 주사기 등)의 재사용은 의료법 및 감염관리 규정에 의해 엄격히 금지됩니다. 위반 시 즉각 보고하여 주십시오.</div>
<table class="data">
  <tr><th>점검일</th><th>적발 내용</th><th>조치 내용</th><th>보고자</th><th>부서장 확인</th></tr>
  ${Array.from({length:4},()=>`<tr class="tall"><td></td><td></td><td></td><td></td><td></td></tr>`).join('')}
</table>`;
}

function makeImTemp5() {
  return `
<div class="sec-title">■ 1. 격리 환자 현황</div>
<table class="data" style="font-size:8pt;">
  <tr>
    <th>No.</th><th>환자번호</th><th style="width:60px">입원일</th>
    <th style="width:70px">균종(MDRO)</th><th style="width:55px">격리 유형</th>
    <th style="width:55px">격리실 호실</th><th style="width:60px">격리 시작일</th>
    <th style="width:60px">해제 예정일</th><th style="width:60px">담당 간호사</th>
  </tr>
  ${Array.from({length:8},(_,i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td></td><td></td>
    <td class="c">☐ CRE &nbsp;☐ VRE<br>☐ MRSA &nbsp;☐ 기타</td>
    <td class="c">☐ 접촉주의<br>☐ 비말주의</td>
    <td class="c"></td><td></td><td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 개인보호구(PPE) 착용 및 격리 수칙 이행 점검</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>점검일</th><th>병실/환자번호</th>
    <th style="width:60px">가운 착용</th><th style="width:60px">장갑 착용</th>
    <th style="width:60px">마스크 착용</th><th style="width:70px">손위생<br>(접촉 전·후)</th>
    <th style="width:70px">PPE 폐기<br>(격리구역 內)</th>
    <th style="width:60px">점검자</th><th style="width:60px">이상 유무</th>
  </tr>
  ${Array.from({length:12},()=>
    `<tr class="data-r"><td></td><td></td>
    <td class="c">☐ O &nbsp;☐ X</td><td class="c">☐ O &nbsp;☐ X</td>
    <td class="c">☐ O &nbsp;☐ X</td><td class="c">☐ O &nbsp;☐ X</td>
    <td class="c">☐ O &nbsp;☐ X</td><td></td>
    <td class="c">☐ 없음 &nbsp;☐ 있음</td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 격리실 환경 소독 일지</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>날짜</th><th style="width:60px">격리실 호실</th>
    <th style="width:80px">소독제 종류</th><th style="width:70px">고접촉 표면 소독</th>
    <th style="width:70px">바닥 소독</th><th style="width:60px">소독 횟수</th>
    <th style="width:70px">소독 담당자</th>
  </tr>
  ${Array.from({length:10},()=>
    `<tr class="data-r"><td></td><td class="c"></td>
    <td class="c">☐ 염소계 &nbsp;☐ 사차암모늄</td>
    <td class="c">☐ 완료 &nbsp;☐ 미완</td>
    <td class="c">☐ 완료 &nbsp;☐ 미완</td>
    <td class="c"></td><td></td></tr>`).join('')}
</table>`;
}

function makeEvalTemp1() {
  return `
<div class="sec-title">■ 1. 구조 영역 — 인력 현황</div>
<table class="data">
  <tr><th>직종</th><th style="width:80px">법정 기준 인원</th><th style="width:80px">실제 배치 인원</th><th style="width:80px">충족 여부</th><th>비고</th></tr>
  ${[
    ['의사 (상근)','입원환자 80명당 1명'],
    ['의사 (당직)','야간·휴일 1명 이상'],
    ['간호사 (상근)','입원환자 5명당 1명'],
    ['물리치료사','물리치료실 1명 이상'],
    ['작업치료사','작업치료 시행 시 1명'],
    ['사회복지사','100병상당 1명'],
  ].map(([d,s])=>
    `<tr class="data-r"><td>${d}</td><td class="c">${s}</td><td class="c"></td>
    <td class="c">☐ 충족 &nbsp;☐ 미충족</td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 진료 영역 — 핵심 지표 산출</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th style="width:25px">No.</th><th>평가 지표명</th>
    <th style="width:80px">산출식</th><th style="width:60px">분자 (건)</th>
    <th style="width:60px">분모 (건)</th><th style="width:70px">기관 결과(%)</th>
    <th style="width:70px">전국 평균</th><th style="width:60px">등급</th>
  </tr>
  ${[
    ['일상생활수행능력(ADL) 향상률','퇴원 시 ADL 향상/전체 대상자'],
    ['욕창 발생률','원내 발생 욕창 환자수/재원 환자수×1000'],
    ['인지기능 검사(MMSE) 시행률','MMSE 시행 환자수/대상 환자수'],
    ['재원일수(LOS) 평균','총 재원일수/퇴원 환자수'],
    ['항생제 처방률','항생제 처방 환자수/전체 입원 환자수'],
  ].map(([t,f],i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td><td style="font-size:7.5pt;">${f}</td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 조사 기간 및 자료 수집 현황</div>
<table class="data">
  <tr>
    <td class="hd" style="width:100px">자료 수집 기간</td><td colspan="3"></td>
  </tr>
  <tr>
    <td class="hd">총 퇴원 환자 수</td><td></td>
    <td class="hd" style="width:100px">분석 대상 환자 수</td><td></td>
  </tr>
  <tr>
    <td class="hd">자료 수집 방법</td>
    <td colspan="3">☐ EMR 자동 추출 &nbsp;&nbsp; ☐ 수기 조사 &nbsp;&nbsp; ☐ 혼합 방식</td>
  </tr>
  <tr>
    <td class="hd">작성 담당자</td><td></td>
    <td class="hd">부서장 확인</td><td></td>
  </tr>
</table>

<div class="sec-title">■ 4. 자체 개선 계획</div>
<table class="data">
  <tr><th>취약 지표</th><th>원인 분석</th><th>개선 계획</th><th>담당자</th><th>목표 달성 기한</th></tr>
  ${Array.from({length:4},()=>`<tr class="tall"><td></td><td></td><td></td><td class="c"></td><td class="c"></td></tr>`).join('')}
</table>`;
}

function makeEvalTemp2() {
  return `
<div class="sec-title">■ 1. 정신건강의학과 입원 진료 지표</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th style="width:25px">No.</th><th>지표명</th>
    <th style="width:80px">산출식</th><th style="width:60px">분자</th>
    <th style="width:60px">분모</th><th style="width:70px">기관 결과</th>
    <th style="width:70px">기준값</th><th style="width:60px">달성 여부</th>
  </tr>
  ${[
    ['퇴원 후 30일 내 외래 방문율','퇴원 후 30일 내 외래 방문 환자수/총 퇴원 환자수'],
    ['조현병 항정신병약물 처방률','항정신병약물 처방 환자수/조현병 진단 환자수'],
    ['조현병 클로자핀 처방률','클로자핀 처방 환자수/조현병 중등도이상 환자수'],
    ['재입원율(30일 내)','퇴원 후 30일 내 재입원 환자수/총 퇴원 환자수'],
    ['격리·강박 시행률','격리 또는 강박 적용 환자수/전체 입원 환자수'],
  ].map(([t,f],i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td><td style="font-size:7.5pt;">${f}</td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td>
    <td class="c">☐ 달성 &nbsp;☐ 미달</td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 자살·자해 위험도 평가 현황</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>날짜</th><th>환자번호</th>
    <th style="width:80px">평가 도구</th><th style="width:60px">위험 등급</th>
    <th style="width:100px">예방 조치 내용</th>
    <th style="width:60px">평가자</th><th style="width:70px">주치의 보고일시</th>
  </tr>
  ${Array.from({length:10},()=>
    `<tr class="data-r"><td></td><td></td>
    <td class="c">☐ C-SSRS &nbsp;☐ SBQ-R &nbsp;☐ 기타</td>
    <td class="c">☐ 저위험 &nbsp;☐ 중위험 &nbsp;☐ 고위험</td>
    <td></td><td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 격리·강박 현황 대장</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>날짜</th><th>환자번호</th>
    <th style="width:60px">시행 유형</th><th style="width:70px">시작 일시</th>
    <th style="width:70px">해제 일시</th><th style="width:55px">총 시간</th>
    <th style="width:80px">시행 사유</th>
    <th style="width:60px">의사 처방 여부</th><th style="width:60px">담당 간호사</th>
  </tr>
  ${Array.from({length:8},()=>
    `<tr class="data-r"><td></td><td></td>
    <td class="c">☐ 격리 &nbsp;☐ 강박</td>
    <td></td><td></td><td class="c"></td><td></td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td><td></td></tr>`).join('')}
</table>`;
}

function makeEvalTemp3() {
  return `
<div class="sec-title">■ 1. 급성 뇌졸중 환자 기본 정보</div>
<table class="data">
  <tr>
    <td class="hd" style="width:100px">환자번호</td><td></td>
    <td class="hd" style="width:80px">성명</td><td></td>
    <td class="hd" style="width:80px">나이/성별</td><td></td>
  </tr>
  <tr>
    <td class="hd">주진단명</td><td></td>
    <td class="hd">내원 경로</td><td>☐ 구급차 &nbsp;☐ 도보 &nbsp;☐ 이송</td>
    <td class="hd">NIHSS 점수</td><td></td>
  </tr>
</table>

<div class="sec-title">■ 2. t-PA 투여 핵심 시간 기록 (Door-to-Needle Time)</div>
<table class="data">
  <tr>
    <th colspan="2">구분</th><th style="width:120px">날짜 및 시간</th>
    <th style="width:80px">담당자</th><th>비고</th>
  </tr>
  ${[
    ['①','응급실 내원(Door) 시간'],
    ['②','뇌 CT 촬영 시작 시간'],
    ['③','뇌 CT 판독 완료 시간'],
    ['④','신경과 전문의 진료 시간'],
    ['⑤','t-PA 투여 동의서 획득 시간'],
    ['⑥','t-PA 투여 개시(Needle) 시간'],
  ].map(([n,t])=>
    `<tr class="data-r"><td class="c hd">${n}</td><td>${t}</td><td></td><td></td><td></td></tr>`).join('')}
  <tr style="background:#fff3cd;font-weight:700;">
    <td colspan="2" class="c">★ Door-to-Needle Time (①→⑥)</td>
    <td colspan="3" style="padding:4px 8px;">____ 분 &nbsp;&nbsp; (목표: <b>60분 이내</b>)</td>
  </tr>
</table>

<div class="sec-title">■ 3. t-PA 적응증/금기증 확인</div>
<table class="data">
  <tr><th colspan="2">적응증 확인 (모두 충족 시 투여 가능)</th><th colspan="2">절대 금기증 (하나라도 해당 시 투여 불가)</th></tr>
  ${[
    ['증상 발생 4.5시간 이내','CT상 뇌출혈 없음'],
    ['NIHSS 4점 이상','최근 3개월 내 뇌졸중/두부손상/뇌수술'],
    ['혈압 185/110 mmHg 이하','최근 3개월 내 심근경색'],
    ['혈당 50 mg/dL 이상','활동성 내부 출혈'],
    ['INR 1.7 이하 (항응고제 미복용)','혈소판 100,000/mm³ 미만'],
  ].map(([a,b])=>
    `<tr class="data-r">
    <td>☐ ${a}</td><td class="c" style="width:60px">☐ 충족</td>
    <td>☐ ${b}</td><td class="c" style="width:60px">☐ 해당 없음</td>
    </tr>`).join('')}
</table>

<div class="sec-title">■ 4. t-PA 투여 후 모니터링</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>시간</th><th style="width:80px">혈압(수축/이완)</th>
    <th style="width:60px">맥박</th><th style="width:60px">NIHSS</th>
    <th style="width:70px">의식 수준</th><th style="width:80px">출혈 의심 증상</th>
    <th style="width:60px">담당 간호사</th>
  </tr>
  ${['투여 직후','15분','30분','1시간','2시간','4시간','8시간','12시간','24시간'].map(t=>
    `<tr class="data-r"><td class="c">${t}</td><td class="c"></td><td class="c"></td>
    <td class="c"></td><td class="c"></td>
    <td class="c">☐ 없음 &nbsp;☐ 의심</td><td></td></tr>`).join('')}
</table>`;
}

function makeEvalTemp4() {
  return `
<div class="sec-title">■ 1. 근관치료(신경치료) 적정성 평가 지표 점검</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th style="width:25px">No.</th><th>평가 지표명</th>
    <th style="width:80px">산출식</th><th style="width:60px">분자(건)</th>
    <th style="width:60px">분모(건)</th><th style="width:70px">기관 결과(%)</th>
    <th style="width:70px">기준값</th><th style="width:60px">달성 여부</th>
  </tr>
  ${[
    ['근관치료 전 방사선 촬영 시행률','근관치료 전 방사선 촬영 환자수/근관치료 환자수'],
    ['근관치료 완성률','근관충전까지 완료한 환자수/근관치료 시작 환자수'],
    ['근관치료 후 방사선 촬영 시행률','치료 후 방사선 촬영 환자수/완성된 근관치료 환자수'],
    ['재치료율(1년 내)','재치료 건수/완성된 근관치료 건수'],
  ].map(([t,f],i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td>${t}</td><td style="font-size:7.5pt;">${f}</td>
    <td class="c"></td><td class="c"></td><td class="c"></td><td class="c"></td>
    <td class="c">☐ 달성 &nbsp;☐ 미달</td></tr>`).join('')}
</table>

<div class="sec-title">■ 2. 개별 케이스 누락 점검 체크리스트</div>
<table class="data" style="font-size:8.5pt;">
  <tr>
    <th>날짜</th><th>환자번호/차트번호</th><th>치아번호</th>
    <th style="width:70px">초진 방사선<br>촬영</th>
    <th style="width:70px">근관장<br>측정(EPT/방사선)</th>
    <th style="width:70px">근관충전<br>완료</th>
    <th style="width:70px">충전 후<br>방사선 촬영</th>
    <th style="width:60px">청구 코드<br>확인</th>
    <th style="width:60px">담당의</th>
  </tr>
  ${Array.from({length:12},()=>
    `<tr class="data-r"><td></td><td></td><td class="c"></td>
    <td class="c">☐ 시행 &nbsp;☐ 미시행</td>
    <td class="c">☐ 시행 &nbsp;☐ 미시행</td>
    <td class="c">☐ 완료 &nbsp;☐ 미완</td>
    <td class="c">☐ 시행 &nbsp;☐ 미시행</td>
    <td class="c">☐ 정상 &nbsp;☐ 오류</td>
    <td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 청구 누락 의심 케이스 관리</div>
<table class="data">
  <tr><th>발견일</th><th>환자번호</th><th>치아번호</th><th>누락 항목</th><th>추정 누락금액</th><th>정정 청구일</th><th>담당자</th></tr>
  ${Array.from({length:5},()=>
    `<tr class="tall"><td></td><td></td><td class="c"></td><td></td>
    <td class="c"></td><td class="c"></td><td></td></tr>`).join('')}
</table>`;
}

// ── 제네릭 폴백 ────────────────────────────────────────────────────────
function makeGeneric(title: string, description: string) {
  return `
<div class="sec-title">■ 1. 기본 사항</div>
<table class="data">
  <tr><td class="hd" style="width:100px">서식명</td><td colspan="3">${esc(title)}</td></tr>
  <tr><td class="hd">점검 일자</td><td></td><td class="hd" style="width:80px">작성 부서</td><td></td></tr>
  <tr><td class="hd">작성자</td><td></td><td class="hd">확인 책임자</td><td></td></tr>
  <tr><td class="hd">관련 내용</td><td colspan="3" style="height:40px;vertical-align:top;padding:6px;">${esc(description||'')}</td></tr>
</table>

<div class="sec-title">■ 2. 점검 항목</div>
<table class="data">
  <tr>
    <th style="width:25px">No.</th><th>점검 항목</th>
    <th style="width:70px">이행 여부</th><th style="width:70px">점검자</th><th>비고</th>
  </tr>
  ${Array.from({length:12},(_,i)=>
    `<tr class="data-r"><td class="c">${i+1}</td><td></td>
    <td class="c">☐ 예 &nbsp;☐ 아니오</td><td></td><td></td></tr>`).join('')}
</table>

<div class="sec-title">■ 3. 종합 의견 및 개선 사항</div>
<table class="data">
  <tr><td class="hd" style="width:100px">종합 의견</td><td style="height:50px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">개선 필요 사항</td><td style="height:40px;vertical-align:top;padding:6px;"></td></tr>
  <tr><td class="hd">다음 점검 예정일</td><td></td></tr>
</table>`;
}

// ── 라우팅 ─────────────────────────────────────────────────────────────
function getBody(item: QpicItem): string {
  switch (item.id) {
    case 'qps-temp-1': return makeQpsTemp1();
    case 'qps-temp-2': return makeQpsTemp2();
    case 'qps-temp-3': return makeQpsTemp3();
    case 'qps-temp-4': return makeQpsTemp4();
    case 'im-temp-1':  return makeImTemp1();
    case 'im-temp-2':  return makeImTemp2();
    case 'im-temp-3':  return makeImTemp3();
    case 'im-temp-4':  return makeImTemp4();
    case 'im-temp-5':  return makeImTemp5();
    case 'eval-temp-1': return makeEvalTemp1();
    case 'eval-temp-2': return makeEvalTemp2();
    case 'eval-temp-3': return makeEvalTemp3();
    case 'eval-temp-4': return makeEvalTemp4();
    default: return makeGeneric(item.title, item.description || '');
  }
}

export function generateFormHtml(item: QpicItem): string {
  const targetLabel = item.hospitalTypes
    .map(t => HOSPITAL_TYPE_LABELS[t] || t)
    .join(', ');

  const formNo = `MED-${item.id.toUpperCase().replace(/-/g, '_')}-001`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(item.title)}</title>
${CSS}
</head>
<body>
${header({
  title: item.title,
  formNo,
  version: 'Rev.1',
  date: item.date || new Date().toISOString().slice(0, 10),
  related: item.source,
  target: targetLabel,
})}
${getBody(item)}
${footer(item.source)}
<script>
  // 인쇄 버튼 (브라우저에서 열었을 때)
  const btn = document.createElement('button');
  btn.textContent = '🖨 인쇄 / PDF 저장';
  btn.style.cssText = 'position:fixed;top:10px;right:10px;padding:8px 16px;background:#1f3864;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;z-index:9999;';
  btn.onclick = () => window.print();
  document.body.appendChild(btn);
  window.addEventListener('beforeprint', () => btn.style.display='none');
  window.addEventListener('afterprint',  () => btn.style.display='');
</script>
</body>
</html>`;
}
