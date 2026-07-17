import CodesLookup from '@/components/lookup/CodesLookup'

export const metadata = { title: '의료기관 코드' }

export default function CodesLookupPage() {
  return <CodesLookup basePath="/hospitals/lookup" />
}
