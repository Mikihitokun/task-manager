import { NextRequest, NextResponse } from 'next/server'
import { updateTask } from '@/lib/notion'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const task = await updateTask(params.id, body)
    return NextResponse.json(task)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
