import { NextRequest, NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/notion'

export async function GET() {
  try {
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const task = await createTask(body)
    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
