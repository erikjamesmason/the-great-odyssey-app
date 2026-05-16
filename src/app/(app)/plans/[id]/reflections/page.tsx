import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReflectionsView from '@/components/reflections/ReflectionsView'
import type { Reflection } from '@/lib/types'

export default async function ReflectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reflections } = await supabase
    .from('plan_reflections')
    .select('*')
    .eq('odyssey_plan_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <ReflectionsView
      planId={id}
      userId={user.id}
      initialReflections={(reflections ?? []) as Reflection[]}
    />
  )
}
