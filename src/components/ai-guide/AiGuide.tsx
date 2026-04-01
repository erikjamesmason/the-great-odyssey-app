'use client'

import { useState, useRef, useEffect } from 'react'
import { type LifePlanType, LIFE_PLAN_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Send, Loader2, Sparkles } from 'lucide-react'

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
    'I\'m struggling to imagine a truly different life — help me brainstorm',
    'What questions should this alternative life answer?',
    'What would be the first step to explore this path?',
  ],
  wildcard: [
    'My wild card feels too unrealistic — help me think about it differently',
    'How do I turn this dream into something actionable?',
    'What would year 1 look like if I actually pursued this?',
  ],
}

export default function AiGuide({ lifePlanId, lifePlanType }: AiGuideProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const meta = LIFE_PLAN_LABELS[lifePlanType]

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

  const colorMap: Record<LifePlanType, string> = {
    expected: 'text-indigo-400',
    alternative: 'text-emerald-400',
    wildcard: 'text-amber-400',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center">
              <Sparkles className={cn('w-6 h-6 mx-auto mb-2', colorMap[lifePlanType])} />
              <p className="text-sm font-medium">AI Guide</p>
              <p className="text-xs text-stone-500 mt-1">
                Here to help with <span className={colorMap[lifePlanType]}>{meta.label}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-stone-600 uppercase tracking-wider">Quick starts</p>
              {STARTER_PROMPTS[lifePlanType].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left text-xs bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl p-3 text-stone-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-stone-800 text-stone-200 rounded-bl-sm'
              )}
            >
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 shrink-0">
        <div className="flex gap-2 bg-stone-800 border border-stone-700 rounded-xl p-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your guide..."
            rows={2}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder-stone-600"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="self-end bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg p-2 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-stone-600 mt-1 text-center">Enter to send, Shift+Enter for newline</p>
      </div>
    </div>
  )
}
