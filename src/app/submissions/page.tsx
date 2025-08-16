import { cookies } from 'next/headers'
import prisma from '../../lib/prisma'

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

export default async function SubmissionsPage(){
  const user = await getCurrentUser()
  const submissions = user
    ? await prisma.submission.findMany({ where: { userId: user.id }, include: { conference: true }, orderBy: { createdAt: 'desc' } })
    : []

  // Helper to compute due tasks count for a submission's conference
  async function getDueTasksCount(conferenceId?: number | null, submissionId?: number) {
    if (!conferenceId) return 0
    const conf = await prisma.conference.findUnique({ where: { id: conferenceId } })
    if (!conf) return 0
    const items = await prisma.processItem.findMany({ where: { conferenceId }, select: { id: true, dueDaysBeforeAbstract: true } })
    if (items.length === 0) return 0
    const itemIds = items.map(i => i.id)
    const tasks = await prisma.task.findMany({ where: { processItemId: { in: itemIds } }, select: { id: true, processItemId: true } })
    const counts = new Map<number, number>()
    for (const t of tasks) counts.set(t.processItemId, (counts.get(t.processItemId) || 0) + 1)

    const abstract = new Date(conf.abstractDeadline)
    const aY = abstract.getUTCFullYear(); const aM = abstract.getUTCMonth(); const aD = abstract.getUTCDate()
    const abstractUTC = new Date(Date.UTC(aY, aM, aD))
    const today = new Date()
    const tY = today.getUTCFullYear(); const tM = today.getUTCMonth(); const tD = today.getUTCDate()
    const todayStr = new Date(Date.UTC(tY, tM, tD)).toISOString().slice(0,10)

    let dueTotal = 0
    for (const it of items) {
      const rel = it.dueDaysBeforeAbstract
      if (rel === null || rel === undefined) continue
      const due = new Date(abstractUTC)
      due.setUTCDate(due.getUTCDate() - rel)
      const dueStr = due.toISOString().slice(0,10)
      if (dueStr <= todayStr) {
        dueTotal += (counts.get(it.id) || 0)
      }
    }
    // Subtract completed tasks for this submission if submissionId provided
    if (submissionId) {
      const taskIds = tasks.map(t => t.id)
      if (taskIds.length > 0) {
  const completed = await (prisma as any).taskSubmission.findMany({ where: { submissionId, taskId: { in: taskIds } } })
        dueTotal = Math.max(0, dueTotal - completed.length)
      }
    }
    return dueTotal
  }

  // Precompute due counts for each submission
  const dueCounts: Record<number, number> = {}
  for (const s of submissions) {
    dueCounts[s.id] = await getDueTasksCount(s.conference?.id, s.id)
  }

  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          {user?.isAdmin && (
            <form method="get" action="/admin">
              <button type="submit" className="btn">Manage Conferences</button>
            </form>
          )}
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>My Submissions</h1>
      <p style={{marginTop:8}}><a href="/submissions/new">Create new submission</a></p>

      <div style={{marginTop:12}}>
        {(!user) && <p style={{color:'#666'}}>Please sign in to view your submissions.</p>}
        {user && submissions.length === 0 && (
          <p style={{color:'#666'}}>No submissions yet.</p>
        )}
        {user && submissions.length > 0 && (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {submissions.map(s => (
              <li key={s.id} style={{border:'1px solid #eee', borderRadius:8, padding:12}}>
                <div style={{fontWeight:600}}>{s.title}</div>
                <div style={{fontSize:14, color:'#555', marginTop:4}}>
                  {s.conference ? s.conference.name : 'No conference'}
                </div>
                {s.conference && (
                  <div style={{fontSize:13, color:'#444', marginTop:4}}>Due tasks: {dueCounts[s.id] ?? 0}</div>
                )}
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <form method="get" action={`/submissions/${s.id}`}>
                    <button type="submit" className="btn">Edit</button>
                  </form>
                  <form method="get" action={`/submissions/${s.id}/delete`}>
                    <button type="submit" className="btn">Delete</button>
                  </form>
                  <form method="get" action={`/submissions/${s.id}/tasks`}>
                    <button type="submit" className="btn">View Tasks</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
