import prisma from '../../lib/prisma'
import { getCurrentUser } from '../lib/auth'

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
    const items = await prisma.processItem.findMany({ where: { conferenceId }, orderBy: { order: 'asc' }, select: { id: true, dueDaysBeforeAbstract: true, order: true } })
    if (items.length === 0) return 0
    const itemIds = items.map(i => i.id)
    const tasks = await prisma.task.findMany({ where: { processItemId: { in: itemIds } }, select: { id: true, processItemId: true } })

    // Compute active items
    const a = new Date(conf.abstractDeadline)
    const abstractUTC = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()))
    const today = new Date()
    const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10)
    const itemDueStr: Record<number, string | null> = {}
    for (const it of items) {
      if (it.dueDaysBeforeAbstract != null) {
        const d = new Date(abstractUTC)
        d.setUTCDate(d.getUTCDate() - it.dueDaysBeforeAbstract)
        itemDueStr[it.id] = d.toISOString().slice(0,10)
      } else {
        itemDueStr[it.id] = null
      }
    }
    const activeItemIds = new Set<number>()
    for (let i = 0; i < items.length; i++) {
      if (i === 0) { activeItemIds.add(items[i].id); continue }
      const prev = items[i-1]
      const prevDue = itemDueStr[prev.id]
      if (!prevDue || prevDue <= todayStr) activeItemIds.add(items[i].id)
    }

    // Count tasks for active items
    const activeTaskIds = tasks.filter(t => activeItemIds.has(t.processItemId)).map(t => t.id)
    let dueTotal = activeTaskIds.length
    // Subtract completed tasks for this submission if submissionId provided
    if (submissionId) {
      if (activeTaskIds.length > 0) {
        const completed = await (prisma as any).taskSubmission.findMany({ where: { submissionId, taskId: { in: activeTaskIds } } })
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
  <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/submissions" />
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
      <div style={{marginTop:8}}>
        <form method="get" action="/submissions/new">
          <button type="submit" className="btn">Create new submission</button>
        </form>
      </div>

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
