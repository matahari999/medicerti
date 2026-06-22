# AccrediQ — Product Requirements Document
**Version:** 1.0.0 | **Date:** 2026-06-22 | **Status:** Draft for Approval

---

## 1. Executive Summary

AccrediQ is a cloud-based SaaS platform that automates healthcare accreditation gap analysis for long-term care hospitals (요양병원). By combining AI-powered document analysis with structured accreditation frameworks, AccrediQ reduces manual audit preparation time by 70%, enabling compliance teams to identify and remediate gaps before official inspections.

---

## 2. Problem Statement

Long-term care hospitals in Korea undergo mandatory accreditation cycles (의료기관인증) every 4 years. The current preparation process is:

| Pain Point | Impact |
|-----------|--------|
| **Manual review** — Teams manually cross-reference 300+ criteria against hundreds of policy documents | 200+ person-hours per cycle |
| **Error-prone** — Human reviewers miss gaps due to document volume and cognitive fatigue | Failed or conditional accreditations |
| **Costly** — External consulting for gap analysis | ₩5M–₩20M per cycle |
| **No traceability** — No structured record of which document covers which criterion | Repeated work every cycle |

---

## 3. Product Vision

> "Give every long-term care hospital access to an AI accreditation consultant that never sleeps."

AccrediQ ingests hospital documents as PDFs, extracts their content via AI-powered OCR, maps evidence to accreditation criteria, and generates a prioritized gap report — in under 2 hours.

---

## 4. Target Users

### Primary Users

| Role | Responsibilities | Core Pain Point |
|------|-----------------|----------------|
| **Quality Manager (QM)** | Leads accreditation prep, coordinates departments | Tracking 300+ criteria across hundreds of docs manually |
| **Hospital Administrator** | Final approval authority, budget owner | No real-time visibility into readiness level |
| **Department Head** | Submits department-specific documents | Unclear which documents are required and why |

### Secondary Users

| Role | Context |
|------|---------|
| **Accreditation Consultant** | External advisor reviewing hospital readiness before submission |
| **Platform Admin** | Internal AccrediQ team managing tenant configuration |

---

## 5. Core Feature Requirements

### F1 — Authentication & Multi-tenancy

- **F1.1** Email/password registration and login via Supabase Auth
- **F1.2** OAuth providers: Google, Kakao (future)
- **F1.3** Role-based access control per hospital:
  - `admin` — full access including member management and deletion
  - `manager` — upload, run analysis, export reports
  - `viewer` — read-only dashboard and reports
- **F1.4** Invite-based team onboarding via email token
- **F1.5** Hospital-level data isolation enforced via Row Level Security (RLS)
- **F1.6** Session expiry: 1 hour JWT, auto-refresh while active
- **F1.7** Password reset via email

### F2 — Hospital Management

- **F2.1** Create hospital profile: name, license number (요양기관번호), type, bed count, region, accreditation target date
- **F2.2** Multiple hospitals per user account (for consulting firm use)
- **F2.3** Accreditation cycle tracking: cycle number, start date, submission deadline, status
- **F2.4** Team member list: invite, role change, remove
- **F2.5** Hospital dashboard showing aggregate compliance readiness

### F3 — Document Management (PDF Upload)

- **F3.1** Drag-and-drop PDF upload interface
- **F3.2** Batch upload: up to 20 files per operation
- **F3.3** File constraints: PDF only, max 50MB per file
- **F3.4** Document categorization: Policy (정책), Procedure (절차), Record (기록), Evidence (근거)
- **F3.5** Document tagging: free-form tags for filtering
- **F3.6** Upload history: filename, uploader, timestamp, status
- **F3.7** Document deletion with confirmation (soft delete)
- **F3.8** Real-time upload progress indicator

### F4 — OCR & Text Extraction

- **F4.1** AI-powered text extraction from PDFs including scanned documents
- **F4.2** Table structure preservation in extraction output
- **F4.3** Extraction status tracking: `pending → processing → complete → failed`
- **F4.4** Extracted text stored per document, searchable via keyword
- **F4.5** Retry mechanism for failed extractions (max 3 attempts)
- **F4.6** Extraction confidence scoring per page
- **F4.7** Support for Korean and mixed Korean/English text

### F5 — Accreditation Gap Analysis

- **F5.1** Map extracted document text against accreditation criteria
- **F5.2** Support Korean Long-term Care Hospital Accreditation Standards (4 domains):

  | Domain | Korean | Criteria Count |
  |--------|--------|----------------|
  | Patient Safety | 환자안전 | ~80 |
  | Patient-Centered Care | 환자중심 | ~60 |
  | Governance & Leadership | 지도체계 | ~40 |
  | Safety & Quality Improvement | 안전/질향상 | ~50 |

