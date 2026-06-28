import os
from pathlib import Path
import logging

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ARCHIVE_ROOT = Path("data/archive")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "data/vector_db/chroma_db")
COLLECTION_NAME = "medical_laws"


def load_raw_texts() -> list[dict]:
    documents = []
    if not ARCHIVE_ROOT.exists():
        logger.warning(f"Archive root {ARCHIVE_ROOT} does not exist")
        return documents
    for category_dir in sorted(ARCHIVE_ROOT.iterdir()):
        if not category_dir.is_dir():
            continue
        raw_file = category_dir / "raw.txt"
        if not raw_file.exists():
            continue
        text = raw_file.read_text(encoding="utf-8").strip()
        if not text:
            continue
        documents.append({
            "text": text,
            "metadata": {"source": category_dir.name, "category": category_dir.name},
        })
        logger.info(f"Loaded {category_dir.name}: {len(text)} chars")
    return documents


def hierarchical_split(text: str) -> list[str]:
    article_pattern = re.compile(
        r"(제\s*\d+\s*조\s*(?:의\s*\d+)?[\(（][^)）]*[\)）]\s*.*?)(?=제\s*\d+\s*조|\Z)",
        re.DOTALL,
    )
    articles = article_pattern.findall(text)
    if not articles:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200, separators=["\n\n", "\n", "。", ".", " "]
    )
    chunks = []
    for article in articles:
        article_chunks = splitter.split_text(article.strip())
        chunks.extend(article_chunks)
    return chunks


def ingest():
    documents = load_raw_texts()
    if not documents:
        logger.error("No documents to ingest")
        return

    all_chunks = []
    all_metadatas = []
    for doc in documents:
        chunks = hierarchical_split(doc["text"])
        if not chunks:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200
            )
            chunks = splitter.split_text(doc["text"])
        meta = doc["metadata"]
        for chunk in chunks:
            all_chunks.append(chunk)
            all_metadatas.append({**meta, "chunk_id": str(len(all_chunks))})
        logger.info(f"{meta['source']}: {len(chunks)} chunks")

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = Chroma.from_texts(
        texts=all_chunks,
        embedding=embeddings,
        metadatas=all_metadatas,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME,
    )
    logger.info(
        f"Ingested {len(all_chunks)} chunks into ChromaDB at {CHROMA_DB_PATH}"
    )


if __name__ == "__main__":
    import re

    ingest()
