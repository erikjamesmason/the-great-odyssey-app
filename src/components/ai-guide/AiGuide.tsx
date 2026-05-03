'use client'

import { useState, useRef, useEffect } from 'react'
import { type LifePlanType, LIFE_PLAN_LABELS } from '@/lib/types'
import { Send, Loader2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AiGuideProps {
  lifePlanId: string
  lifePlanType: LifePlanType
}

const STARTER_PROMPTS: Record<LifePlanType, string[]> = {
  expected: [
    'Help me write a title for this life path',
    'What milestones should I consider for year 1?',
    'My dashboard shows high likeability but low resources — help me think through this',
  ],
  alternative: [
    "I'm struggling to imagine a truly different life — help me brainstorm",
    'What questions should this alternative life answer?',
    'What would be the first step to explore this path?',
  ],
  wildcard: [
    'My wild card feels too unrealistic — help me think about it differently',
    'How do I turn this dream into something actionable?',
    'What would year 1 look like if I actually pursued this?',
  ],
}

const QL_COLORS: Record<LifePlanType, string> = {
  expected: 'var(--ql-l1)',
  alternative: 'var(--ql-l2)',
  wildcard: 'var(--ql-l3)',
}

export default function AiGuide({ lifePlanId, lifePlanType }: AiGuideProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const meta = LIFE_PLAN_LABELS[lifePlanType]
  const qlColor = QL_COLORS[lifePlanType]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lifePlanId, lifePlanType, messages: newMessages }),
      })
      if (!res.ok) throw new Error(`api error ${res.status}`)
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.message }])
    } catch {
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div>
            <div style={{
              textAlign: 'center',
              paddingBottom: 16,
              borderBottom: '1px solid var(--ql-rule)',
              marginBottom: 16,
            }}>
              <Sparkles style={{ width: 16, height: 16, color: qlColor, margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--ql-ink)', margin: '0 0 2px' }}>AI Guide</p>
              <p style={{ fontSize: 12, color: 'var(--ql-ink-faint)', margin: 0 }}>
                Here to help with{' '}
                <span style={{ color: qlColor }}>{meta.label}</span>
              </p>
            </div>
            <p style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--ql-ink-faint)',
              marginBottom: 8,
            }}>
              Quick starts
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {STARTER_PROMPTS[lifePlanType].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  style={{
                    textAlign: 'left',
                    fontSize: 12,
                    background: 'var(--ql-paper)',
                    border: '1px solid var(--ql-rule)',
                    borderBottom: i < STARTER_PROMPTS[lifePlanType].length - 1 ? 'none' : '1px solid var(--ql-rule)',
                    padding: '10px 12px',
                    color: 'var(--ql-ink-soft)',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '90%',
              padding: '10px 14px',
              fontSize: 13,
              lineHeight: 1.5,
              ...(msg.role === 'user'
                ? { background: 'var(--ql-ink)', color: 'var(--ql-paper)' }
                : { background: 'var(--ql-paper-deep)', color: 'var(--ql-ink-soft)', border: '1px solid var(--ql-rule)' }
              ),
            }}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.5 }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 600, color: 'var(--ql-ink)' }}>{children}</strong>,
                    em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                    ul: ({ children }) => <ul style={{ margin: '0 0 8px', paddingLeft: 16 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: '0 0 8px', paddingLeft: 16 }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                    h1: ({ children }) => <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 6px', color: 'var(--ql-ink)' }}>{children}</p>,
                    h2: ({ children }) => <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 6px', color: 'var(--ql-ink)' }}>{children}</p>,
                    h3: ({ children }) => <p style={{ fontWeight: 600, fontSize: 13, margin: '0 0 4px', color: 'var(--ql-ink)' }}>{children}</p>,
                    code: ({ children }) => <code style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--ql-rule)', padding: '1px 4px' }}>{children}</code>,
                    blockquote: ({ children }) => <blockquote style={{ margin: '0 0 8px', paddingLeft: 10, borderLeft: `2px solid var(--ql-rule)`, color: 'var(--ql-ink-faint)' }}>{children}</blockquote>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'var(--ql-paper-deep)',
              border: '1px solid var(--ql-rule)',
              padding: '10px 14px',
            }}>
              <Loader2 style={{ width: 14, height: 14, color: 'var(--ql-ink-faint)' }} className="animate-spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', flexShrink: 0, borderTop: '1px solid var(--ql-rule)' }}>
        <div style={{
          display: 'flex',
          gap: 8,
          border: '1px solid var(--ql-rule)',
          padding: 8,
          background: 'var(--ql-paper)',
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your guide…"
            rows={2}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              fontSize: 13,
              resize: 'none',
              outline: 'none',
              color: 'var(--ql-ink)',
              fontFamily: "'Inter', sans-serif",
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{
              alignSelf: 'flex-end',
              background: 'var(--ql-ink)',
              border: 'none',
              padding: 8,
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !input.trim() ? 0.4 : 1,
              color: 'var(--ql-paper)',
              display: 'flex',
            }}
          >
            <Send style={{ width: 14, height: 14 }} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--ql-ink-faint)', marginTop: 4, textAlign: 'center' }}>
          Enter to send, Shift+Enter for newline
        </p>
      </div>
    </div>
  )
}
