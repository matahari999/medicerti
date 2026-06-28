# AccrediQ — Claude Code 운영 매뉴얼

## 프로젝트 설명
**요양병원/정신병원 의료기관 인증 문서 자동화 SaaS**  
인증을 준비하는 병원에게 PDF 문서를 AI로 분석하고, 규정집·기준집·법정양식·점검표·교육기록·회의록·시정조치서를 자동 생성·관리하는 웹 애플리케이션.

## 실제 기술 스택
- **프레임워크:** Next.js 15 App Router + TypeScript (strict)
- **백엔드:** Next.js API Routes (Route Handlers) — 별도 Express 서버 없음
- **데이터베이스/인증/스토리지:** Supabase (PostgreSQL + Supabase Auth + Storage)
- **AI:** Google Gemini 2.5 Flash (`@google/generative-ai`) · Claude (`@anthropic-ai/sdk`)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **상태 관리:** Zustand + TanStack Query
- **PDF:** `@react-pdf/renderer` (생성) · `pdf-parse` (추출)
- **배포:** Vercel

## 언어 규칙
- **모든 응답은 한국어**로 한다.
- 코드 변경 시 관련 테스트도 함께 수정한다.
- 커밋 메시지는 한국어로 작성한다.
- 변수명·함수명은 영어, 사용자에게 보이는 메시지·에러는 한국어.

## 코드 스타일
- 함수형 컴포넌트 + 화살표 함수 사용.
- 컴포넌트 파일명: PascalCase (`HospitalForm.tsx`).
- 유틸리티 파일명: camelCase (`formatDate.ts`).
- API 응답 통일: `{ data, error, message }`.
- 에러 처리: `try-catch` + 공통 `AppError` 클래스.
- TypeScript `strict` 모드 필수.

## 아키텍처 규칙
```
app/
  (auth)/          ← 로그인·회원가입·비번 찾기
  (app)/           ← 인증 필요 페이지
    dashboard/
    hospitals/[hospitalId]/
      documents/   ← PDF 업로드·추출
      criteria/    ← 인증 기준 매핑
      analysis/    ← Gemini AI 분석 실행
      regulations/ ← 규정집 초안 생성
      managed-docs/← ★ 법정양식·점검표·회의록·시정조치서 관리
      settings/
  (admin)/         ← 플랫폼 관리자 전용
  api/             ← Route Handlers
actions/           ← Server Actions
components/        ← UI 컴포넌트
lib/
  services/        ← 비즈니스 로직
  supabase/        ← Supabase 클라이언트
  hooks/           ← 커스텀 훅
types/             ← TypeScript 타입
supabase/
  migrations/      ← SQL 마이그레이션
```

## 데이터베이스 규칙
- 모든 데이터는 `hospital_id` 기반으로 격리한다.
- 쿼리 시 항상 `hospital_id` 필터 적용.
- RLS(Row Level Security) 정책은 `supabase/migrations/`에 SQL로 관리.
- 스키마 변경 시 반드시 새 마이그레이션 파일 생성 (`YYYYMMDDHHMMSS_description.sql`).

## 병원 유형 분리 규칙
- `hospital.type` 필드: `long_term_care` (요양병원) | `psychiatric` (정신병원).
- 인증 기준 데이터: `accreditation_criteria` 테이블에서 `hospital_type` 컬럼으로 필터.
- 템플릿/문서도 병원 유형별로 분리 생성.

## 문서 상태 워크플로우
```
draft → under_review → approved → archived
초안    검토중          승인완료    보관
```
- 상태 변경은 `managed_documents` 테이블에서 `managed_doc_status` ENUM으로 관리.
- 모든 상태 변경은 `audit_logs`에 기록.

## 감사 로그 및 권한
- 모든 문서 생성/수정/승인/삭제는 `audit_logs`에 기록.
- 사용자 권한: `admin` (관리자) · `manager` (인증담당자) · `viewer` (열람자).
- 권한 없는 접근 → `403 Forbidden`.

## 파일 생성 규칙
- 새 파일은 관련 디렉터리에 바로 생성; 임의 파일 생성 금지.
- 구현 전 반드시 관련 파일을 먼저 읽어 현재 구조를 파악한다.

## 커맨드
```bash
npm run dev        # 개발 서버 (포트 3500)
npm run build      # 프로덕션 빌드
npm run type-check # 타입 오류 확인
npm run lint       # ESLint
npm run db:push    # Supabase 마이그레이션 적용
```

## 절대 금지
- `.env.local` 파일 커밋 금지.
- `main` 브랜치 직접 push 금지.
- 인증 정보·비밀번호를 소스 코드에 포함 금지.
- 요양병원/정신병원 템플릿 혼용 금지.
- 실행 결과 없이 Hallucination 출력 금지.

## 성공 기준
- `npm run type-check` 오류 없음.
- `npm run build` 성공.
- 병원 등록 → 문서 업로드 → AI 분석 → 기준 매핑 → 규정집 생성 → 관리 문서 초안·승인·보관 흐름이 이어짐.
- 요양병원/정신병원 기준이 분리됨.
