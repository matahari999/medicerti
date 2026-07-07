"""
KOIHA(의료기관평가인증원, ae.koiha.or.kr) 인트라넷 자동 동기화.

흐름:
  1. Playwright로 로그인(세션 재사용) → 대상 게시판 순회
  2. 새/변경된 글만 골라 첨부파일(PDF/HWP) 다운로드 → Supabase Storage(koiha-archive) 업로드
  3. PDF는 텍스트 추출 → 청크 분할 → Gemini 임베딩 → standard_chunks에 AUTO- 네임스페이스로 upsert
  4. notices 테이블에 공지 upsert (medicerti /notices 대시보드가 즉시 반영)
  5. koiha_sync_log로 멱등성 보장 (재실행 시 이미 처리한 글은 건너뜀)

첫 실행 전 준비:
  - D:\\medicerti\\.env.local 에 KOIHA_USERNAME / KOIHA_PASSWORD / SUPABASE_SERVICE_ROLE_KEY 채우기
  - python -m venv venv && venv\\Scripts\\pip install -r requirements.txt && venv\\Scripts\\playwright install chromium

주의: 로그인 폼 셀렉터(id_selectors/pw_selectors)는 실제 로그인 화면을 열어보지 않고
일반적인 패턴으로 작성했다. 로그인 실패 시 logs/login_form_debug.png를 확인해서
이 파일의 id_selectors 값을 실제 input name/id로 수정할 것.
"""
from __future__ import annotations

import hashlib
import logging
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx
from dotenv import load_dotenv
from playwright.sync_api import Locator, Page, sync_playwright
from pypdf import PdfReader
from supabase import Client, create_client

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

HOME_URL = "https://ae.koiha.or.kr/mdl/crt/medmain.do"
BOARD_URL = "https://ae.koiha.or.kr/com/PageMove.do?linkPage={code}"

STATE_PATH = BASE_DIR / "storage_state.json"
DOWNLOAD_DIR = BASE_DIR / "downloads"
LOG_DIR = BASE_DIR / "logs"

# 대상 게시판: 표시명 -> linkPage 코드 (실제 로그인 후 메뉴에서 확인한 값)
BOARDS = {
    "기준 자료실": "medStandardMan",
    "기준 공지사항": "medStandardBbs",
    "의료기관자료실": "medRecsroom",
    "의료기관공지사항": "medNotice",
}

# 연속으로 이미 처리된 글을 이만큼 만나면 해당 게시판은 그만 넘긴다 (증분 동기화)
STOP_AFTER_SEEN_STREAK = 5
MAX_PAGES_PER_BOARD = 30

HOSPITAL_TYPE_KEYWORDS = [
    ("급성기", "acute"),
    ("요양", "nursing"),
    ("정신", "psychiatric"),
    ("치과", "dental"),
    ("한방", "korean"),
    ("재활", "rehabilitation"),
    ("기본", "basic"),
]
URGENT_KEYWORDS = ["개정", "공표", "필수", "의무"]

GEMINI_EMBED_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "text-embedding-004:embedContent"
)


def setup_logging() -> logging.Logger:
    LOG_DIR.mkdir(exist_ok=True)
    log_file = LOG_DIR / f"sync_{datetime.now():%Y%m%d_%H%M%S}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout),
        ],
    )
    return logging.getLogger("koiha_sync")


def get_supabase() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다."
        )
    return create_client(url, key)


def embed_text(text: str, api_key: str) -> list[float]:
    resp = httpx.post(
        GEMINI_EMBED_URL,
        headers={"Content-Type": "application/json", "x-goog-api-key": api_key},
        json={
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": text[:8000]}]},
        },
        timeout=30.0,
    )
    resp.raise_for_status()
    return resp.json()["embedding"]["values"]


def infer_hospital_type(title: str) -> str:
    for kw, code in HOSPITAL_TYPE_KEYWORDS:
        if kw in title:
            return code
    return "other"


def infer_urgency(title: str) -> str:
    return "high" if any(k in title for k in URGENT_KEYWORDS) else "medium"


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def split_by_length(text: str, max_chars: int) -> list[str]:
    sentences = re.split(r"(?<=[.!?。])\s+", text)
    chunks: list[str] = []
    current = ""
    for s in sentences:
        if len(current) + len(s) > max_chars and current:
            chunks.append(current.strip())
            current = s
        else:
            current += (" " if current else "") + s
    if current.strip():
        chunks.append(current.strip())
    return chunks


def chunk_text(text: str, max_chars: int = 1200) -> list[str]:
    """standardCatalog 스타일 '제N조'/기준 패턴을 우선 존중해서 분할, 없으면 문장 단위."""
    article_pattern = re.compile(r"(제\s*\d+\s*조[^\n]*\n(?:.*\n)*?)(?=제\s*\d+\s*조|\Z)")
    articles = article_pattern.findall(text)
    if articles and sum(len(a) for a in articles) > len(text) * 0.5:
        chunks: list[str] = []
        for article in articles:
            chunks.extend(split_by_length(article.strip(), max_chars))
        return chunks
    return split_by_length(text, max_chars)


