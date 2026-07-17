import StatusLookup from '@/components/lookup/StatusLookup'

export const metadata = { title: '개업·폐업·휴업 조회' }

export default function StatusLookupPage() {
  return <StatusLookup basePath="/hospitals/lookup" />
}
