# AccrediQ — Implementation Plan
**Version:** 1.0.0 | **Date:** 2026-06-22 | **Target:** Production-ready MVP

---

## Overview

6-phase plan from project setup to production launch. Each phase produces a deployable, testable milestone. No phase begins until the previous one is verified.

**Total estimate:** 6 weeks (1 developer) | 3 weeks (2 developers)

---

## Phase 0 — Project Setup & Infrastructure (Day 1–2)

**Goal:** Working skeleton deployed to Vercel with Supabase connected.

### 0.1 Repository & Tooling

- [ ] `npx create-next-app@latest accrediq --typescript --tailwind --app --src-dir=false`
- [ ] Configure `tsconfig.json` strict mode + path aliases (`@/components`, `@/lib`, `@/types`)
- [ ] Install core dependencies:
  ```bash
  npm install @supabase/supabase-js @supabase/ssr
  npm install @anthropic-ai/sdk
  npm install zustand
  npm install zod
  npm install @react-pdf/renderer
  npm install pdf-parse pdf2pic
  npm install recharts
  npm install clsx tailwind-merge
  npm install lucide-react
  ```
- [ ] Install shadcn/ui: `npx shadcn@latest init`
- [ ] Add shadcn components: `button card input label badge table dialog sheet tabs progress skeleton toast`
- [ ] Configure `tailwind.config.ts` with custom AccrediQ brand colors
- [ ] Set up ESLint + Prettier + Husky pre-commit hooks
- [ ] Create `.env.local` from `.env.example`

### 0.2 Supabase Project

- [ ] Create Supabase project in `ap-northeast-1` (Seoul) region
- [ ] Install Supabase CLI: `npm install -D supabase`
- [ ] `supabase init` — initialize local config
- [ ] `supabase login && supabase link --project-ref <ref>`
- [ ] Run migrations:
  ```bash
  supabase db push  # applies all migration files
  ```
- [ ] Enable Supabase Realtime for: `documents`, `analysis_runs`
- [ ] Create Storage buckets: `documents` (private, 50MB, PDF only), `reports` (private, 20MB, PDF only)
- [ ] Copy Supabase URL and keys to `.env.local`

### 0.3 Vercel Deployment

- [ ] Push repo to GitHub (`matahari999` account)
- [ ] Connect GitHub repo to Vercel project
- [ ] Configure environment variables in Vercel dashboard
- [ ] Verify: `https://accrediq.vercel.app` returns 200
- [ ] Set up staging branch: `staging` → `staging.accrediq.vercel.app`

### 0.4 Type Generation

- [ ] `supabase gen types typescript --linked > types/database.types.ts`
- [ ] Create `types/analysis.types.ts` and `types/api.types.ts` manually

**Checkpoint:** Blank Next.js app accessible at Vercel URL with Supabase connection verified.

---

## Phase 1 — Authentication & Hospital Management (Day 3–6)

**Goal:** Users can register, log in, create hospitals, and manage team members.

### 1.1 Supabase Auth Setup

- [ ] Create `lib/supabase/client.ts` (browser singleton)
  ```typescript
  import { createBrowserClient } from '@supabase/ssr'
  export const createClient = () =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ```
- [ ] Create `lib/supabase/server.ts` (server-side with cookies)
- [ ] Create `middleware.ts` — session refresh + auth guard for `/(app)/**` routes
- [ ] Create `lib/auth.ts` — `requireAuth()` and `requireHospitalMember()` helpers

### 1.2 Auth Pages

- [ ] `/login` page — email/password form + "Forgot password" link
- [ ] `/register` page — name, email, password fields + validation (Zod)
- [ ] `/forgot-password` page — email input → Supabase reset email
- [ ] `/invite/[token]` page — accept invite, set password if new user
- [ ] Auth forms: client components, error display, loading states, redirect on success

### 1.3 Profiles

- [ ] Verify `handle_new_user` trigger works on signup
- [ ] `GET /api/profile` — fetch current user profile
- [ ] `PATCH /api/profile` — update name, job title, phone
- [ ] `/settings/profile` page — profile form

### 1.4 Hospital Management

