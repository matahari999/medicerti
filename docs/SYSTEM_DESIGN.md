# AccrediQ — System Design Document
**Version:** 1.0.0 | **Date:** 2026-06-22 | **Status:** Draft for Approval

---

## 1. High-Level Architecture

AccrediQ follows a **serverless-first, multi-tenant SaaS** architecture. Vercel handles compute, Supabase handles data/auth/storage, and Anthropic's Claude API handles AI workloads asynchronously.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                 │
│                                                                       │
│   Browser → Next.js 15 App Router (React Server Components)          │
│             TailwindCSS · shadcn/ui · Recharts · React PDF           │
│                                                                       │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTPS / WebSocket (WSS)
┌──────────────────────────────▼───────────────────────────────────────┐
│                         EDGE / API LAYER                              │
│                                                                       │
│   Vercel Edge Network                                                 │
│   ├── Middleware (auth verification, RBAC, rate limiting)             │
│   └── Next.js Route Handlers (/api/*)                                │
│       ├── Node.js Runtime  → heavy operations (PDF, AI calls)        │
│       └── Edge Runtime     → auth, redirects, lightweight responses  │
│                                                                       │
└────────────┬─────────────────────────────────┬───────────────────────┘
             │                                 │
┌────────────▼────────────┐        ┌───────────▼────────────────────┐
│       SUPABASE          │        │        ANTHROPIC CLAUDE API    │
│                         │        │                                │
│  ┌─────────────────┐    │        │  claude-sonnet-4-6             │
│  │   Auth (JWT)    │    │        │  ├── Vision  → OCR extraction  │
│  └─────────────────┘    │        │  └── Text   → Gap analysis     │
│  ┌─────────────────┐    │        │                                │
│  │  PostgreSQL 15  │    │        │  Streaming responses           │
│  │  (RLS enabled)  │    │        │  for real-time progress        │
│  └─────────────────┘    │        └────────────────────────────────┘
│  ┌─────────────────┐    │
│  │  Storage (S3)   │    │
│  │  - documents/   │    │
│  │  - reports/     │    │
│  └─────────────────┘    │
│  ┌─────────────────┐    │
│  │   Realtime      │    │
│  │  (WebSocket)    │    │
│  └─────────────────┘    │
└─────────────────────────┘
```

---

## 2. Repository & Project Structure

```
accrediq/
├── app/                              ← Next.js App Router
│   ├── (auth)/                       ← Unauthenticated routes
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── invite/
│   │       └── [token]/page.tsx
│   ├── (app)/                        ← Authenticated routes
│   │   ├── layout.tsx                ← Protected layout (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← F6: Main dashboard
│   │   ├── hospitals/
│   │   │   ├── page.tsx              ← Hospital list
│   │   │   ├── new/page.tsx          ← Create hospital form
│   │   │   └── [hospitalId]/
│   │   │       ├── page.tsx          ← Hospital overview
│   │   │       ├── documents/
│   │   │       │   └── page.tsx      ← F3: Document management
│   │   │       ├── analysis/
│   │   │       │   └── page.tsx      ← F5: Gap analysis runner
│   │   │       ├── reports/
│   │   │       │   ├── page.tsx      ← Report history
│   │   │       │   └── [reportId]/page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx      ← Hospital settings + members
│   │   └── settings/
│   │       ├── profile/page.tsx
│   │       └── billing/page.tsx
│   ├── api/                          ← Route Handlers (REST API)
│   │   ├── auth/
│   │   │   └── callback/route.ts     ← Supabase OAuth callback
│   │   ├── hospitals/
│   │   │   ├── route.ts              ← GET list, POST create
│   │   │   └── [hospitalId]/
│   │   │       ├── route.ts          ← GET, PATCH, DELETE
│   │   │       └── members/
│   │   │           ├── route.ts      ← GET list, POST invite
│   │   │           └── [userId]/route.ts
│   │   ├── documents/
│   │   │   ├── route.ts              ← GET list
│   │   │   ├── upload/route.ts       ← POST multipart upload
│   │   │   └── [documentId]/
│   │   │       ├── route.ts          ← GET, DELETE
│   │   │       └── extract/route.ts  ← POST trigger OCR
│   │   ├── analysis/
│   │   │   ├── route.ts              ← GET history
│   │   │   ├── run/route.ts          ← POST trigger analysis
│   │   │   └── [runId]/route.ts      ← GET result
│   │   └── reports/
│   │       └── [analysisId]/
│   │           ├── route.ts          ← GET report data
│   │           └── export/route.ts   ← POST generate PDF
│   ├── layout.tsx                    ← Root layout (fonts, providers)
│   └── globals.css
├── components/
│   ├── ui/                           ← shadcn/ui primitives
│   ├── auth/                         ← LoginForm, RegisterForm
│   ├── hospital/                     ← HospitalCard, HospitalForm
│   ├── documents/                    ← DropZone, DocumentTable, StatusBadge
│   ├── analysis/                     ← AnalysisRunner, CriterionRow
│   ├── dashboard/                    ← ComplianceRing, RadarChart, GapList
│   └── reports/                      ← ReportViewer, ExportButton
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client (singleton)
│   │   ├── server.ts                 ← Server-side client (cookies)
│   │   └── middleware.ts             ← Session refresh helper
│   ├── claude/
│   │   ├── client.ts                 ← Anthropic SDK init
│   │   ├── ocr.ts                    ← OCR extraction logic
│   │   └── analysis.ts               ← Gap analysis logic + prompts
│   ├── services/
│   │   ├── hospital.service.ts
│   │   ├── document.service.ts
│   │   ├── analysis.service.ts
│   │   └── report.service.ts
│   ├── validators/                   ← Zod schemas for all inputs
│   ├── utils.ts
│   └── constants.ts                  ← Criteria definitions, scoring weights
├── types/
│   ├── database.types.ts             ← Auto-generated from Supabase
│   ├── analysis.types.ts
│   └── api.types.ts
├── middleware.ts                     ← Auth + RBAC + rate limiting
├── supabase/
│   ├── migrations/                   ← All SQL migrations
│   └── seed.sql                      ← Accreditation criteria seed data
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Processing Pipelines

### 3.1 PDF Upload Pipeline

```
[Browser]
  1. User selects files → FileUpload component validates type/size
  2. POST /api/documents/upload (multipart/form-data)

[API Route — /api/documents/upload]
  3. Verify auth token + hospital membership
  4. Validate: PDF only, ≤ 50MB, filename sanitized
  5. Generate UUID for document
  6. Upload buffer → Supabase Storage: documents/{hospitalId}/{uuid}.pdf
  7. INSERT documents row (status: 'pending', storage_path)
  8. Return document record to client

[Client — Realtime Subscription]
  9. Subscribe to documents table WHERE id = :documentId
  10. Trigger POST /api/documents/{id}/extract (fire-and-forget)
  11. UI shows spinner, polls Realtime for status update
```

### 3.2 OCR Extraction Pipeline

```
[API Route — /api/documents/{id}/extract]
  1. UPDATE documents SET status = 'processing'
  2. Fetch PDF bytes from Supabase Storage
  3. Split PDF into pages (pdf-parse library)
  4. For each page batch (max 5 pages per Claude call):
     a. Base64-encode page image (pdf2pic)
     b. POST to Claude API (claude-sonnet-4-6, vision)
     c. Prompt: "Extract all text preserving structure. Return JSON."
     d. Collect page results
  5. Aggregate all page extractions
  6. INSERT document_extractions row (full_text, page_data JSON)
  7. UPDATE documents SET status = 'extracted', extracted_at = now()
  8. Realtime broadcast → client receives status update

[Error Handling]
  - If Claude API fails: retry up to 3 times with exponential backoff
  - After 3 failures: UPDATE documents SET status = 'failed', error_message
  - Failed jobs surfaced in UI with manual retry option
```

### 3.3 Gap Analysis Pipeline

```
[API Route — /api/analysis/run]
  1. Verify auth + hospital manager/admin role
  2. Fetch all documents WHERE hospital_id AND status = 'extracted'
  3. Fetch concatenated extraction text (max 100K tokens)
  4. If text > limit: prioritize recent documents, log truncation warning
  5. Fetch all accreditation_criteria records (active = true)
  6. INSERT analysis_runs row (status: 'running', started_at)

  7. Call Claude API (claude-sonnet-4-6, streaming):
     - System: Korean accreditation expert persona + output schema
     - User: {documents_text} + {criteria_json} + analysis instructions
     - Stream response to client via Server-Sent Events

  8. Parse JSON response → array of CriterionResult
  9. Calculate domain scores + overall compliance score
  10. INSERT criterion_results rows (bulk insert)
  11. UPDATE analysis_runs SET status = 'complete', score, completed_at

[Scoring Algorithm]
  overall_score = Σ(domain_score × domain_weight) / Σ(domain_weight)

  domain_score = (
    compliant_count × 1.0 +
    partial_count   × 0.5 +
    non_compliant   × 0.0
  ) / total_reviewed_criteria × 100

  Domain weights:
    환자안전 (Patient Safety)         → weight: 1.5
    환자중심 (Patient-Centered)        → weight: 1.2
    지도체계 (Governance)              → weight: 1.0
    안전/질향상 (Quality Improvement)  → weight: 1.0
```

### 3.4 Report Export Pipeline

```
[API Route — /api/reports/{analysisId}/export]
  1. Verify auth + access to analysis run
  2. Fetch: analysis_runs + criterion_results + hospital + documents
  3. Generate PDF via @react-pdf/renderer:
     a. Executive Summary page
     b. Domain compliance table (per-domain score + breakdown)
     c. Criterion detail pages (grouped by domain)
     d. Evidence mapping appendix
     e. Remediation action plan
  4. Upload PDF → Supabase Storage: reports/{hospitalId}/{analysisId}.pdf
  5. INSERT reports row with storage_path, generated_at
  6. Return signed URL (15-minute expiry) for immediate download
```

---

## 4. API Design

### 4.1 Response Envelope

All API responses follow a consistent envelope:

```typescript
// Success
{ "data": T, "meta"?: { pagination } }

// Error
{ "error": { "code": string, "message": string, "details"?: unknown } }
```

### 4.2 Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Authenticated but insufficient role |
| `NOT_FOUND` | 404 | Resource not found or access denied |
| `VALIDATION_ERROR` | 422 | Invalid request body (Zod error) |
| `RATE_LIMITED` | 429 | Too many requests |
| `PROCESSING_ERROR` | 500 | Claude API or internal failure |

### 4.3 Key Endpoints

```
Authentication (via Supabase client-side SDK)
  POST /auth/v1/signup          ← email/password registration
  POST /auth/v1/token           ← login
  POST /auth/v1/recover         ← password reset
  GET  /auth/v1/user            ← current user

Hospitals
  GET    /api/hospitals                          ← list user's hospitals
  POST   /api/hospitals                          ← create hospital
  GET    /api/hospitals/:id                      ← get hospital details
  PATCH  /api/hospitals/:id                      ← update hospital
  DELETE /api/hospitals/:id                      ← delete (admin only)
  GET    /api/hospitals/:id/members              ← list members
  POST   /api/hospitals/:id/members/invite       ← send invite email
  DELETE /api/hospitals/:id/members/:userId      ← remove member

Documents
  GET    /api/documents?hospitalId=:id           ← list documents
  POST   /api/documents/upload                   ← upload PDF
  GET    /api/documents/:id                      ← get document + status
  DELETE /api/documents/:id                      ← soft delete
  POST   /api/documents/:id/extract              ← trigger OCR

Analysis
  POST   /api/analysis/run                       ← trigger gap analysis
  GET    /api/analysis?hospitalId=:id            ← list analysis history
  GET    /api/analysis/:runId                    ← get analysis results

Reports
  GET    /api/reports?analysisId=:id             ← get report data
  POST   /api/reports/:analysisId/export         ← generate + download PDF
```

---

## 5. Claude API Integration Design

### 5.1 OCR Extraction Prompt

```
SYSTEM:
You are a document text extraction specialist for Korean healthcare compliance documents.
Extract ALL text from the provided document image, preserving structure, tables, and headings.

OUTPUT FORMAT (strict JSON):
{
  "page": <number>,
  "text": "<full extracted text>",
  "tables": [
    { "headers": [], "rows": [[]] }
  ],
  "confidence": <0.0-1.0>
}

RULES:
- Preserve Korean characters exactly as written
- Preserve table structure in the tables array
- Include headers, footers, and page numbers
- Flag low-confidence extractions with confidence < 0.8
```

### 5.2 Gap Analysis Prompt

```
SYSTEM:
You are a Korean healthcare accreditation expert specializing in
Long-term Care Hospital Accreditation Standards (요양병원 의료기관인증).

You will receive:
1. Extracted text from hospital documents
2. A list of accreditation criteria to evaluate

For each criterion, analyze whether the provided documents contain
sufficient evidence of compliance.

OUTPUT FORMAT (strict JSON array):
[{
  "criterion_id": "<uuid>",
  "compliance_status": "compliant" | "partial" | "non_compliant" | "not_reviewed",
  "evidence_text": "<quoted text from documents>",
  "evidence_document_hint": "<document name hint>",
  "gap_description": "<specific gap or missing element>",
  "recommendation": "<specific actionable recommendation in Korean>",
  "severity": "critical" | "major" | "minor" | null
}]

COMPLIANCE DEFINITIONS:
- compliant: Documents clearly demonstrate full compliance
- partial: Some evidence exists but incomplete or insufficient
- non_compliant: No relevant evidence found in provided documents
- not_reviewed: Cannot assess due to document quality issues

SEVERITY (for non_compliant and partial only):
- critical: Required by law; patient safety implications
- major: Core accreditation requirement; likely to result in conditional pass
- minor: Documentation gap; unlikely to cause accreditation failure alone
```

### 5.3 Token Budget Management

| Operation | Model | Max Input Tokens | Max Output Tokens |
|-----------|-------|-----------------|------------------|
| OCR (per page batch) | claude-sonnet-4-6 | 8,000 | 2,000 |
| Gap Analysis | claude-sonnet-4-6 | 100,000 | 16,000 |
| Report Summary | claude-sonnet-4-6 | 20,000 | 4,000 |

---

## 6. Security Design

### 6.1 Authentication Flow

```
Browser                 Next.js Middleware          Supabase Auth
  │                           │                         │
  │── GET /app/dashboard ────▶│                         │
  │                           │── verify cookie JWT ──▶│
  │                           │◀─ valid/expired ────────│
  │                           │                         │
  │  [if expired]             │── refresh token ───────▶│
  │                           │◀─ new JWT ──────────────│
  │                           │                         │
  │◀── 200 + refreshed JWT ───│                         │
  │                           │                         │
  │  [if invalid]             │                         │
  │◀── 302 /login ────────────│                         │
```

### 6.2 RBAC Enforcement Layers

```
Layer 1: Middleware (middleware.ts)
  → Redirect unauthenticated users to /login

Layer 2: API Route Guards (lib/auth.ts)
  → requireAuth() → throws 401 if no valid session
  → requireHospitalMember(hospitalId, minRole) → throws 403 if insufficient

Layer 3: Supabase RLS (PostgreSQL)
  → Last-line enforcement — database rejects unauthorized queries
  → Even if API guard is bypassed, RLS blocks data access
```

### 6.3 File Upload Security

```
1. Content-Type validation: must be application/pdf
2. Magic bytes check: first 4 bytes must be %PDF
3. Size limit: 50MB enforced at route handler before streaming to storage
4. Filename sanitization: UUID rename on server, original name stored in DB
5. Storage path: {hospitalId}/{uuid}.pdf — hospitalId verified against session
6. Signed URLs: time-limited (1 hour) for all document access
```

### 6.4 Rate Limiting Strategy

```typescript
// Middleware rate limits (per authenticated user)
const RATE_LIMITS = {
  'default':          { requests: 100, windowMs: 60_000 },   // 100 req/min
  '/api/documents/upload':  { requests: 10,  windowMs: 60_000 },   // 10 uploads/min
  '/api/analysis/run':      { requests: 5,   windowMs: 300_000 },  // 5 analyses/5min
  '/api/reports/*/export':  { requests: 5,   windowMs: 60_000 },   // 5 exports/min
}
// Implementation: in-memory (single-instance) or Upstash Redis (multi-instance)
```

---

## 7. State Management

### 7.1 Server State (React Query / SWR)

- All API data fetched server-side via RSC where possible
- Client-side mutations use SWR's mutate for optimistic updates
- Supabase Realtime subscriptions for live document status updates

### 7.2 Client State (Zustand)

```typescript
// Minimal client state — only truly ephemeral UI state
interface AppStore {
  selectedHospitalId: string | null;
  uploadQueue: UploadQueueItem[];
  analysisProgress: { runId: string; progress: number } | null;
  sidebarCollapsed: boolean;
}
```

### 7.3 Realtime Subscriptions

```typescript
// Document extraction status (per hospital)
supabase
  .channel('documents')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'documents',
    filter: `hospital_id=eq.${hospitalId}`,
  }, (payload) => updateDocumentStatus(payload.new))
  .subscribe()

