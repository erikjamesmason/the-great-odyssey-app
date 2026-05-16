import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PlanTabNav from '@/components/ui/PlanTabNav'
import PlanGuideShell from '@/components/ui/PlanGuideShell'

interface PlanLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function PlanLayout({ children, params }: PlanLayoutProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('odyssey_plans')
    .select('id, name, life_plans(id, type)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) notFound()

  const lifePlans = (plan.life_plans ?? []) as { id: string; type: string }[]

  return (
    <div className="flex h-full">
      <PlanTabNav planId={id} planName={plan.name} />
      <PlanGuideShell lifePlans={lifePlans}>
        {children}
      </PlanGuideShell>
    </div>
  )
}
