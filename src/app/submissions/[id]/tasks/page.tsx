import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'

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

function toInputDate(d?: Date | null) {
  return d ? new Date(d).toISOString().slice(0,10) : ''
}

export default async function SubmissionTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params
  const subId = Number(id)
  if (!Number.isFinite(subId)) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Invalid submission id.</main>
  }

  const submission = await prisma.submission.findUnique({ where: { id: subId }, include: { conference: true, user: true } })
  if (!submission) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>Submission not found.</main>
  }
  if (!user || submission.userId !== user.id) {
    return <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>You do not have access to this submission.</main>
  }

  // Gather process items and tasks for the submission's conference
  let tasks: Array<{
    taskId: number
    type: string
    processItemTitle: string
    dueDate?: string | null
    completedAt?: string | null
  }> = []

  if (submission.conferenceId) {
    const processItems = await prisma.processItem.findMany({
      where: { conferenceId: submission.conferenceId },
      orderBy: { order: 'asc' },
    })
    const conference = await prisma.conference.findUnique({ where: { id: submission.conferenceId } })

  // Fetch all task submissions for this submission in one go
  const subs = await (prisma as any).taskSubmission.findMany({ where: { submissionId: subId } })
  const completedMap = new Map<number, string | null>()
  for (const s of subs) completedMap.set(s.taskId, s.completedAt ? new Date(s.completedAt).toISOString() : null)

  for (const item of processItems) {
      const itemTasks = await prisma.task.findMany({ where: { processItemId: item.id }, orderBy: { order: 'asc' } })
      for (const t of itemTasks) {
        // Compute an absolute due date from the stored relative value on the process item, if present
        let dueDate: string | null = null
        if (conference && item.dueDaysBeforeAbstract !== null && item.dueDaysBeforeAbstract !== undefined) {
          const abstract = new Date(conference.abstractDeadline)
          const utcYear = abstract.getUTCFullYear()
          const utcMonth = abstract.getUTCMonth()
          const utcDay = abstract.getUTCDate()
          const base = new Date(Date.UTC(utcYear, utcMonth, utcDay))
          base.setUTCDate(base.getUTCDate() - item.dueDaysBeforeAbstract)
          dueDate = base.toISOString().slice(0, 10)
        }
        tasks.push({
          taskId: t.id,
          type: String(t.type),
          processItemTitle: item.title,
          dueDate,
          completedAt: completedMap.get(t.id) || null,
        })
      }
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action="/submissions">
            <button type="submit" className="btn">Back to My Submissions</button>
          </form>
        </div>
        <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Tasks for: {submission.title}</h1>
      {!submission.conferenceId ? (
        <p style={{ color: '#666', marginTop: 8 }}>This submission is not linked to a conference yet.</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#666', marginTop: 8 }}>No tasks defined for this conference.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'grid', gap: 8 }}>
          {tasks.map((t) => (
            <li key={t.taskId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div><strong>{t.processItemTitle}</strong></div>
                  <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Type: {t.type === 'FORM' ? 'Form' : t.type}</div>
                  {t.dueDate && <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Due: {t.dueDate}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  {t.completedAt && (
                    <div style={{ fontSize: 12, color: '#0a7' }}>Completed</div>
                  )}
                  <form method="get" action={`/submissions/${id}/tasks/${t.taskId}/complete`}>
                    <button type="submit" className="btn">{t.completedAt ? 'View / Edit' : 'Complete Task'}</button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