- **F5.3** Per-criterion compliance status: `Compliant / Partial / Non-compliant / Not Reviewed`
- **F5.4** AI-generated evidence mapping: links document text to criterion
- **F5.5** Gap severity classification: `Critical / Major / Minor`
- **F5.6** AI-generated remediation recommendation per gap
- **F5.7** Overall compliance score (0–100%) calculated as weighted average
- **F5.8** Analysis history: retain last 10 runs per hospital for trend tracking
- **F5.9** Analysis run duration: target < 120 seconds per hospital

### F6 — Dashboard

- **F6.1** Overall compliance score with progress ring visualization
- **F6.2** Domain-level compliance breakdown (radar/spider chart)
- **F6.3** Critical gaps panel — top 5 gaps requiring immediate attention
- **F6.4** Document readiness meter — X of estimated Y required documents uploaded
- **F6.5** Recent activity feed (uploads, analyses, exports)
- **F6.6** Countdown: days remaining to accreditation submission deadline
- **F6.7** Trend line: compliance score over last N analysis runs
- **F6.8** Real-time data via Supabase Realtime subscriptions

### F7 — Report Generation & Export

- **F7.1** Comprehensive gap analysis report exportable as PDF
- **F7.2** Report sections:
  - Executive Summary (score, top 3 gaps, recommendation priority)
  - Domain-level compliance table
  - Criterion-by-criterion detailed breakdown
  - Evidence mapping table (criterion → document → quoted text)
  - Prioritized remediation action plan
- **F7.3** Hospital branding: hospital name, logo (optional), report date
- **F7.4** Report generation time: target < 30 seconds
- **F7.5** Reports stored and retrievable for 12 months

---

## 6. Non-Functional Requirements

### Performance

| Operation | Target SLA |
|-----------|-----------|
| Dashboard load (first meaningful paint) | < 2s |
| PDF upload (10MB file) | < 5s |
| OCR extraction (20-page document) | < 60s |
| Gap analysis run | < 120s |
| Report PDF export | < 30s |

### Security

- All data encrypted at rest (AES-256, Supabase default)
- TLS 1.3 enforced for all client-server communication
- No patient health data (PHI) processed — system operates on administrative/policy documents only
- API keys stored exclusively as server-side environment variables
- Comprehensive audit log for all data access and mutations
- Rate limiting: 100 req/min per authenticated user

### Availability

- Target uptime: 99.5% (monthly)
- Planned maintenance window: Sunday 02:00–04:00 KST
- Graceful degradation: if Claude API is unavailable, queue analysis jobs for retry

### Compliance

- Korean Personal Information Protection Act (PIPA / 개인정보보호법) compliant
- Data residency: Supabase hosted in ap-northeast-1 (Seoul)
- Medical Device Software classification: Class I (administrative decision support, non-clinical)

---

## 7. Success Metrics

| KPI | 3-Month Target | 6-Month Target |
|-----|----------------|----------------|
| Paying hospital tenants | 20 | 50 |
| MRR | ₩10,000,000 | ₩25,000,000 |
| Analysis completion rate | > 93% | > 95% |
| User NPS | > 30 | > 40 |
| Time-to-first-report (from signup) | < 3 hours | < 2 hours |
| Document extraction error rate | < 5% | < 2% |
| Churn rate (monthly) | < 10% | < 5% |

---

## 8. Out of Scope (v1.0)

- Real-time collaborative document editing
- EMR / HIS system integration
- Automated document fetching from hospital internal systems
- Regulatory submission portal integration (HIRA)
- Mobile native applications (iOS / Android)
- Multi-language interface (Korean only for v1.0)
- Custom criteria frameworks beyond Korean accreditation standards

---

## 9. Pricing Model

| Plan | Monthly Price | Limits |
|------|-------------|--------|
| **Starter** | ₩150,000/mo | 1 hospital, 5 users, 50 docs/mo, 5 analyses/mo |
| **Professional** | ₩350,000/mo | 3 hospitals, 20 users, 200 docs/mo, unlimited analyses |
| **Enterprise** | Custom | Unlimited hospitals, SSO, SLA guarantee, dedicated support |

Annual billing: 20% discount.

---

## 10. Assumptions & Risks

| Assumption / Risk | Mitigation |
|-------------------|-----------|
| Claude API accuracy sufficient for Korean document analysis | Pilot test with 20 real hospital documents; include human review step in v1 |
| PDF quality varies (scanned, low-res) | Preprocessing pipeline with image enhancement before OCR |
| Accreditation criteria change between cycles | Criteria stored in database (not hardcoded); admin interface for updates |
| Hospital staff resistance to SaaS tools | Onboarding wizard + video walkthrough + dedicated customer success |

---

*AccrediQ PRD v1.0 — Prepared for architecture review*
