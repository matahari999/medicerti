'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '인증이 필요합니다' }

  const full_name = (formData.get('full_name') as string)?.trim() || null
  const job_title = (formData.get('job_title') as string)?.trim() || null
  const phone     = (formData.get('phone') as string)?.trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({ full_name, job_title, phone } as never)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings/profile')
  return { success: true }
}
