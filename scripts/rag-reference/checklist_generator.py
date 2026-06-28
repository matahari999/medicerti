import os
import json
import logging

from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.prompts import PromptTemplate

logger = logging.getLogger(__name__)

CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "data/vector_db/chroma_db")
COLLECTION_NAME = "medical_laws"

SPECIALTY_WEIGHTS = {
    "general": {"accreditation": 0.4, "patient_safety": 0.3, "insurance": 0.2, "administration": 0.1},
    "surgery": {"accreditation": 0.35, "patient_safety": 0.35, "infection": 0.2, "administration": 0.1},
    "internal_medicine": {"accreditation": 0.3, "patient_safety": 0.3, "prescription": 0.3, "administration": 0.1},
    "emergency": {"accreditation": 0.25, "patient_safety": 0.4, "emergency_equipment": 0.25, "administration": 0.1},
}

CHECKLIST_PROMPT = """당신은 대한민국 의료기관 인증 평가 및 법률 준수 전문가입니다.
주어진 정보를 바탕으로 체크리스트를 생성하세요.

병원 정보:
- 유형: {hospital_type}
- 진료과: {department}
- 직원 수: {staff_count}
- 병상 수: {bed_count}
- 전문 분야: {specialty}

검색된 관련 법령:
{context}

체크리스트를 다음 JSON 형식으로 작성하세요 (반드시 유효한 JSON만 출력):
{{
    "items": [
        {{
            "category": "인증평가/환자안전/요양급여/행정 중 하나",
            "title": "항목 제목",
            "description": "상세 설명",
            "legal_basis": "근거 법령 (법령명과 조항)",
            "severity": "필수/권장/참고"
        }}
    ]
}}

5-10개 항목을 작성하세요. 유효한 JSON만 출력하고 다른 텍스트는 출력하지 마세요."""


def _get_keywords(specialty: str) -> list[str]:
    weights = SPECIALTY_WEIGHTS.get(specialty, SPECIALTY_WEIGHTS["general"])
    keywords = []
    for category, weight in sorted(weights.items(), key=lambda x: -x[1]):
        if weight >= 0.2:
            keywords.append(category)
    return keywords


def _search_documents(specialty: str, k: int = 8):
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vector_store = Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )
    keywords = _get_keywords(specialty)
    results = []
    for kw in keywords:
        try:
            docs = vector_store.similarity_search(kw, k=k // len(keywords) + 1)
            results.extend(docs)
        except Exception:
            continue
    return results[:k]


def generate_checklist(
    hospital_type: str,
    department: str,
    staff_count: int = 0,
    bed_count: int = 0,
    specialty: str = "general",
) -> dict:
    docs = _search_documents(specialty)
    context = "\n\n".join(
        [f"[{d.metadata.get('source', 'unknown')}]\n{d.page_content}" for d in docs]
    )

    llm = ChatOpenAI(model_name="gpt-4o", temperature=0.1)
    prompt = PromptTemplate(
        template=CHECKLIST_PROMPT,
        input_variables=[
            "hospital_type",
            "department",
            "staff_count",
            "bed_count",
            "specialty",
            "context",
        ],
    )
    chain = prompt | llm
    result = chain.invoke({
        "hospital_type": hospital_type,
        "department": department,
        "staff_count": str(staff_count),
        "bed_count": str(bed_count),
        "specialty": specialty,
        "context": context,
    })

    raw = result.content if hasattr(result, "content") else str(result)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1]
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            parsed = json.loads(raw[start:end])
        except (ValueError, json.JSONDecodeError):
            logger.error(f"Failed to parse checklist JSON: {raw[:200]}")
            return {"hospital_type": hospital_type, "department": department, "items": [], "raw": raw}

    return {
        "hospital_type": hospital_type,
        "department": department,
        "items": parsed.get("items", []),
    }
