import TypeLookup from '@/components/lookup/TypeLookup'

export default async function TypeLookupPage({
  params,
}: {
  params: Promise<{ type: string }>
}) {
  const { type } = await params
  return <TypeLookup basePath="/lookup" type={type} />
}
