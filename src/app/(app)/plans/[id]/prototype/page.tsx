import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PrototypeView from '@/components/prototype/PrototypeView'

interface PrototypePageProps {
  params: Promise<{ id: string }>
}

export default async function PrototypePage({ params }: PrototypePageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: odysseyPlan } = await supabase
    .from('odyssey_plans')
    .select('*, life_plans(id, type, title)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!odysseyPlan) notFound()

  // Fetch prototypes for all life plans in this odyssey
  const lifePlanIds = odysseyPlan.life_plans?.map((lp: { id: string }) => lp.id) || []
  const { data: prototypes } = await supabase
    .from('prototypes')
    .select('*')
    .in('life_plan_id', lifePlanIds)
    .order('created_at', { ascending: false })

  return <PrototypeView odysseyPlan={odysseyPlan} initialPrototypes={prototypes || []} />
}
