export interface Task {
  id: string
  name: string
  type: '締め切りある系' | 'いつかやる系'
  status: '未着手' | '進行中' | '完了'
  projectId?: string
  projectName?: string
  deadline?: string
  priority?: '高' | '中' | '低'
  notes?: string
  createdAt?: string
}

export interface Project {
  id: string
  name: string
  status: '進行中' | '保留中' | '完了'
  notes?: string
  taskCount?: number
}

export interface CreateTaskInput {
  name: string
  type: '締め切りある系' | 'いつかやる系'
  projectId?: string
  deadline?: string
  priority?: '高' | '中' | '低'
  notes?: string
}

export interface CreateProjectInput {
  name: string
  notes?: string
}

export interface UpdateTaskInput {
  status?: '未着手' | '進行中' | '完了'
  name?: string
  type?: '締め切りある系' | 'いつかやる系'
  projectId?: string
  deadline?: string
  priority?: '高' | '中' | '低'
  notes?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
