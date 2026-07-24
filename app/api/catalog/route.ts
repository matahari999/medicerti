// 문서 생성 페이지의 카테고리 선택 UI가 쓰는 카탈로그 목록.
// 병원유형의 장→기준(1.1~끝)과 각 기준에 딸린 양식·점검표를 내려준다.
import { NextResponse } from 'next/server'
import { STANDARD_CATALOG } from '@/lib/standardCatalog'

export function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hospitalType = searchParams.get('hospitalType') ?? 'nursing'
  const catalog = STANDARD_CATALOG[hospitalType as keyof typeof STANDARD_CATALOG] ?? STANDARD_CATALOG.nursing

  // 같은 이름의 양식·점검표가 여러 기준에 중복 등장하므로 장 단위로 합쳐 유일하게 만든다.
  const chapters = catalog.chapters.map((ch) => {
    const forms = new Map<string, string>() // name → 대표 itemNumber
    const checklists = new Map<string, string>()
    for (const item of ch.items) {
      for (const f of item.requiredForms ?? []) if (!forms.has(f)) forms.set(f, item.itemNumber)
      for (const c of item.requiredChecklists ?? []) if (!checklists.has(c)) checklists.set(c, item.itemNumber)
    }
    return {
      chapterNumber: ch.chapterNumber,
      chapterTitle: ch.chapterTitle,
      items: ch.items.map((it) => ({
        itemNumber: it.itemNumber,
        itemTitle: it.itemTitle,
        summary: it.summary,
      })),
      forms: [...forms.entries()].map(([name, itemNumber]) => ({ name, itemNumber })),
      checklists: [...checklists.entries()].map(([name, itemNumber]) => ({ name, itemNumber })),
    }
  })

  return NextResponse.json({ hospitalType, chapters })
}
