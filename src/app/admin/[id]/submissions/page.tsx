import prisma from '../../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ConferenceSubmissionsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { id: idStr } = params
  const id = Number(idStr)
  const conf = await prisma.conference.findUnique({ where: { id } })
  const submissions = await prisma.submission.findMany({ where: { conferenceId: id }, include: { user: true }, orderBy: { createdAt: 'desc' } })

  // Compute total number of tasks for this conference, and completed counts per submission
  const processItems = await prisma.processItem.findMany({ where: { conferenceId: id }, orderBy: { order: 'asc' }, select: { id: true, dueDaysBeforeAbstract: true, order: true } })
  const itemIds = processItems.map(p => p.id)
  const tasks = itemIds.length > 0
    ? await prisma.task.findMany({ where: { processItemId: { in: itemIds } }, select: { id: true, processItemId: true } })
    : []
  const taskIds = tasks.map(t => t.id)
  const totalTasks = taskIds.length
  const subIds = submissions.map(s => s.id)
  const completions = (taskIds.length > 0 && subIds.length > 0)
    ? await (prisma as any).taskSubmission.findMany({ where: { taskId: { in: taskIds }, submissionId: { in: subIds } }, select: { submissionId: true, taskId: true } })
    : []
  const completedBySubmission = new Map<number, number>()
  for (const c of completions) {
    completedBySubmission.set(c.submissionId, (completedBySubmission.get(c.submissionId) || 0) + 1)
  }

  // Determine which process items are ACTIVE today (first item always active; others after previous item's due date passes)
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
  const activeTaskIds = new Set<number>(tasks.filter(t => activeItemIds.has(t.processItemId)).map(t => t.id))
  const totalActiveTasks = activeTaskIds.size
  // Completed counts for ACTIVE tasks per submission
  const activeCompletions = (totalActiveTasks > 0 && subIds.length > 0)
    ? await (prisma as any).taskSubmission.findMany({ where: { taskId: { in: Array.from(activeTaskIds) }, submissionId: { in: subIds } }, select: { submissionId: true } })
    : []
  const activeCompletedBySubmission = new Map<number, number>()
  for (const c of activeCompletions) {
    activeCompletedBySubmission.set(c.submissionId, (activeCompletedBySubmission.get(c.submissionId) || 0) + 1)
  }

  if (!conf) {
  return <main style={{padding:24}}>Conference not found.</main>
  }

  return (
  <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/" />
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action="/admin">
            <button type="submit" className="btn">Manage Conferences</button>
          </form>
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Submissions — {conf.name}</h1>
      <div style={{marginTop:12}}>
        {submissions.length === 0 ? (
          <p style={{color:'#666'}}>No submissions yet for this conference.</p>
        ) : (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {submissions.map(s => {
              const completed = completedBySubmission.get(s.id) || 0
              const activeCompleted = activeCompletedBySubmission.get(s.id) || 0
              const hasIncomplete = totalActiveTasks > 0 && activeCompleted < totalActiveTasks
              return (
              <li key={s.id} style={{border:'1px solid #eee', borderRadius:8, padding:12, background: hasIncomplete ? '#fff0f0' : '#fff'}}>
                <div style={{fontWeight:600}}>{s.title}</div>
                <div style={{fontSize:14, color:'#555', marginTop:4}}>
                  Owner: {s.user?.email ?? 'Unknown'}
                </div>
                <div style={{fontSize:13, color: hasIncomplete ? '#c00' : '#444', marginTop:4}}>
                  Tasks: {completed} / {totalTasks}
                </div>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <form method="get" action={`/admin/${id}/submissions/${s.id}`}>
                    <button type="submit" className="btn">View</button>
                  </form>
                </div>
              </li>
            )})}
          </ul>
        )}
      </div>
    </main>
  )
}
