import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PlanTabNav from '@/components/ui/PlanTabNav'

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
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!plan) notFound()

  return (
    <div className="flex h-full">
      <PlanTabNav planId={id} planName={plan.name} />
      <div className="flex-1 overflow-auto pb-16 sm:pb-0">
        {children}
      </div>
    </div>
  )
}
