import { NextResponse } from "next/server";

const mockCertStatus = [
  { code: "C01", name: "미소들실버케어요양병원", type: "요양병원", address: "서울시 구로구 개봉로15길 41", status: "인증", certNo: "CERT-2025-104", certStart: "2025-06-01", certEnd: "2029-05-31", org: "의료기관평가인증원" },
  { code: "C02", name: "보바스기념병원", type: "요양병원", address: "경기도 성남시 분당구 대왕판교로 155-7", status: "인증", certNo: "CERT-2024-089", certStart: "2024-09-15", certEnd: "2028-09-14", org: "의료기관평가인증원" },
];

function parseXmlItems(xml: string): any[] {
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g);
  if (!itemMatches) return [];
  const extract = (item: string, tag: string) => {
    const m = item.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
    return m ? m[1].trim() : "";
  };
  return itemMatches.map((item) => ({
    insttNm: extract(item, "insttNm"),
    insttAsort: extract(item, "insttAsort"),
    insttAdres: extract(item, "insttAdres"),
    comptSttus: extract(item, "comptSttus"),
    crtfcIssnoNumber: extract(item, "crtfcIssnoNumber"),
    crtfcNo: extract(item, "crtfcNo"),
    crtfcBgnde: extract(item, "crtfcBgnde"),
    crtfcEndde: extract(item, "crtfcEndde"),
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchWord = searchParams.get("q") || "";
  const apiKey = process.env.DATA_GO_KR_API_KEY || process.env.HIRA_API_KEY;
  const referenceDate = new Date().toISOString().split("T")[0];

  if (!apiKey) {
    return NextResponse.json({ data: mockCertStatus, isMock: true, referenceDate });
  }

  try {
    const url = new URL("https://apis.data.go.kr/B554584/hptlCrtfcSttusList/Medicalinstitutioncertificationstatus_Acutephase");
    url.searchParams.set("serviceKey", apiKey);
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("numOfRows", "100");
    if (searchWord) url.searchParams.set("insttNm", searchWord);

    const res = await fetch(url.toString());
    const xml = await res.text();

    if (xml.includes("SERVICE_KEY_IS_NOT_REGISTERED") || xml.includes("API not found")) {
      throw new Error("API 오류");
    }

    const items = parseXmlItems(xml);

    if (items.length === 0) {
      return NextResponse.json({ data: mockCertStatus, isMock: true, referenceDate });
    }

    const results = items.map((item: any, idx: number) => ({
      code: item.crtfcNo || `C${idx}`,
      name: item.insttNm || "의료기관명 없음",
      type: item.insttAsort || "급성기병원",
      address: item.insttAdres || "주소 없음",
      status: item.comptSttus || "인증",
      certNo: item.crtfcIssnoNumber || `CERT-${idx}`,
      certStart: item.crtfcBgnde || "",
      certEnd: item.crtfcEndde || "",
      org: "의료기관평가인증원",
    }));

    // 검색어 필터 (클라이언트 사이드 보완)
    const filtered = searchWord
      ? results.filter((r: any) => r.name.includes(searchWord) || r.address.includes(searchWord))
      : results;

    return NextResponse.json({ data: filtered, isMock: false, referenceDate });

  } catch (err: any) {
    console.error("cert-status API 실패:", err.message);
    return NextResponse.json({ data: mockCertStatus, isMock: true, fallbackError: err.message, referenceDate });
  }
}