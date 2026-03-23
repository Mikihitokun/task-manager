import { Client } from '@notionhq/client'
import { Task, Project, CreateTaskInput, CreateProjectInput, UpdateTaskInput } from './types'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const TASKS_DB = process.env.NOTION_TASKS_DB_ID!
const PROJECTS_DB = process.env.NOTION_PROJECTS_DB_ID!

// --- Projects ---

export async function getProjects(): Promise<Project[]> {
  const response = await notion.databases.query({
    database_id: PROJECTS_DB,
    sorts: [{ property: '作成日', direction: 'ascending' }],
  })
  return response.results.map(parseProject)
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const page = await notion.pages.create({
    parent: { database_id: PROJECTS_DB },
    properties: {
      'プロジェクト名': { title: [{ text: { content: input.name } }] },
      'ステータス': { select: { name: '進行中' } },
      ...(input.notes ? { 'メモ': { rich_text: [{ text: { content: input.notes } }] } } : {}),
    },
  })
  return parseProject(page)
}

// --- Tasks ---

export async function getTasks(): Promise<Task[]> {
  // Get all incomplete tasks
  const response = await notion.databases.query({
    database_id: TASKS_DB,
    filter: {
      property: 'ステータス',
      select: { does_not_equal: '完了' },
    },
    sorts: [
      { property: '締め切り', direction: 'ascending' },
      { property: '作成日', direction: 'ascending' },
    ],
  })

  const tasks = response.results.map(parseTask)

  // Fetch project names
  const projectIds = [...new Set(tasks.filter(t => t.projectId).map(t => t.projectId!))]
  const projectMap: Record<string, string> = {}
  await Promise.all(
    projectIds.map(async (id) => {
      try {
        const page = await notion.pages.retrieve({ page_id: id })
        projectMap[id] = parseProject(page).name
      } catch {
        projectMap[id] = ''
      }
    })
  )

  return tasks.map(t => ({
    ...t,
    projectName: t.projectId ? projectMap[t.projectId] : undefined,
  }))
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const props: Record<string, unknown> = {
    'タスク名': { title: [{ text: { content: input.name } }] },
    '種別': { select: { name: input.type } },
    'ステータス': { select: { name: '未着手' } },
  }
  if (input.deadline) props['締め切り'] = { date: { start: input.deadline } }
  if (input.priority) props['優先度'] = { select: { name: input.priority } }
  if (input.notes) props['メモ'] = { rich_text: [{ text: { content: input.notes } }] }
  if (input.projectId) props['プロジェクト'] = { relation: [{ id: input.projectId }] }

  const page = await notion.pages.create({
    parent: { database_id: TASKS_DB },
    properties: props as Parameters<typeof notion.pages.create>[0]['properties'],
  })
  return parseTask(page)
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const props: Record<string, unknown> = {}
  if (input.status) props['ステータス'] = { select: { name: input.status } }
  if (input.name) props['タスク名'] = { title: [{ text: { content: input.name } }] }
  if (input.type) props['種別'] = { select: { name: input.type } }
  if (input.deadline !== undefined) props['締め切り'] = input.deadline ? { date: { start: input.deadline } } : { date: null }
  if (input.priority) props['優先度'] = { select: { name: input.priority } }
  if (input.notes !== undefined) props['メモ'] = { rich_text: input.notes ? [{ text: { content: input.notes } }] : [] }
  if (input.projectId !== undefined) props['プロジェクト'] = input.projectId ? { relation: [{ id: input.projectId }] } : { relation: [] }

  const page = await notion.pages.update({
    page_id: id,
    properties: props as Parameters<typeof notion.pages.update>[0]['properties'],
  })
  return parseTask(page)
}

// --- Parsers ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTask(page: any): Task {
  const props = page.properties
  return {
    id: page.id,
    name: props['タスク名']?.title?.[0]?.plain_text ?? '',
    type: props['種別']?.select?.name ?? 'いつかやる系',
    status: props['ステータス']?.select?.name ?? '未着手',
    projectId: props['プロジェクト']?.relation?.[0]?.id,
    deadline: props['締め切り']?.date?.start,
    priority: props['優先度']?.select?.name,
    notes: props['メモ']?.rich_text?.[0]?.plain_text,
    createdAt: page.created_time,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProject(page: any): Project {
  const props = page.properties
  return {
    id: page.id,
    name: props['プロジェクト名']?.title?.[0]?.plain_text ?? '',
    status: props['ステータス']?.select?.name ?? '進行中',
    notes: props['メモ']?.rich_text?.[0]?.plain_text,
  }
}