def first_match(page: Page, selectors: list[str]) -> Locator | None:
    for sel in selectors:
        loc = page.locator(sel).first
        try:
            if loc.count() > 0:
                return loc
        except Exception:
            continue
    return None


def login(page: Page, username: str, password: str, logger: logging.Logger) -> None:
    page.goto(HOME_URL, wait_until="networkidle")
    if page.locator("text=나가기").count() > 0:
        logger.info("기존 세션(storage_state)으로 로그인 확인됨")
        return

    logger.info("세션 만료 — 재로그인 시도")
    id_selectors = [
        "input[name='userId']",
        "input[name='mbrId']",
        "input[name='loginId']",
        "input[name='id']",
        "input[type='text']",
        "input[type='email']",
    ]
    pw_selectors = ["input[type='password']"]

    id_input = first_match(page, id_selectors)
    pw_input = first_match(page, pw_selectors)
    if not id_input or not pw_input:
        LOG_DIR.mkdir(exist_ok=True)
        shot = LOG_DIR / "login_form_debug.png"
        page.screenshot(path=str(shot))
        raise RuntimeError(
            f"로그인 폼 셀렉터를 찾지 못했습니다. {shot} 확인 후 "
            "sync.py의 id_selectors/pw_selectors를 실제 input name으로 수정하세요."
        )

    id_input.fill(username)
    pw_input.fill(password)
    pw_input.press("Enter")
    page.wait_for_load_state("networkidle")

    if page.locator("text=나가기").count() == 0:
        LOG_DIR.mkdir(exist_ok=True)
        shot = LOG_DIR / "login_failed_debug.png"
        page.screenshot(path=str(shot))
        raise RuntimeError(
            f"로그인 실패로 보입니다. {shot} 확인 — 계정/비밀번호 오류 또는 캡차 여부를 점검하세요."
        )

    logger.info("로그인 성공, 세션 저장")
    page.context.storage_state(path=str(STATE_PATH))


def parse_detail(body_text: str) -> dict:
    """게시글 상세 본문 텍스트에서 작성자/등록일/첨부파일명/본문을 뽑아낸다."""
    author = ""
    m = re.search(r"작성자\s*:\s*([^\|]+)\|", body_text)
    if m:
        author = m.group(1).strip()

    published = ""
    m = re.search(r"등록일\s*:\s*(\d{4}-\d{2}-\d{2})", body_text)
    if m:
        published = m.group(1)

    attachments = re.findall(r"첨부파일\s*:\s*([^\n]+\.(?:pdf|hwp|hwpx|docx?|xlsx?))", body_text, re.I)

    body_start = body_text.find("등록일")
    body_content = body_text[body_start:] if body_start >= 0 else body_text
    body_content = re.split(r"\n목록\n", body_content)[0]

    return {
        "author": author,
        "published": published,
        "attachments": [a.strip() for a in attachments],
        "content": body_content.strip()[:4000],
    }


def sync_board(
    page: Page,
    board_name: str,
    board_code: str,
    supabase: Client,
    gemini_key: str,
    logger: logging.Logger,
) -> None:
    logger.info(f"=== 게시판 시작: {board_name} ({board_code}) ===")
    page.goto(BOARD_URL.format(code=board_code), wait_until="networkidle")

    seen_streak = 0
    page_num = 1

    while page_num <= MAX_PAGES_PER_BOARD:
        rows = page.locator("table tbody tr")
        row_count = rows.count()
        if row_count == 0:
            break

        row_titles = []
        for i in range(row_count):
            link = rows.nth(i).locator("a").first
            if link.count() == 0:
                continue
            title = link.inner_text().strip()
            if len(title) < 4:
                continue
            row_titles.append(title)

        for title in row_titles:
            post_key = hashlib.sha1(f"{board_code}:{title}".encode("utf-8")).hexdigest()[:16]
            existing = (
                supabase.table("koiha_sync_log")
                .select("id, content_hash")
                .eq("board", board_code)
                .eq("post_key", post_key)
                .execute()
            )

            link = page.locator("a", has_text=title).first
            try:
                link.click()
                page.wait_for_timeout(700)
            except Exception as e:
                logger.warning(f"행 클릭 실패, 건너뜀: {title[:40]} ({e})")
                continue

            body_text = page.locator("body").inner_text()
            detail = parse_detail(body_text)
            chash = content_hash(detail["content"])

            if existing.data and existing.data[0]["content_hash"] == chash:
                seen_streak += 1
                logger.info(f"  [스킵-동일] {title[:50]}")
            else:
                seen_streak = 0
                process_post(
                    page, board_name, board_code, post_key, title, detail, chash,
                    supabase, gemini_key, logger,
                )

            page.goto(BOARD_URL.format(code=board_code), wait_until="networkidle")

            if seen_streak >= STOP_AFTER_SEEN_STREAK:
                logger.info(f"{board_name}: 이미 처리된 글이 {STOP_AFTER_SEEN_STREAK}건 연속 → 증분 동기화 종료")
                return

        next_link = page.locator("a", has_text="다음 페이지").first
        if next_link.count() == 0:
            break
        try:
            next_link.click()
            page.wait_for_timeout(700)
        except Exception:
            break
        page_num += 1

    logger.info(f"=== 게시판 종료: {board_name} ===")


