import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProfileForm } from './ProfileForm'

export const metadata: Metadata = { title: '프로필 설정' }

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, job_title, avatar_url')
    .eq('id', user!.id)
    .maybeSingle()

  const p = profile as { full_name: string | null; phone: string | null; job_title: string | null; avatar_url: string | null } | null

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">계정 정보를 확인하고 수정합니다</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">계정 정보</CardTitle>
          <CardDescription>이름, 직책, 연락처를 수정합니다</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 text-sm text-muted-foreground">
            <span className="font-medium text-gray-900">이메일:</span>{' '}
            {user!.email}
          </div>
          <ProfileForm
            defaultValues={{
              full_name: p?.full_name ?? '',
              phone:     p?.phone ?? '',
              job_title: p?.job_title ?? '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
