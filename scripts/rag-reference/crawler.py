import asyncio
import aiofiles
import httpx
from bs4 import BeautifulSoup
from pathlib import Path
import re
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ARCHIVE_ROOT = Path("data/archive")

TARGETS = {
    "medical_law": {
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=268896&chrClsCd=010102",
        "priority": 0,
    },
    "medical_law_enforcement": {
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=269733&chrClsCd=010102",
        "priority": 0,
    },
    "accreditation": {
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=273835&chrClsCd=010102",
        "priority": 0,
    },
    "insurance_eval": {
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=267491&chrClsCd=010102",
        "priority": 1,
    },
    "patient_safety": {
        "url": "https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=252107&chrClsCd=010102",
        "priority": 1,
    },
}


async def fetch_text(url: str) -> str | None:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        try:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "lxml")
            content_div = soup.select_one(
                ".content_area, .lawContent, .conView, #content"
            )
            if content_div:
                text = content_div.get_text(separator="\n")
            else:
                text = soup.get_text(separator="\n")
            return clean_text(text)
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None


def clean_text(text: str) -> str:
    text = re.sub(r"\s*\n\s*", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


async def save_article(name: str, text: str):
    dest = ARCHIVE_ROOT / name
    dest.mkdir(parents=True, exist_ok=True)
    path = dest / "raw.txt"
    async with aiofiles.open(str(path), "w", encoding="utf-8") as f:
        await f.write(text)
    logger.info(f"Saved {name} -> {path}")


async def crawl_all():
    tasks = []
    for name, info in sorted(TARGETS.items(), key=lambda x: x[1]["priority"]):
        tasks.append(crawl_one(name, info["url"]))
    await asyncio.gather(*tasks)


async def crawl_one(name: str, url: str):
    logger.info(f"Crawling {name} from {url}")
    text = await fetch_text(url)
    if text:
        await save_article(name, text)
    else:
        logger.warning(f"No content for {name}")


if __name__ == "__main__":
    asyncio.run(crawl_all())
