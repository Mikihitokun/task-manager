'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Task } from '@/lib/types'

const today = new Date()
const dateStr = today.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

function daysUntil(deadline: string): number {
  const d = new Date(deadline)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - now.getTime()) / 86400000)
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline)
  const dateLabel = new Date(deadline).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })

  let color = 'text-green-400 bg-green-400/10'
  let label = `${dateLabel} (${days}日後)`
  if (days < 0) { color = 'text-red-400 bg-red-400/10'; label = `${dateLabel} (期限切れ)` }
  else if (days === 0) { color = 'text-red-400 bg-red-400/20'; label = '今日まで！' }
  else if (days === 1) { color = 'text-orange-400 bg-orange-400/10'; label = '明日まで' }
  else if (days <= 3) { color = 'text-yellow-400 bg-yellow-400/10'; label = `${dateLabel} (あと${days}日)` }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {label}
    </span>
  )
}

function TaskCard({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const [completing, setCompleting] = useState(false)

  async function handleComplete() {
    setCompleting(true)
    await onComplete(task.id)
  }

  return (
    <div className={`task-card flex items-start gap-3 bg-card rounded-2xl p-4 transition-opacity ${completing ? 'opacity-40' : ''}`}>
      <button
        onClick={handleComplete}
        disabled={completing}
        className="mt-0.5 w-6 h-6 rounded-full border-2 border-border flex-shrink-0 flex items-center justify-center hover:border-accent transition-colors"
        aria-label="完了にする"
      >
        {completing && <span className="w-2.5 h-2.5 rounded-full bg-accent" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium leading-snug">{task.name}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {task.projectName && (
            <span className="text-xs text-muted bg-border px-2 py-0.5 rounded-full">{task.projectName}</span>
          )}
          {task.deadline && <DeadlineBadge deadline={task.deadline} />}
          {task.priority === '高' && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">優先度高</span>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return <div className="skeleton h-16 w-full" />
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTasks(data)
    } catch {
      setError('タスクの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function handleComplete(id: string) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: '完了' }),
    })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const deadlineTasks = tasks.filter(t => t.type === '締め切りある系')
  const somedayTasks = tasks.filter(t => t.type === 'いつかやる系')

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top px-5 pt-4 pb-2">
        <p className="text-muted text-sm">{dateStr}</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">タスク</h1>
        <div className="flex gap-2 mt-1">
          <span className="text-xs text-muted">{tasks.length}件残り</span>
        </div>
      </header>

      {/* Task List */}
      <main className="flex-1 px-4 py-3 scroll-area pb-32">
        {error && (
          <div className="text-red-400 text-sm text-center py-8">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {/* 締め切りある系 */}
            {deadlineTasks.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-deadline bg-deadline/10 px-2.5 py-1 rounded-full">
                    締め切りある系
                  </span>
                  <span className="text-muted text-xs">{deadlineTasks.length}件</span>
                </div>
                <div className="space-y-2">
                  {deadlineTasks.map(task => (
                    <TaskCard key={task.id} task={task} onComplete={handleComplete} />
                  ))}
                </div>
              </section>
            )}

            {/* いつかやる系 */}
            {somedayTasks.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-someday bg-someday/10 px-2.5 py-1 rounded-full">
                    いつかやる系
                  </span>
                  <span className="text-muted text-xs">{somedayTasks.length}件</span>
                </div>
                <div className="space-y-2">
                  {somedayTasks.map(task => (
                    <TaskCard key={task.id} task={task} onComplete={handleComplete} />
                  ))}
                </div>
              </section>
            )}

            {tasks.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">✌️</p>
                <p className="text-muted">タスクなし！いい感じ</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* FAB */}
      <Link
        href="/add"
        className="fixed bottom-24 right-5 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/30 active:scale-95 transition-transform z-10"
        aria-label="タスク追加"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      {/* Bottom Nav */}
      <BottomNav active="home" />
    </div>
  )
}

export function BottomNav({ active }: { active: 'home' | 'projects' | 'chat' }) {
  const items = [
    { href: '/', label: 'タスク', icon: CheckIcon, key: 'home' },
    { href: '/projects', label: 'プロジェクト', icon: FolderIcon, key: 'projects' },
    { href: '/chat', label: 'Claude', icon: SparkleIcon, key: 'chat' },
  ]
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 bg-card border-t border-border flex">
      {items.map(({ href, label, icon: Icon, key }) => (
        <Link
          key={key}
          href={href}
          className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors ${active === key ? 'text-accent' : 'text-muted'}`}
        >
          <Icon active={active === key} />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  )
}

function CheckIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ADE80' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

function FolderIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ADE80' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function SparkleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#4ADE80' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  )
}
