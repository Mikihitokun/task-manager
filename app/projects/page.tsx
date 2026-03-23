'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { BottomNav } from '../page'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      })
      const project = await res.json()
      setProjects(prev => [...prev, project])
      setNewName('')
      setShowAdd(false)
    } finally {
      setAdding(false)
    }
  }

  const statusColor = {
    '進行中': 'text-green-400 bg-green-400/10',
    '保留中': 'text-yellow-400 bg-yellow-400/10',
    '完了': 'text-gray-400 bg-gray-400/10',
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <header className="safe-top px-5 pt-4 pb-2 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">プロジェクト</h1>
          <p className="text-muted text-sm mt-0.5">{projects.length}件</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 bg-accent rounded-full flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </header>

      <main className="flex-1 px-4 py-3 scroll-area pb-28">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 w-full" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📁</p>
            <p className="text-muted">プロジェクトがまだありません</p>
            <button
              onClick={() => setShowAdd(true)}
              className="mt-4 text-accent text-sm"
            >
              最初のプロジェクトを追加
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="bg-card rounded-2xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white font-medium">{project.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                {project.notes && (
                  <p className="text-muted text-sm mt-1">{project.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={() => setShowAdd(false)}>
          <div
            className="w-full bg-card rounded-t-3xl p-5 safe-bottom"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">プロジェクト追加</h2>
            <form onSubmit={handleAddProject} className="space-y-3">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="プロジェクト名"
                autoFocus
                className="w-full bg-bg rounded-2xl px-4 py-3.5 text-white placeholder-muted text-base focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-bg text-muted font-medium"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || adding}
                  className="flex-1 py-3.5 rounded-2xl bg-accent text-black font-semibold disabled:opacity-40"
                >
                  {adding ? '追加中...' : '追加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav active="projects" />
    </div>
  )
}
