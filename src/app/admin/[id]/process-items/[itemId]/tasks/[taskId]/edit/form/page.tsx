import { cookies } from 'next/headers'
import prisma from '../../../../../../../../../lib/prisma'
import React from 'react'
import FormEditor from './FormEditor'

async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const session = JSON.parse(sessionCookie) as { userId?: number }
    if (!session.userId) return null
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    return user
  } catch {
    return null
  }
}

function toBuilderModel(task: any) {
  return (task.formQuestions || []).sort((a: any, b: any) => a.order - b.order).map((q: any) => ({
    id: String(q.id),
    type: String(q.type).toLowerCase(),
    title: q.title || '',
    required: !!q.required,
    options: (q.options || []).sort((a: any, b: any) => a.order - b.order).map((o: any) => o.text),
  }))
}

export default async function EditFormTaskPage({ params }: { params: { id: string; itemId: string; taskId: string } }) {
  const user = await getCurrentUser()
  const { id: idStr, itemId: itemIdStr, taskId: taskIdStr } = params
  const confId = Number(idStr)
  const itemId = Number(itemIdStr)
  const taskId = Number(taskIdStr)

  if (!Number.isFinite(confId) || !Number.isFinite(itemId) || !Number.isFinite(taskId)) {
  return <main style={{ padding: 24 }}>Invalid URL parameters.</main>
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { formQuestions: { include: { options: true }, orderBy: { order: 'asc' } } },
  })
  if (!task || String(task.type) !== 'FORM' || task.processItemId !== itemId) {
  return <main style={{ padding: 24 }}>Task not found or not editable.</main>
  }

  const questions = toBuilderModel(task)

  return (
  <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}/process-items/${itemId}`}>
            <button type="submit" className="btn">Back to Process Item</button>
          </form>
        </div>
  <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Edit Form Task</h1>
      <p style={{ color: '#666', marginTop: 4 }}>Update questions and options.</p>

      <FormEditor
        initial={questions}
        saveUrl={`/api/tasks/form/${taskId}?_method=PUT&returnTo=${encodeURIComponent(`/admin/${confId}/process-items/${itemId}`)}`}
        redirectTo={`/admin/${confId}/process-items/${itemId}`}
      />
    </main>
  )
}

// Editor UI is provided by the client component './FormEditor'
