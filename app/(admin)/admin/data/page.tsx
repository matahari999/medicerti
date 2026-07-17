import LookupHub from '@/components/lookup/LookupHub'

export const metadata = { title: '공공데이터 포털' }

export default function AdminDataPortalPage() {
  return (
    <LookupHub
      basePath="/admin/data"
      title="공공데이터 포털"
      description="병원명을 입력하면 코드·상세정보·인증현황·개폐업·적정성평가·산재지정 6개 카테고리를 한번에 조회합니다."
      showApiKeyNotice
    />
  )
}