- [ ] `GET /api/hospitals` — list hospitals for current user
- [ ] `POST /api/hospitals` — create hospital (Zod validation)
- [ ] `GET /api/hospitals/:id` — get hospital (member check)
- [ ] `PATCH /api/hospitals/:id` — update (manager/admin only)
- [ ] `DELETE /api/hospitals/:id` — soft-archive (admin only)
- [ ] `/hospitals` page — grid of HospitalCard components
- [ ] `/hospitals/new` page — HospitalForm (name, license, type, bed count, region, deadline)
- [ ] `/hospitals/[id]` overview page — hospital info, member list, compliance score ring

### 1.5 Team Member Management

- [ ] `GET /api/hospitals/:id/members` — list members
- [ ] `POST /api/hospitals/:id/members/invite` — send invite email via Supabase Auth
- [ ] `PATCH /api/hospitals/:id/members/:userId` — change role
- [ ] `DELETE /api/hospitals/:id/members/:userId` — remove member
- [ ] Members section in hospital settings page
- [ ] Invite modal with email + role selector

**Checkpoint:** Full auth flow working. Hospital creation, editing, and member management functional. RLS verified (test cross-hospital data access is blocked).

---

## Phase 2 — Document Upload & OCR (Day 7–11)

**Goal:** Users can upload PDFs; system extracts text automatically.

### 2.1 Document Upload API

- [ ] `POST /api/documents/upload` route handler:
  ```
  1. Parse multipart form data (formidable or native)
  2. Validate: PDF magic bytes, size ≤ 50MB, hospital membership
  3. Generate UUID filename
  4. Upload to Supabase Storage: documents/{hospitalId}/{uuid}.pdf
  5. INSERT documents record (status: pending)
  6. Fire-and-forget: call /api/documents/{id}/extract
  7. Return document record
  ```
- [ ] `GET /api/documents` — list with filters (status, category, tags)
- [ ] `DELETE /api/documents/:id` — soft delete (set deleted_at)

### 2.2 Upload UI

- [ ] `DropZone` component — react-dropzone, PDF-only filter, size display
- [ ] Batch upload queue UI — shows each file with progress bar
- [ ] `DocumentTable` component — sortable list with status badges
- [ ] `StatusBadge` component — pending/processing/extracted/failed with icons
- [ ] Real-time status updates via Supabase Realtime subscription:
  ```typescript
  // Subscribe to document updates for this hospital
  channel.on('postgres_changes', { table: 'documents', filter: `hospital_id=eq.${id}` }, handler)
  ```
- [ ] `/hospitals/[id]/documents` page — DropZone + DocumentTable + filter/search bar

### 2.3 OCR Extraction Engine

- [ ] `lib/claude/ocr.ts` — core extraction logic:
  ```typescript
  async function extractDocument(documentId: string): Promise<void> {
    // 1. Fetch PDF from Supabase Storage (signed URL)
    // 2. Convert PDF pages to images (pdf2pic)
    // 3. Batch pages (5 per Claude call)
    // 4. Call Claude vision API per batch
    // 5. Parse JSON response
    // 6. Aggregate page results
    // 7. INSERT document_extractions
    // 8. UPDATE documents status
  }
  ```
- [ ] `POST /api/documents/:id/extract` route handler:
  - Check status is `pending` or `failed` (idempotency)
  - UPDATE status to `processing`
  - Call `extractDocument()` with error handling
  - On failure: UPDATE status to `failed`, increment `extraction_attempts`
  - Retry gate: if `extraction_attempts >= 3`, mark as permanently failed
- [ ] Claude OCR prompt (from system design) + response parser
- [ ] `GET /api/documents/:id/extraction` — return extraction preview (first 500 chars + confidence)

### 2.4 Extraction UI

- [ ] Show extraction status in DocumentTable (with animated spinner for `processing`)
- [ ] Document detail drawer/sheet — shows extracted text preview
- [ ] Manual retry button for failed extractions
- [ ] Extraction confidence indicator (color-coded: green > 0.85, yellow > 0.7, red ≤ 0.7)

**Checkpoint:** Upload 5 real PDF documents (Korean policy docs), verify extraction text accuracy. Check Realtime status updates work end-to-end.

