import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buildReportData } from '@/lib/services/report.service'

type Props = { params: Promise<{ hospitalId: string; reportId: string }> }

export const metadata: Metadata = { title: '보고서 출력' }

export default async function PrintReportPage({ params }: Props) {
  const { hospitalId, reportId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const reportData = await buildReportData(hospitalId, reportId)
  if (!reportData) notFound()

  const scoreColor = reportData.overallScore != null
    ? (reportData.overallScore >= 80 ? 'text-green-700' : reportData.overallScore >= 60 ? 'text-amber-700' : 'text-red-700')
    : 'text-gray-400'

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>{reportData.hospitalName} — 인증 갭 분석 보고서</title>
        <style>{`
          @page { margin: 20mm 15mm; size: A4; }
          body { font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif; font-size: 10pt; color: #1f2937; line-height: 1.7; }
          .report-header { text-align: center; border-bottom: 2px solid #14b8a6; padding-bottom: 1.5rem; margin-bottom: 2rem; }
          .report-header h1 { font-size: 18pt; font-weight: 700; margin: 0 0 0.3rem; }
          .report-header p { color: #6b7280; font-size: 9pt; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 9pt; }
          th, td { border: 1px solid #d1d5db; padding: 0.4rem 0.6rem; text-align: left; }
          th { background: #f9fafb; font-weight: 600; font-size: 8.5pt; }
          .score-badge { display: inline-block; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 700; font-size: 14pt; }
          .section-title { font-size: 12pt; font-weight: 700; margin: 1.5rem 0 0.5rem; color: #0d9488; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.3rem; }
          .summary-grid { display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap; }
          .summary-card { flex: 1; min-width: 100px; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.8rem; text-align: center; }
          .summary-card .label { font-size: 7.5pt; color: #6b7280; }
          .summary-card .value { font-size: 14pt; font-weight: 700; margin-top: 0.2rem; }
          .compliant { color: #059669; }
          .non-compliant { color: #dc2626; }
          .partial { color: #d97706; }
          .footer { text-align: center; color: #9ca3af; font-size: 7.5pt; margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
          @media print { .no-print { display: none; } }
        `}</style>
      </head>
      <body>
        <div className="no-print" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button onClick={() => window.print()} style={{
            padding: '0.5rem 1.5rem', background: '#0d9488', color: 'white',
            border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '10pt'
          }}>
            PDF로 저장 / 인쇄
          </button>
        </div>

        <div className="report-header">
          <h1>{reportData.hospitalName}</h1>
          <p>
            {reportData.accreditationCycle}차 인증 준비 · 갭 분석 보고서
            {reportData.hospitalRegion ? ` · ${reportData.hospitalRegion}` : ''}
            {reportData.hospitalBeds ? ` · ${reportData.hospitalBeds}병상` : ''}
          </p>
          <p>분석일: {new Date(reportData.analysisDate).toLocaleDateString('ko-KR')}</p>
        </div>

        {/* 종합 점수 */}
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <div className={`score-badge ${scoreColor}`}>
            {reportData.overallScore != null ? `${reportData.overallScore}점` : '—'}
          </div>
          <div style={{ fontSize: '8pt', color: '#6b7280', marginTop: '0.3rem' }}>종합 준비도</div>
        </div>

        {/* 요약 */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="label">총 기준</div>
            <div className="value">{reportData.totalCriteria}</div>
          </div>
          <div className="summary-card">
            <div className="label">충족</div>
            <div className="value compliant">{reportData.compliantCount}</div>
          </div>
          <div className="summary-card">
            <div className="label">부분 충족</div>
            <div className="value partial">{reportData.partialCount}</div>
          </div>
          <div className="summary-card">
            <div className="label">미충족</div>
            <div className="value non-compliant">{reportData.nonCompliantCount}</div>
          </div>
          <div className="summary-card">
            <div className="label">치명적 갭</div>
            <div className="value" style={{ color: '#dc2626' }}>{reportData.criticalGapsCount}</div>
          </div>
          <div className="summary-card">
            <div className="label">주요 갭</div>
            <div className="value" style={{ color: '#d97706' }}>{reportData.majorGapsCount}</div>
          </div>
        </div>

        {/* 도메인별 점수 */}
        <h2 className="section-title">도메인별 분석</h2>
        <table>
          <thead>
            <tr>
              <th>도메인</th>
              <th>점수</th>
              <th>충족</th>
              <th>부분</th>
              <th>미충족</th>
              <th>계</th>
            </tr>
          </thead>
          <tbody>
            {reportData.domainBreakdowns.map((d) => (
              <tr key={d.code}>
                <td>{d.name} ({d.code})</td>
                <td style={{ fontWeight: 700 }}>{d.score}점</td>
                <td className="compliant">{d.compliantCount}</td>
                <td className="partial">{d.partialCount}</td>
                <td className="non-compliant">{d.nonCompliantCount}</td>
                <td>{d.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 세부 기준 결과 */}
        <h2 className="section-title">기준별 분석 결과</h2>
        <table>
          <thead>
            <tr>
              <th style={{ width: '12%' }}>코드</th>
              <th style={{ width: '28%' }}>기준</th>
              <th style={{ width: '10%' }}>상태</th>
              <th style={{ width: '16%' }}>근거</th>
              <th style={{ width: '34%' }}>갭 / 권장사항</th>
            </tr>
          </thead>
          <tbody>
            {reportData.criterionResults.map((c) => (
              <tr key={c.code}>
                <td style={{ fontFamily: 'monospace', fontSize: '8pt' }}>{c.code}</td>
                <td>{c.title}</td>
                <td>
                  <span style={{
                    color: c.complianceStatus === 'compliant' ? '#059669' : c.complianceStatus === 'partial' ? '#d97706' : '#dc2626',
                    fontWeight: 600
                  }}>
                    {c.complianceStatus === 'compliant' ? '충족' : c.complianceStatus === 'partial' ? '부분' : '미충족'}
                  </span>
                </td>
                <td style={{ fontSize: '8pt' }}>{c.evidence ?? '-'}</td>
                <td style={{ fontSize: '8pt' }}>
                  {c.gap && <div><strong>갭:</strong> {c.gap}</div>}
                  {c.recommendation && <div><strong>권장:</strong> {c.recommendation}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer">
          AccrediQ · AI 기반 의료기관인증 갭 분석 플랫폼 · {new Date().toLocaleDateString('ko-KR')}
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          window.onload = function() {
            document.title = '${reportData.hospitalName.replace(/'/g, "\\'")} - 인증 갭 분석 보고서'
          }
        `}} />
      </body>
    </html>
  )
}
