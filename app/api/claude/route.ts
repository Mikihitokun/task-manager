import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getTasks } from '@/lib/notion'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Get current tasks for context
    const tasks = await getTasks()
    const tasksSummary = tasks.map(t => {
      const deadline = t.deadline ? `締め切り: ${t.deadline}` : ''
      const project = t.projectName ? `プロジェクト: ${t.projectName}` : ''
      const priority = t.priority ? `優先度: ${t.priority}` : ''
      const meta = [deadline, project, priority].filter(Boolean).join(' / ')
      return `- [${t.type}] ${t.name}${meta ? ` (${meta})` : ''}`
    }).join('\n')

    const systemPrompt = `あなたはみきさんの個人タスク管理アシスタントです。みきさんはミュージシャンで、日々のタスクを管理するWebアプリを使っています。

現在の残タスク一覧:
${tasksSummary || '（タスクなし）'}

みきさんのタスクの状況を把握した上で、優先順位の相談や整理のアドバイスをしてください。
返答は日本語で、短く実用的に答えてください。`

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ message: text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to get Claude response' }, { status: 500 })
  }
}
