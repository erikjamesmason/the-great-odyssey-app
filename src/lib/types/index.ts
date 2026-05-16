export type LifePlanType = 'expected' | 'alternative' | 'wildcard'

export type MilestoneCategory = 'career' | 'personal' | 'education' | 'travel' | 'relationship' | 'health' | 'finance' | 'other'

export type PrototypeType = 'experiment' | 'interview' | 'course' | 'side_project'

export type PrototypeStatus = 'planned' | 'in_progress' | 'completed' | 'abandoned'

export interface DashboardGauges {
  resources: number      // 0-100
  likeability: number    // 0-100
  confidence: number     // 0-100
  coherence: number      // 0-100
}

export interface Milestone {
  id: string
  life_plan_id: string
  year: 1 | 2 | 3 | 4 | 5
  title: string
  description: string
  category: MilestoneCategory
  position?: number
  created_at: string
}

export interface LifePlan {
  id: string
  odyssey_plan_id: string
  type: LifePlanType
  title: string
  questions: string[]
  gauge_resources: number
  gauge_likeability: number
  gauge_confidence: number
  gauge_coherence: number
  milestones: Milestone[]
  created_at: string
  updated_at: string
}

export interface OdysseyPlan {
  id: string
  user_id: string
  name: string
  life_plans: LifePlan[]
  created_at: string
  updated_at: string
}

export interface Prototype {
  id: string
  life_plan_id: string
  type: PrototypeType
  title: string
  description: string
  status: PrototypeStatus
  scheduled_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

export const LIFE_PLAN_LABELS: Record<LifePlanType, { label: string; description: string; color: string }> = {
  expected: {
    label: 'Life One',
    description: 'The path you are already on',
    color: 'var(--ql-l1)',
  },
  alternative: {
    label: 'Life Two',
    description: 'What you would do if Life One disappeared',
    color: 'var(--ql-l2)',
  },
  wildcard: {
    label: 'Life Three',
    description: 'If money and image were no obstacle',
    color: 'var(--ql-l3)',
  },
}

export const MILESTONE_CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  career: 'career',
  personal: 'personal',
  education: 'learning',
  travel: 'travel',
  relationship: 'people',
  health: 'body',
  finance: 'money',
  other: 'other',
}

export interface Reflection {
  id: string
  odyssey_plan_id: string
  user_id: string
  text: string
  created_at: string
}

export const HAND_LABELS: Record<LifePlanType, string> = {
  expected: "the path I'm on",
  alternative: 'if it disappeared',
  wildcard: 'no obstacle',
}

export const LIFE_NUMERALS: Record<LifePlanType, string> = {
  expected: 'I',
  alternative: 'II',
  wildcard: 'III',
}

export const LIFE_SEAL_IDS: Record<LifePlanType, 'L1' | 'L2' | 'L3'> = {
  expected: 'L1',
  alternative: 'L2',
  wildcard: 'L3',
}

export const QL_COLORS: Record<LifePlanType, string> = {
  expected: 'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard: 'var(--ql-l3)',
}
