'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/types'

export default function AddTask() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [submitting, setSubmitting] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState<'締め切りある系' | 'いつかやる系'>('いつかやる系')
  const [projectId, setProjectId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState<'高' | '中' | '低' | ''>('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          projectId: projectId || undefined,
          deadline: deadline || undefined,
          priority: priority || undefined,
          notes: notes.trim() || undefined,
        }),
      })
      router.push('/')
    } catch {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <header className="safe-top flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-card flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">タスク追加</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-2 space-y-4 pb-32 scroll-area">

        {/* タスク名 */}
        <div>
          <label className="text-muted text-xs mb-1.5 block">タスク名 *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="何をする？"
            required
            autoFocus
            className="w-full bg-card rounded-2xl px-4 py-3.5 text-white placeholder-muted text-base focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* 種別 */}
        <div>
          <label className="text-muted text-xs mb-1.5 block">種別</label>
          <div className="flex gap-2">
            {(['いつかやる系', '締め切りある系'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  type === t
                    ? t === '締め切りある系'
                      ? 'bg-deadline/20 text-deadline border border-deadline/30'
                      : 'bg-someday/20 text-someday border border-someday/30'
                    : 'bg-card text-muted border border-transparent'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 締め切り（締め切りある系のみ） */}
        {type === '締め切りある系' && (
          <div>
            <label className="text-muted text-xs mb-1.5 block">締め切り</label>
            <input
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full bg-card rounded-2xl px-4 py-3.5 text-white text-base focus:outline-none focus:ring-1 focus:ring-accent"
              style={{ colorScheme: 'dark' }}
            />
          </div>
        )}

        {/* プロジェクト */}
        <div>
          <label className="text-muted text-xs mb-1.5 block">プロジェクト</label>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full bg-card rounded-2xl px-4 py-3.5 text-white text-base focus:outline-none focus:ring-1 focus:ring-accent appearance-none"
            style={{ colorScheme: 'dark' }}
          >
            <option value="">なし</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* 優先度 */}
        <div>
          <label className="text-muted text-xs mb-1.5 block">優先度</label>
          <div className="flex gap-2">
            {(['', '高', '中', '低'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-3 rounded-2xl text-sm font-medium transition-colors ${
                  priority === p
                    ? p === '高' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : p === '中' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : p === '低' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      : 'bg-accent/20 text-accent border border-accent/30'
                    : 'bg-card text-muted border border-transparent'
                }`}
              >
                {p === '' ? '設定なし' : p}
              </button>
            ))}
          </div>
        </div>

        {/* メモ */}
        <div>
          <label className="text-muted text-xs mb-1.5 block">メモ</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="補足メモ（任意）"
            rows={3}
            className="w-full bg-card rounded-2xl px-4 py-3.5 text-white placeholder-muted text-base focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
        </div>
      </form>

      {/* Submit Button */}
      <div className="safe-bottom fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-bg via-bg to-transparent">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className="w-full bg-accent text-black font-semibold py-4 rounded-2xl disabled:opacity-40 active:scale-95 transition-transform text-base"
        >
          {submitting ? '追加中...' : 'タスクを追加'}
        </button>
      </div>
    </div>
  )
}
