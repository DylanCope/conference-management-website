import { cookies } from 'next/headers'
import prisma from '../../../../../../lib/prisma'

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

type Params = Promise<{ id: string; taskId: string }>

export default async function CompleteTaskPage({ params }: { params: Params }) {
  const user = await getCurrentUser()
  const { id: idStr, taskId: taskIdStr } = await params
  const submissionId = Number(idStr)
  const taskId = Number(taskIdStr)

  if (!Number.isFinite(submissionId) || !Number.isFinite(taskId)) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Invalid URL parameters.</main>
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { conference: true } })
  if (!submission) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Submission not found.</main>
  }
  if (!user || submission.userId !== user.id) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>You do not have access to this submission.</main>
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { processItem: true, formQuestions: { include: { options: true }, orderBy: { order: 'asc' } } },
  })
  if (!task) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Task not found.</main>
  }

  // Ensure task belongs to the same conference as the submission
  if (!submission.conferenceId || task.processItem.conferenceId !== submission.conferenceId) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Task does not belong to this submission's conference.</main>
  }

  const existing = await (prisma as any).taskSubmission.findUnique({
    where: { taskId_submissionId: { taskId, submissionId } },
  })
  const answers: Record<string, any> = (existing?.answers as any) || {}

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/submissions/${submissionId}/tasks`}>
            <button type="submit" className="btn">Back to Tasks</button>
          </form>
        </div>
        <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Complete Task</h1>
      <p style={{ color: '#666', marginBottom: 12 }}>
        {task.type === 'FORM' ? 'Form' : task.type} • {task.processItem.title}
      </p>

      {task.type !== 'FORM' ? (
        <p style={{ color: '#666' }}>Completing this task type is not implemented yet.</p>
      ) : (
        <form method="post" action="/api/task-submissions" style={{ display: 'grid', gap: 12 }}>
          <input type="hidden" name="submissionId" value={submissionId} />
          <input type="hidden" name="taskId" value={taskId} />
          <input type="hidden" name="returnTo" value={`/submissions/${submissionId}/tasks`} />

          {task.formQuestions.map((q, idx) => {
            const name = `q_${q.id}`
            const val = answers?.[String(q.id)] ?? ''
            return (
              <div key={q.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
                <label style={{ fontWeight: 600 }} htmlFor={name}>Q{idx + 1}. {q.title} {q.required && <span style={{ color: '#c00' }}>*</span>}</label>
                <div style={{ marginTop: 8 }}>
                  {q.type === 'SHORT' && (
                    <input id={name} name={name} defaultValue={val} required={q.required} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                  )}
                  {q.type === 'PARAGRAPH' && (
                    <textarea id={name} name={name} defaultValue={val} required={q.required} style={{ width: '100%', minHeight: 100, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                  )}
                  {q.type === 'DATE' && (
                    <input id={name} name={name} type="date" defaultValue={val} required={q.required} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
                  )}
                  {q.type === 'MULTIPLE' && (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {q.options.map((opt) => (
                        <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <input type="radio" name={name} value={opt.text} defaultChecked={val === opt.text} required={q.required} />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === 'DROPDOWN' && (
                    <select id={name} name={name} defaultValue={val || ''} required={q.required} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4 }}>
                      <option value="" disabled>{q.required ? 'Select an option' : '—'}</option>
                      {q.options.map((opt) => (
                        <option key={opt.id} value={opt.text}>{opt.text}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )
          })}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn">Submit</button>
            <a className="btn" href={`/submissions/${submissionId}/tasks`} role="button">Cancel</a>
          </div>
        </form>
      )}
    </main>
  )
}
