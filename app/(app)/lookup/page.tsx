import LookupHub from '@/components/lookup/LookupHub'

export const metadata = { title: '병원 조회' }

export default function LookupPage() {
  return (
    <LookupHub
      basePath="/lookup"
      title="병원 조회"
      description="병원명을 입력하면 코드·상세정보·인증현황·개폐업·적정성평가·산재지정 6개 카테고리를 한번에 조회합니다."
    />
  )
}
