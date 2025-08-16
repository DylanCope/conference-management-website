import prisma from '../../../../../../../lib/prisma'
import { getCurrentUser } from '../../../../../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Params = { id: string; itemId: string; taskId: string }

export default async function ViewTaskPage({ params }: { params: Params }) {
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

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      processItem: true,
      formQuestions: { include: { options: true }, orderBy: { order: 'asc' } },
    },
  })

  if (!task || task.processItemId !== itemId) {
    return (
  <main style={{ padding: 24 }}>
        <p>Task not found.</p>
      </main>
    )
  }

  return (
  <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/submissions" />
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}/process-items/${itemId}`}>
            <button type="submit" className="btn">Back to Process Item</button>
          </form>
        </div>
  <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Task</h1>
      <p style={{ color: '#666', marginTop: 4 }}>Type: {task.type === 'FORM' ? 'Form' : task.type}</p>

      {task.type === 'FORM' ? (
        <section style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Questions</h2>
          {task.formQuestions.length === 0 ? (
            <p style={{ color: '#666' }}>No questions.</p>
          ) : (
            <ol style={{ paddingLeft: 20 }}>
              {task.formQuestions.map((q) => (
                <li key={q.id} style={{ marginBottom: 12 }}>
                  <div>
                    <strong>{q.title}</strong> <span style={{ color: '#888', fontSize: 12 }}>({q.type}{q.required ? ', required' : ''})</span>
                  </div>
                  {q.options.length > 0 && (
                    <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                      {q.options.map((opt) => (
                        <li key={opt.id} style={{ color: '#555' }}>{opt.text}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : (
        <p style={{ color: '#666', marginTop: 12 }}>Viewing for this task type is not implemented yet.</p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <form method="get" action={`/admin/${confId}/process-items/${itemId}/tasks/${taskId}/delete`}>
          <button type="submit" className="btn">Delete</button>
        </form>
        <form method="get" action={`/admin/${confId}/process-items/${itemId}`}>
          <button type="submit" className="btn">Back</button>
        </form>
      </div>
    </main>
  )
}
 
