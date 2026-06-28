import os
import logging

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

logger = logging.getLogger(__name__)

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "data/vector_db/chroma_db")
COLLECTION_NAME = "medical_laws"

SYSTEM_PROMPT = """당신은 대한민국 의료법 및 의료기관 인증 평가 전문 AI 어시스턴트입니다.
검색된 법령 문서를 기반으로 정확하고 신뢰성 있는 답변을 제공합니다.

규칙:
1. 검색된 문서에 근거해서만 답변하세요.
2. 법 조항을 인용할 때는 반드시 출처(법령명, 조항 번호)를 명시하세요.
3. 답변을 확신할 수 없으면 '해당 내용을 검색된 법령에서 찾을 수 없습니다'라고 말하세요.
4. 추측하거나 검색된 문서에 없는 정보를 제공하지 마세요.
5. 한국어로 답변하세요.
6. 의료법, 의료법 시행규칙, 의료기관 인증 기준을 우선 참조하세요.

검색된 문서:
{context}

질문: {question}

답변:"""


def get_vector_store() -> Chroma:
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    return Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )


def build_qa_chain():
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
    vector_store = get_vector_store()
    retriever = vector_store.as_retriever(search_kwargs={"k": 5})

    prompt = PromptTemplate(
        template=SYSTEM_PROMPT,
        input_variables=["context", "question"],
    )

    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True,
    )


def query(question: str, hospital_type: str | None = None, department: str | None = None) -> dict:
    qa_chain = build_qa_chain()
    result = qa_chain.invoke({"query": question})

    sources = list({
        doc.metadata.get("source", "unknown") for doc in result.get("source_documents", [])
    })

    citations = []
    for doc in result.get("source_documents", [])[:3]:
        meta = doc.metadata
        src = meta.get("source", "알 수 없음")
        cat = meta.get("category", "")
        citations.append(f"{src} ({cat})")

    return {
        "answer": result.get("result", ""),
        "sources": sources,
        "citations": citations,
    }
