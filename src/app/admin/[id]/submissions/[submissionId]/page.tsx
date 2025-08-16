import { cookies } from 'next/headers'
import prisma from '../../../../../lib/prisma'

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

type Params = { id: string; submissionId: string }

export default async function AdminSubmissionDetail({ params }: { params: Params }) {
  const user = await getCurrentUser()
  const { id: idStr, submissionId: subStr } = params
  const confId = Number(idStr)
  const submissionId = Number(subStr)
  if (!Number.isFinite(confId) || !Number.isFinite(submissionId)) {
  return <main style={{ padding: 24 }}>Invalid URL parameters.</main>
  }

  const conf = await prisma.conference.findUnique({ where: { id: confId } })
  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { user: true, conference: true } })
  if (!conf || !submission || submission.conferenceId !== confId) {
  return <main style={{ padding: 24 }}>Submission not found for this conference.</main>
  }

  // Gather process items and tasks for this conference
  const processItems = await prisma.processItem.findMany({ where: { conferenceId: confId }, orderBy: { order: 'asc' } })
  const itemIds = processItems.map(p => p.id)
  const tasks = await prisma.task.findMany({ where: { processItemId: { in: itemIds } }, orderBy: { order: 'asc' }, include: { formQuestions: { include: { options: true }, orderBy: { order: 'asc' } }, processItem: true } })
  const answers = await (prisma as any).taskSubmission.findMany({ where: { submissionId }, orderBy: { createdAt: 'asc' } })
  const ansByTask = new Map<number, any>()
  for (const a of answers) ansByTask.set(a.taskId, a)

  // Compute which process items are ACTIVE today
  let abstractUTC: Date | null = null
  if (conf) {
    const a = new Date(conf.abstractDeadline)
    abstractUTC = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()))
  }
  const today = new Date()
  const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10)
  const itemDueStr: Record<number, string | null> = {}
  for (const it of processItems) {
    if (abstractUTC != null && it.dueDaysBeforeAbstract != null) {
      const d = new Date(abstractUTC)
      d.setUTCDate(d.getUTCDate() - it.dueDaysBeforeAbstract)
      itemDueStr[it.id] = d.toISOString().slice(0, 10)
    } else {
      itemDueStr[it.id] = null
    }
  }
  const activeItemIds = new Set<number>()
  for (let i = 0; i < processItems.length; i++) {
    if (i === 0) { activeItemIds.add(processItems[i].id); continue }
    const prev = processItems[i - 1]
    const prevDue = itemDueStr[prev.id]
    if (!prevDue || prevDue <= todayStr) activeItemIds.add(processItems[i].id)
  }

  function renderFormAnswers(task: any) {
    const a = ansByTask.get(task.id)
    const answered: Record<string, any> = (a?.answers as any) || {}
    return (
      <div style={{ display: 'grid', gap: 8 }}>
        {task.formQuestions.length === 0 ? (
          <div style={{ color: '#666' }}>No questions.</div>
        ) : (
          task.formQuestions.map((q: any, idx: number) => {
            const val = answered[String(q.id)]
            return (
              <div key={q.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 10 }}>
                <div style={{ fontWeight: 600 }}>Q{idx + 1}. {q.title} {q.required && <span style={{ color: '#c00' }}>*</span>}</div>
                <div style={{ marginTop: 6, color: val ? '#111' : '#c00' }}>
                  {val ? String(val) : 'No answer'}
                </div>
              </div>
            )
          })
        )}
      </div>
    )
  }

  return (
  <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}/submissions`}>
            <button type="submit" className="btn">Back to Submissions</button>
          </form>
          <form method="get" action={`/admin/${confId}`}>
            <button type="submit" className="btn">Back to Conference</button>
          </form>
        </div>
        <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Submission Details</h1>
      <div style={{ marginTop: 8, color: '#555' }}>Conference: {conf.name}</div>

      <section style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>{submission.title}</h2>
        <div style={{ color: '#555' }}>Owner: {submission.user?.email ?? 'Unknown'}</div>
        {submission.firstAuthors && (
          <div style={{ marginTop: 4 }}>First authors: {submission.firstAuthors}</div>
        )}
        {submission.seniorAuthors && (
          <div style={{ marginTop: 4 }}>Senior authors: {submission.seniorAuthors}</div>
        )}
        {submission.overleaf && (
          <div style={{ marginTop: 4 }}>Overleaf: <a href={submission.overleaf} target="_blank" rel="noreferrer">{submission.overleaf}</a></div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Tasks</h2>
        {tasks.length === 0 ? (
          <p style={{ color: '#666' }}>No tasks defined for this conference.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {tasks.map((t) => {
              const completed = !!ansByTask.get(t.id)
              const isActive = activeItemIds.has(t.processItemId)
              const bg = completed ? '#fff' : (isActive ? '#fff0f0' : '#f6f6f6')
              const statusColor = completed ? '#0a7' : (isActive ? '#c00' : '#777')
              return (
                <li key={t.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, background: bg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div><strong>{t.processItem.title}</strong></div>
                      <div style={{ color: '#666', fontSize: 14, marginTop: 4 }}>Type: {t.type === 'FORM' ? 'Form' : t.type}</div>
                    </div>
                    <div style={{ fontSize: 12, color: statusColor }}>{completed ? 'Completed' : (isActive ? 'Incomplete' : 'Inactive') }</div>
                  </div>

                  {t.type === 'FORM' ? (
                    <div style={{ marginTop: 10 }}>
                      {renderFormAnswers(t)}
                    </div>
                  ) : (
                    <div style={{ marginTop: 10, color: '#666' }}>Rendering for this task type is not implemented yet.</div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}