def process_post(
    page: Page,
    board_name: str,
    board_code: str,
    post_key: str,
    title: str,
    detail: dict,
    chash: str,
    supabase: Client,
    gemini_key: str,
    logger: logging.Logger,
) -> None:
    logger.info(f"  [신규/변경] {title[:60]}")
    DOWNLOAD_DIR.mkdir(exist_ok=True)
    post_dir = DOWNLOAD_DIR / post_key
    post_dir.mkdir(exist_ok=True)

    pdf_texts: list[str] = []
    for att_name in detail["attachments"]:
        try:
            att_link = page.locator("a", has_text=att_name).first
            with page.expect_download(timeout=15000) as dl_info:
                att_link.click()
            download = dl_info.value
            dest = post_dir / att_name
            download.save_as(str(dest))

            storage_path = f"{board_code}/{post_key}/{att_name}"
            with open(dest, "rb") as f:
                supabase.storage.from_("koiha-archive").upload(
                    storage_path, f, {"upsert": "true"}
                )
            logger.info(f"    첨부 업로드: {storage_path}")

            if att_name.lower().endswith(".pdf"):
                try:
                    reader = PdfReader(str(dest))
                    text = "\n".join(p.extract_text() or "" for p in reader.pages)
                    pdf_texts.append(text)
                except Exception as e:
                    logger.warning(f"    PDF 텍스트 추출 실패: {att_name} ({e})")
            else:
                logger.info(f"    {att_name}: 텍스트 추출 미지원(HWP 등) — 파일만 보관")
        except Exception as e:
            logger.warning(f"    첨부파일 처리 실패: {att_name} ({e})")

    published_at = detail["published"] or datetime.now(timezone.utc).date().isoformat()
    hospital_type = infer_hospital_type(title)
    notice_row = {
        "title": title,
        "content": detail["content"] or f"[{board_name}] 첨부파일 참고: {', '.join(detail['attachments'])}",
        "source": "koiha",
        "source_url": HOME_URL,
        "urgency": infer_urgency(title),
        "target_hospital_types": [] if hospital_type in ("other", "basic") else [hospital_type],
        "published_at": published_at,
    }
    notice_res = supabase.table("notices").upsert(notice_row).execute()
    notice_id = notice_res.data[0]["id"] if notice_res.data else None

    synced_to_chunks = False
    full_text = "\n\n".join(pdf_texts).strip()
    if full_text:
        chunks = chunk_text(full_text)
        for idx, chunk in enumerate(chunks):
            try:
                embedding = embed_text(chunk, gemini_key)
                supabase.table("standard_chunks").upsert(
                    {
                        "hospital_type": hospital_type,
                        "chapter_number": board_name,
                        "item_number": f"AUTO-{post_key}-{idx}",
                        "item_title": title[:200],
                        "content": chunk,
                        "embedding": embedding,
                    },
                    on_conflict="hospital_type,item_number",
                ).execute()
            except Exception as e:
                logger.warning(f"    청크 {idx} 임베딩/저장 실패: {e}")
        synced_to_chunks = len(chunks) > 0
        logger.info(f"    standard_chunks 반영: {len(chunks)}개 청크 ({hospital_type})")

    supabase.table("koiha_sync_log").upsert(
        {
            "board": board_code,
            "post_key": post_key,
            "post_title": title,
            "content_hash": chash,
            "attachment_names": detail["attachments"],
            "notice_id": notice_id,
            "standard_chunks_synced": synced_to_chunks,
            "last_synced_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="board,post_key",
    ).execute()


def main() -> None:
    logger = setup_logging()
    username = os.environ.get("KOIHA_USERNAME", "")
    password = os.environ.get("KOIHA_PASSWORD", "")
    gemini_key = os.environ.get("GEMINI_API_KEY", "")
    if not username or not password:
        logger.error(".env.local에 KOIHA_USERNAME/KOIHA_PASSWORD를 채워주세요.")
        sys.exit(1)
    if not gemini_key:
        logger.error(".env.local에 GEMINI_API_KEY가 없습니다.")
        sys.exit(1)

    supabase = get_supabase()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = (
            browser.new_context(storage_state=str(STATE_PATH))
            if STATE_PATH.exists()
            else browser.new_context()
        )
        page = context.new_page()

        try:
            login(page, username, password, logger)
            for board_name, board_code in BOARDS.items():
                try:
                    sync_board(page, board_name, board_code, supabase, gemini_key, logger)
                except Exception as e:
                    logger.exception(f"게시판 처리 중 오류: {board_name} ({e})")
        finally:
            context.close()
            browser.close()

    logger.info("동기화 완료")


if __name__ == "__main__":
    main()
