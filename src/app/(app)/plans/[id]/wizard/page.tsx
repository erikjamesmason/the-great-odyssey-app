import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import WizardShell from '@/components/wizard/WizardShell'

interface WizardPageProps {
  params: Promise<{ id: string }>
}

export default async function WizardPage({ params }: WizardPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: odysseyPlan } = await supabase
    .from('odyssey_plans')
    .select('*, life_plans(*, milestones(*))')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!odysseyPlan) notFound()

  return <WizardShell odysseyPlan={odysseyPlan} />
}
