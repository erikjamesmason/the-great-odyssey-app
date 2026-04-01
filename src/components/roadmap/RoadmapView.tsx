'use client'

import { useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { LIFE_PLAN_LABELS, type LifePlanType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface RoadmapViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  odysseyPlan: any
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

const typeColors: Record<LifePlanType, { bg: string; border: string; text: string }> = {
  expected: { bg: '#1e1b4b', border: '#6366f1', text: '#a5b4fc' },
  alternative: { bg: '#022c22', border: '#10b981', text: '#6ee7b7' },
  wildcard: { bg: '#451a03', border: '#f59e0b', text: '#fcd34d' },
}

export default function RoadmapView({ odysseyPlan }: RoadmapViewProps) {
  const [activeType, setActiveType] = useState<LifePlanType>('expected')
  const lifePlans = odysseyPlan.life_plans || []

  const { nodes, edges } = useMemo(() => {
    const lp = lifePlans.find((l: { type: string }) => l.type === activeType)
    if (!lp) return { nodes: [], edges: [] }

    const colors = typeColors[activeType]
    const milestones = (lp.milestones || []).sort(
      (a: { year: number; position: number }, b: { year: number; position: number }) =>
        a.year !== b.year ? a.year - b.year : a.position - b.position
    )

    const LANE_W = 260
    const NODE_H = 80
    const X_OFFSET = 60

    // Group by year
    const byYear: Record<number, typeof milestones> = {}
    for (let y = 1; y <= 5; y++) byYear[y] = []
    milestones.forEach((m: { year: number }) => {
      if (byYear[m.year]) byYear[m.year].push(m)
    })

    const nodes: Node[] = []
    const edges: Edge[] = []

    // Year header nodes
    for (let y = 1; y <= 5; y++) {
      nodes.push({
        id: `year-${y}`,
        type: 'default',
        position: { x: X_OFFSET + (y - 1) * LANE_W, y: 0 },
        data: { label: `Year ${y}` },
        style: {
          background: '#1c1917',
          border: `1px solid #44403c`,
          borderRadius: 12,
          color: '#a8a29e',
          fontSize: 12,
          fontWeight: 700,
          width: 200,
          textAlign: 'center',
        },
      })
    }

    // Milestone nodes
    milestones.forEach((m: { id: string; year: number; title: string; category: string; description: string }, i: number) => {
      const yearItems = byYear[m.year]
      const posInYear = yearItems.indexOf(m)
      nodes.push({
        id: m.id,
        type: 'default',
        position: {
          x: X_OFFSET + (m.year - 1) * LANE_W,
          y: NODE_H + posInYear * (NODE_H + 20),
        },
        data: {
          label: (
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 2 }}>{m.title}</div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: 'capitalize' }}>{m.category}</div>
            </div>
          ),
        },
        style: {
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          color: colors.text,
          fontSize: 12,
          width: 200,
          padding: 8,
        },
      })
    })

    // Connect milestones in sequence across years
    let prev: string | null = null
    for (let y = 1; y <= 5; y++) {
      const yearMilestones = byYear[y]
      if (yearMilestones.length > 0) {
        if (prev) {
          edges.push({
            id: `e-${prev}-${yearMilestones[0].id}`,
            source: prev,
            target: yearMilestones[0].id,
            style: { stroke: colors.border, strokeWidth: 2 },
            animated: true,
          })
        }
        // Connect within same year
        for (let i = 0; i < yearMilestones.length - 1; i++) {
          edges.push({
            id: `e-same-${yearMilestones[i].id}-${yearMilestones[i + 1].id}`,
            source: yearMilestones[i].id,
            target: yearMilestones[i + 1].id,
            style: { stroke: colors.border, strokeWidth: 1.5, strokeDasharray: '4 4' },
          })
        }
        prev = yearMilestones[yearMilestones.length - 1].id
      }
    }

    // If no milestones, add an empty state node
    if (milestones.length === 0) {
      nodes.push({
        id: 'empty',
        type: 'default',
        position: { x: 200, y: 120 },
        data: { label: 'No milestones yet — add some in the Wizard tab' },
        style: {
          background: '#1c1917',
          border: '1px dashed #44403c',
          borderRadius: 12,
          color: '#57534e',
          fontSize: 12,
          width: 280,
          textAlign: 'center',
        },
      })
    }

    return { nodes, edges }
  }, [activeType, lifePlans])

  return (
    <div className="flex flex-col h-full">
      {/* Life selector */}
      <div className="flex gap-2 p-4 border-b border-stone-800 shrink-0">
        {PLAN_TYPES.map(type => {
          const meta = LIFE_PLAN_LABELS[type]
          const lp = lifePlans.find((l: { type: string }) => l.type === type)
          const colorCls = {
            expected: 'border-indigo-500 text-indigo-300 bg-indigo-950/50',
            alternative: 'border-emerald-500 text-emerald-300 bg-emerald-950/50',
            wildcard: 'border-amber-500 text-amber-300 bg-amber-950/50',
          }
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-colors',
                activeType === type
                  ? colorCls[type]
                  : 'border-stone-700 text-stone-500 hover:text-stone-300 hover:border-stone-600'
              )}
            >
              <div>{meta.label}</div>
              <div className="text-xs font-normal opacity-70 truncate">
                {lp?.title || 'Untitled'}
              </div>
            </button>
          )
        })}
      </div>

      {/* Flow canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#292524" variant={BackgroundVariant.Dots} gap={20} />
          <Controls className="!bg-stone-800 !border-stone-700 !text-stone-300" />
          <MiniMap
            nodeColor={(n) => {
              if (n.id.startsWith('year-')) return '#292524'
              return typeColors[activeType].border
            }}
            className="!bg-stone-900 !border-stone-700"
          />
        </ReactFlow>
      </div>
    </div>
  )
}