---

## Phase 3 — Accreditation Gap Analysis (Day 12–17)

**Goal:** System analyzes extracted documents against 230 accreditation criteria and produces scored results.

### 3.1 Criteria Data

- [ ] Write full `supabase/migrations/20260622000005_seed_criteria.sql` with all 230 criteria (4 domains)
  - Patient Safety (환자안전): PS-01 through PS-80
  - Patient-Centered Care (환자중심): PC-01 through PC-60
  - Governance & Leadership (지도체계): GL-01 through GL-40
  - Quality & Safety (안전/질향상): QS-01 through QS-50
- [ ] `GET /api/criteria` — paginated criteria list with domain filter
- [ ] `lib/constants.ts` — domain codes, weights, scoring formula

### 3.2 Gap Analysis Engine

- [ ] `lib/claude/analysis.ts` — core analysis logic:
  ```typescript
  async function runGapAnalysis(hospitalId: string, runId: string): Promise<void> {
    // 1. Fetch all extracted documents for hospital
    // 2. Concatenate full_text (respect token budget: max 100K tokens)
    // 3. Fetch all active accreditation_criteria
    // 4. Build analysis prompt
    // 5. Stream Claude API response
    // 6. Parse JSON array of CriterionResult
    // 7. Validate response schema (Zod)
    // 8. Bulk INSERT criterion_results
    // 9. Calculate scores via calculate_analysis_score()
    // 10. UPDATE analysis_runs with scores + status = 'complete'
  }
  ```
- [ ] Token budget management: `estimateTokens()` helper, truncation strategy
- [ ] Response parser: validates each `CriterionResult` against Zod schema, handles partial JSON
- [ ] Score calculation: call `calculate_analysis_score()` and `get_domain_scores()` DB functions

### 3.3 Analysis API

- [ ] `POST /api/analysis/run` — trigger analysis:
  - Verify manager/admin role
  - Check at least 1 extracted document exists
  - Insert `analysis_runs` row (status: queued)
  - Stream progress via Server-Sent Events:
    ```
    data: {"stage": "preparing", "progress": 5}
    data: {"stage": "analyzing", "progress": 30}
    data: {"stage": "scoring", "progress": 90}
    data: {"stage": "complete", "progress": 100, "runId": "..."}
    ```
- [ ] `GET /api/analysis/:runId` — full analysis result with criterion_results
- [ ] `GET /api/analysis?hospitalId=:id` — analysis history (last 10)

### 3.4 Analysis UI

- [ ] `/hospitals/[id]/analysis` page:
  - "Run Analysis" button (disabled if no extracted docs)
  - Progress bar with stage labels (streaming SSE)
  - Last analysis timestamp + score
  - Analysis history list
- [ ] `CriterionResultRow` component — expandable row showing:
  - Code + title
  - Status badge (color-coded)
  - Severity badge
  - Evidence text (collapsed, expandable)
  - Recommendation text
- [ ] Domain tabs — switch between PS / PC / GL / QS views
- [ ] Filter: compliance status, severity, domain
- [ ] Sort: by severity, by score

**Checkpoint:** Run full analysis on sample hospital with 10+ documents. Verify criterion mapping accuracy (manual spot-check 20 criteria). Confirm scores calculate correctly.

---

## Phase 4 — Dashboard & Reports (Day 18–22)

**Goal:** Visual dashboard and exportable PDF report.

### 4.1 Dashboard

- [ ] `/dashboard` page (or `/hospitals/[id]` overview):
  - **Compliance Score Ring** — circular progress, overall score, color (red < 60, yellow < 80, green ≥ 80)
  - **Domain Radar Chart** — 4-axis chart showing PS/PC/GL/QS scores (Recharts RadarChart)
  - **Critical Gaps Panel** — top 5 `critical` severity gaps with criterion code + title
  - **Document Readiness** — `extracted_count / total_uploaded` progress bar
  - **Activity Feed** — last 10 events (uploads, analyses, exports)
  - **Deadline Countdown** — days remaining to `accreditation_target`, red if < 30 days
  - **Score Trend** — line chart of last 10 analysis run scores (Recharts LineChart)
