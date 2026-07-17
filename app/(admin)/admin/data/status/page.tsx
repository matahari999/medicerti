import StatusLookup from '@/components/lookup/StatusLookup'

export const metadata = { title: '의료기관 개폐업 현황' }

export default function AdminStatusPage() {
  return <StatusLookup basePath="/admin/data" />
}
