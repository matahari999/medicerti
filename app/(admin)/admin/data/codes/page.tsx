import CodesLookup from '@/components/lookup/CodesLookup'

export const metadata = { title: '의료기관 코드정보' }

export default function AdminCodesPage() {
  return <CodesLookup basePath="/admin/data" />
}