// Analysis progress
supabase
  .channel('analysis')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'analysis_runs',
    filter: `id=eq.${runId}`,
  }, (payload) => updateAnalysisStatus(payload.new))
  .subscribe()
```

---

## 8. Performance Optimizations

| Strategy | Implementation |
|----------|---------------|
| RSC streaming | Dashboard renders skeleton + streams data chunks |
| Partial Prerendering | Static shell + dynamic data injection |
| Image optimization | next/image for all logo/avatar assets |
| Database indexes | Composite indexes on all foreign keys + status columns |
| Analysis caching | Cache analysis results; invalidate on new document upload |
| PDF page parallelism | OCR processes pages in batches of 5 concurrently |
| Report caching | Pre-generated PDFs served from Storage with signed URLs |

---

## 9. Error Handling & Observability

### 9.1 Error Boundaries

- Client: React error boundaries per page section
- API: try/catch with structured error responses
- AI failures: graceful degradation + user-visible error with retry option

### 9.2 Logging

```typescript
// Structured log format (Vercel logs)
logger.info('analysis.started', {
  hospitalId, runId, documentCount, criteriaCount, userId
})
logger.error('ocr.failed', {
  documentId, attempt, error: error.message, hospitalId
})
```

### 9.3 Monitoring (future)

- Vercel Analytics for Web Vitals
- Sentry for error tracking
- Custom metric: `analysis_completion_rate`, `extraction_success_rate`

---

## 10. Environment Configuration

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>      # Server-side only

# Anthropic
ANTHROPIC_API_KEY=<api-key>                        # Server-side only

# App Config
NEXT_PUBLIC_APP_URL=https://accrediq.com
NEXT_PUBLIC_APP_NAME=AccrediQ

# Feature Flags
NEXT_PUBLIC_MAX_UPLOAD_MB=50
NEXT_PUBLIC_MAX_BATCH_UPLOAD=20
ANALYSIS_TIMEOUT_MS=120000
OCR_MAX_RETRIES=3
```

---

*AccrediQ System Design v1.0 — For architecture review*
