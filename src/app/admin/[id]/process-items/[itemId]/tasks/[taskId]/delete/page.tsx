import { cookies } from 'next/headers'
import prisma from '../../../../../../../../lib/prisma'

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

export default async function DeleteTaskPage({ params }: { params: { id: string; itemId: string; taskId: string } }) {
  const user = await getCurrentUser()

  const { id: idStr, itemId: itemIdStr, taskId: taskIdStr } = params
  const confId = Number(idStr)
  const itemId = Number(itemIdStr)
  const taskId = Number(taskIdStr)

  if (!Number.isFinite(confId) || !Number.isFinite(itemId) || !Number.isFinite(taskId)) {
    return (
  <main style={{ padding: 24 }}>
        <p style={{ color: '#666' }}>Invalid URL parameters.</p>
      </main>
    )
  }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task || task.processItemId !== itemId) {
    return (
  <main style={{ padding: 24 }}>
        <p>Task not found.</p>
      </main>
    )
  }

  const returnTo = `/admin/${confId}/process-items/${itemId}`

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={returnTo}>
            <button type="submit" className="btn">Back to Process Item</button>
          </form>
        </div>
  <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Delete Task</h1>
      <p>Are you sure you want to delete this task?</p>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <form method="post" action={`/api/tasks/${taskId}?_method=DELETE&returnTo=${encodeURIComponent(returnTo)}`}>
          <button type="submit" className="btn">Yes, delete</button>
        </form>
        <form method="get" action={returnTo}>
          <button type="submit" className="btn">Cancel</button>
        </form>
      </div>
    </main>
  )
}
 
