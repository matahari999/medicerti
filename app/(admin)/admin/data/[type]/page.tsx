import TypeLookup from '@/components/lookup/TypeLookup'

export default async function AdminTypeLookupPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  return <TypeLookup basePath="/admin/data" type={type} />
}