- [ ] All chart data fetched server-side (RSC), streamed with Suspense boundaries
- [ ] Real-time: dashboard refreshes when new analysis completes via Realtime

### 4.2 Report Generation

- [ ] `lib/services/report.service.ts` — assemble report data object:
  ```typescript
  interface ReportData {
    hospital: Hospital;
    analysisRun: AnalysisRun;
    domainBreakdowns: DomainBreakdown[];
    criterionResults: CriterionResult[];
    topGaps: CriterionResult[];       // critical + major gaps
    remediationPlan: RemediationItem[]; // sorted by severity
  }
  ```
- [ ] `POST /api/reports/:analysisId/export` — generate PDF:
  - Build ReportData
  - Render PDF with `@react-pdf/renderer`:
    - Cover page: Hospital name, AccrediQ logo, analysis date, overall score
    - Executive Summary (1 page): score ring, top 3 gaps, overall readiness level
    - Domain Breakdown (1 page): table with 4 domain scores + gap counts
    - Detailed Criteria (N pages): grouped by domain, each criterion a row
    - Evidence Appendix: criterion → quoted evidence text
    - Remediation Action Plan: table sorted by severity with recommendations
  - Upload PDF to Storage: `reports/{hospitalId}/{analysisId}.pdf`
  - INSERT reports record
  - Return signed URL (15-min expiry)
- [ ] `GET /api/reports?hospitalId=:id` — list past reports

### 4.3 Report UI

- [ ] `/hospitals/[id]/reports` page — list of generated reports with timestamps
- [ ] Report viewer page — embedded iframe for PDF preview
- [ ] "Generate Report" button on analysis result page
- [ ] Download button (opens signed URL)
- [ ] Report metadata: pages, size, generated by, date

**Checkpoint:** Generate report from a completed analysis. Verify PDF renders correctly with Korean text. Check all sections present. Verify report signed URL expires correctly.

---

## Phase 5 — Polish, Security & Launch Prep (Day 23–28)

**Goal:** Production-hardened, tested, and documented.

### 5.1 Security Hardening

- [ ] Rate limiting in middleware (in-memory or Upstash Redis):
  - Default: 100 req/min
  - `/api/documents/upload`: 10/min
  - `/api/analysis/run`: 5 per 5 minutes
- [ ] Input validation: Zod schemas on ALL route handler inputs
- [ ] File validation: magic bytes check (`%PDF`) in addition to Content-Type
- [ ] Audit logging: INSERT to `audit_logs` for all create/update/delete operations
- [ ] Review all RLS policies — test cross-tenant data isolation with test accounts
- [ ] Environment variable audit: no secrets in `NEXT_PUBLIC_` variables
- [ ] Dependency audit: `npm audit` — fix all high/critical vulnerabilities
- [ ] CORS: restrict API routes to AccrediQ domains only

### 5.2 Error Handling & UX

- [ ] Global error boundary per route group
- [ ] Toast notifications for all async operations (success and error states)
- [ ] Loading skeletons for all data-fetching components
- [ ] Empty states for: no hospitals, no documents, no analyses
- [ ] Offline detection: show banner if Supabase Realtime disconnects
- [ ] 404 and 500 custom error pages
- [ ] Form validation errors with field-level feedback
- [ ] Session expiry: show "Session expired" modal with re-login prompt

### 5.3 Performance

- [ ] Verify Lighthouse score ≥ 80 on dashboard page
- [ ] Add database indexes: verify all FK columns and status filter columns are indexed
- [ ] Cache analysis results: revalidate only on new document upload
- [ ] Lazy-load PDF viewer iframe
- [ ] Image optimization: convert any uploaded logos to WebP

### 5.4 Testing

- [ ] Unit tests (Jest):
  - `calculateAnalysisScore()` with various compliance distributions
  - PDF file validation logic
  - Token budget estimation
- [ ] Integration tests (Playwright or Cypress):
  - Full auth flow (register → login → logout → password reset)
  - Document upload → extraction → status update flow
  - Analysis run → dashboard score update
  - Report generation → download
