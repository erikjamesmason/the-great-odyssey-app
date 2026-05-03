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

interface RoadmapViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  odysseyPlan: any
}

const PLAN_TYPES: LifePlanType[] = ['expected', 'alternative', 'wildcard']

const TYPE_COLORS: Record<LifePlanType, { bg: string; border: string; text: string }> = {
  expected:    { bg: '#eaecf3', border: '#2c3e6b', text: '#2c3e6b' },
  alternative: { bg: '#e8ede6', border: '#3f5b34', text: '#3f5b34' },
  wildcard:    { bg: '#f4ede6', border: '#8a4f23', text: '#8a4f23' },
}

const LIFE_LABELS: Record<LifePlanType, string> = {
  expected: 'Life I', alternative: 'Life II', wildcard: 'Life III',
}

export default function RoadmapView({ odysseyPlan }: RoadmapViewProps) {
  const [activeType, setActiveType] = useState<LifePlanType>('expected')
  const lifePlans = odysseyPlan.life_plans || []

  const { nodes, edges } = useMemo(() => {
    const lp = lifePlans.find((l: { type: string }) => l.type === activeType)
    if (!lp) return { nodes: [], edges: [] }

    const colors = TYPE_COLORS[activeType]
    const milestones = (lp.milestones || []).sort(
      (a: { year: number; position: number }, b: { year: number; position: number }) =>
        a.year !== b.year ? a.year - b.year : a.position - b.position
    )

    const LANE_W = 260
    const NODE_H = 80
    const X_OFFSET = 60

    const byYear: Record<number, typeof milestones> = {}
    for (let y = 1; y <= 5; y++) byYear[y] = []
    milestones.forEach((m: { year: number }) => { if (byYear[m.year]) byYear[m.year].push(m) })

    const nodes: Node[] = []
    const edges: Edge[] = []

    for (let y = 1; y <= 5; y++) {
      nodes.push({
        id: `year-${y}`,
        type: 'default',
        position: { x: X_OFFSET + (y - 1) * LANE_W, y: 0 },
        data: { label: `Year ${y}` },
        style: {
          background: '#f3f1ea',
          border: '1px solid #dad5c5',
          borderRadius: 0,
          color: '#9a9485',
          fontSize: 12,
          fontWeight: 600,
          width: 200,
          textAlign: 'center',
          fontFamily: "'Caveat', cursive",
          letterSpacing: '0.05em',
        },
      })
    }

    milestones.forEach((m: { id: string; year: number; title: string; category: string }, i: number) => {
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
          borderRadius: 0,
          color: colors.text,
          fontSize: 12,
          width: 200,
          padding: 8,
        },
      })
    })

    let prev: string | null = null
    for (let y = 1; y <= 5; y++) {
      const ym = byYear[y]
      if (ym.length > 0) {
        if (prev) {
          edges.push({
            id: `e-${prev}-${ym[0].id}`,
            source: prev,
            target: ym[0].id,
            style: { stroke: colors.border, strokeWidth: 2 },
            animated: true,
          })
        }
        for (let i = 0; i < ym.length - 1; i++) {
          edges.push({
            id: `e-same-${ym[i].id}-${ym[i + 1].id}`,
            source: ym[i].id,
            target: ym[i + 1].id,
            style: { stroke: colors.border, strokeWidth: 1.5, strokeDasharray: '4 4' },
          })
        }
        prev = ym[ym.length - 1].id
      }
    }

    if (milestones.length === 0) {
      nodes.push({
        id: 'empty',
        type: 'default',
        position: { x: 200, y: 120 },
        data: { label: 'No milestones yet — add some in the Wizard tab' },
        style: {
          background: '#f3f1ea',
          border: '1px dashed #dad5c5',
          borderRadius: 0,
          color: '#9a9485',
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
      <div style={{
        display: 'flex',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--ql-rule)',
        background: 'var(--ql-paper-deep)',
        flexShrink: 0,
      }}>
        {PLAN_TYPES.map(type => {
          const lp = lifePlans.find((l: { type: string }) => l.type === type)
          const active = activeType === type
          const color = TYPE_COLORS[type].border
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: active ? `1px solid ${color}` : '1px solid var(--ql-rule)',
                background: active ? TYPE_COLORS[type].bg : 'none',
                fontSize: 12,
                color: active ? color : 'var(--ql-ink-faint)',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                fontWeight: active ? 500 : 400,
              }}
            >
              <div style={{ fontWeight: 600 }}>{LIFE_LABELS[type]}</div>
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          style={{ background: '#fbfaf6' }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#dad5c5" variant={BackgroundVariant.Dots} gap={20} />
          <Controls />
          <MiniMap nodeColor={(n) => {
            if (n.id.startsWith('year-')) return '#dad5c5'
            return TYPE_COLORS[activeType].border
          }} />
        </ReactFlow>
      </div>
    </div>
  )
}
