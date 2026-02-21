'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccount(reason?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Call the soft delete master function
  const { error } = await supabase.rpc('soft_delete_user', {
    p_user_id:    user.id,
    p_deleted_by: 'self',
    p_reason:     reason ?? null
  })

  if (error) throw new Error(error.message)

  // Sign out — user enters 30 day grace period
  await supabase.auth.signOut()

  redirect('/login?deleted=true')
}

export async function restoreAccount() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Restore profile and all related data
  const { error } = await supabase
    .from('profiles')
    .update({
      is_deleted:           false,
      deleted_at:           null,
      deleted_by:           null,
      deleted_reason:       null,
      deletion_grace_until: null
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  // Restore posts
  await supabase
    .from('posts')
    .update({ is_deleted: false, deleted_at: null })
    .eq('user_id', user.id)

  // Restore connections
  await supabase
    .from('connections')
    .update({
      is_deleted:                false,
      deleted_at:                null,
      partner_notified:          false,
      partner_notice_expires_at: null
    })
    .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

  // Restore notifications
  await supabase
    .from('notifications')
    .update({ is_deleted: false, deleted_at: null })
    .or(`receiver_id.eq.${user.id},actor_id.eq.${user.id}`)

  redirect('/feed')
}