- [ ] RLS tests: create two test users/hospitals, verify data isolation
- [ ] Claude API mock: stub responses for CI pipeline

### 5.5 Observability

- [ ] Structured logging on all API routes (console.log → structured JSON for Vercel)
- [ ] Vercel Analytics enabled
- [ ] Custom metrics logged to `audit_logs`: analysis duration, token usage, extraction confidence
- [ ] Alert strategy: Vercel error alerts for 5xx error rate > 1%

### 5.6 Documentation

- [ ] README.md: project overview, local setup instructions, env vars list
- [ ] CONTRIBUTING.md: branch strategy, PR process, migration guide
- [ ] API collection: Postman/Bruno collection for all endpoints
- [ ] Deployment runbook: Supabase migration + Vercel deploy steps

**Checkpoint:** All Playwright tests pass. Lighthouse ≥ 80. RLS isolation verified. Zero high/critical npm vulnerabilities.

---

## Phase 6 — Go-Live (Day 28–30)

### 6.1 Production Infrastructure

- [ ] Custom domain: `accrediq.com` → Vercel DNS
- [ ] SSL certificate: auto-provisioned by Vercel
- [ ] Supabase production project: separate from dev (same Seoul region)
- [ ] Run all migrations on production Supabase: `supabase db push --linked`
- [ ] Seed accreditation criteria to production: `supabase db reset --linked` (criteria only)
- [ ] Verify Supabase Realtime enabled on production

### 6.2 Pre-Launch Checklist

- [ ] All environment variables set in Vercel production environment
- [ ] Test registration + full flow on production URL
- [ ] Test PDF upload and OCR on production
- [ ] Test analysis run on production (verify Claude API key works)
- [ ] Test report export on production
- [ ] Confirm Supabase Storage bucket policies are set to private
- [ ] Confirm no `console.log` statements exposing sensitive data
- [ ] robots.txt: disallow `/api/*` and `/app/*`
- [ ] Privacy policy and terms pages linked from auth pages

### 6.3 Soft Launch

- [ ] Invite 3 beta hospitals (known contacts)
- [ ] Monitor Vercel error logs for 48 hours
- [ ] Monitor Supabase dashboard: query performance, connection pool
- [ ] Collect feedback via in-app feedback button
- [ ] Fix critical bugs within 24 hours
- [ ] Announce to waitlist after 1 week stable operation

---

## Dependency Graph

```
Phase 0 (Infrastructure)
    ↓
Phase 1 (Auth + Hospitals)
    ↓
Phase 2 (Documents + OCR)
    ↓
Phase 3 (Gap Analysis)          ← depends on Phase 2 (extractions)
    ↓
Phase 4 (Dashboard + Reports)   ← depends on Phase 3 (analysis results)
    ↓
Phase 5 (Polish)                ← can begin in parallel with Phase 4
    ↓
Phase 6 (Launch)
```

---

## Package Manifest

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@anthropic-ai/sdk": "^0.x",
    "@react-pdf/renderer": "^3.x",
    "recharts": "^2.x",
    "zustand": "^5.x",
    "zod": "^3.x",
    "pdf-parse": "^1.x",
    "pdf2pic": "^3.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "tailwindcss": "^3.x",
    "@types/node": "^20.x",
    "@types/react": "^19.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "husky": "^9.x",
    "jest": "^29.x",
    "@playwright/test": "^1.x",
    "supabase": "^1.x"
  }
}
```

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Claude API accuracy insufficient for Korean docs | Medium | High | Pilot test 20 real docs before Phase 3; add human review flag |
| Scanned PDF quality too low for OCR | Medium | Medium | Image preprocessing (contrast/deskew) before Claude vision call |
| Analysis token limit exceeded for large hospitals | Low | Medium | Chunking strategy + document prioritization by recency/category |
| Supabase free tier limits hit in beta | Low | Low | Upgrade to Pro tier at first paying customer |
| Korean PDF font encoding issues | Medium | Medium | Test with actual hospital documents in Phase 2 |
| Report PDF Korean text rendering | Low | High | Embed Noto Sans KR font in react-pdf renderer |

---

*AccrediQ Implementation Plan v1.0 — Awaiting architecture approval before coding begins*
