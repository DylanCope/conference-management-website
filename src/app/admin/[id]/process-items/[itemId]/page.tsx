import prisma from '../../../../../lib/prisma'
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { getCurrentUser } from '../../../../lib/auth'

export default async function EditProcessItemPage({ params }: { params: { id: string, itemId: string } }) {
  const user = await getCurrentUser()
  const { id: idStr, itemId } = params
  const confId = Number(idStr)
  const pItemId = Number(itemId)
  if (!Number.isFinite(pItemId)) {
    return (
  <main style={{ padding: 24 }}>
  <p style={{ color: 'var(--muted)' }}>Invalid process item id.</p>
      </main>
    )
  }

  // Ensure the process item exists
  const processItem = await prisma.processItem.findUnique({ where: { id: pItemId } })
  if (!processItem) {
    return (
  <main style={{ padding: 24 }}>
        <p>Process item not found.</p>
      </main>
    )
  }

  const tasks = await prisma.task.findMany({
    where: { processItemId: pItemId },
    orderBy: { order: 'asc' },
    include: { formQuestions: { include: { options: true }, orderBy: { order: 'asc' } } },
  })

  // Use actual values from the database for initial form defaults

  // Compute default due date (absolute) from stored relative days vs. the conference abstract deadline
  const conf = await prisma.conference.findUnique({ where: { id: confId }, select: { abstractDeadline: true } })
  let defaultDueDate = ''
  if (conf && processItem.dueDaysBeforeAbstract !== null && processItem.dueDaysBeforeAbstract !== undefined) {
    const abstract = new Date(conf.abstractDeadline)
    // Use UTC-safe date math to avoid timezone shifting when formatting to yyyy-mm-dd
    const utcYear = abstract.getUTCFullYear()
    const utcMonth = abstract.getUTCMonth()
    const utcDate = abstract.getUTCDate()
    const asUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate))
    asUTC.setUTCDate(asUTC.getUTCDate() - processItem.dueDaysBeforeAbstract)
    defaultDueDate = asUTC.toISOString().slice(0, 10)
  }

  return (
  <main style={{ padding: 24 }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16, background: 'var(--card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/submissions" />
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}`}>
            <button type="submit" className="btn">Back to Conference</button>
          </form>
        </div>
  <div style={{ color: 'var(--muted)' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Edit Process Item</h1>
  <p style={{ color: 'var(--muted)', marginTop: 4 }}>Edit the details for this process item.</p>

      <form
        method="post"
        action={`/api/process-items/${pItemId}?_method=PUT&returnTo=${encodeURIComponent(`/admin/${confId}`)}`}
        style={{ maxWidth: 700, marginTop: 12 }}
      >
        <label style={{ display: 'block', marginBottom: 6 }}>Title</label>
  <input name="title" defaultValue={processItem.title} style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }} />

        <label style={{ display: 'block', marginTop: 10 }}>Description</label>
  <textarea name="description" defaultValue={processItem.description ?? ''} rows={4} style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }} />

        <label style={{ display: 'block', marginTop: 10 }}>Due date</label>
        <input
          type="date"
          name="dueDate"
          defaultValue={defaultDueDate}
          style={{ width: 220, padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }}
        />

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" className="btn">Save</button>
          <form method="get" action={`/admin/${confId}`}>
            <button type="submit" className="btn">Cancel</button>
          </form>
        </div>

      </form>


      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Tasks</h2>
  <p style={{ color: 'var(--muted)', marginTop: 0 }}>Add tasks to this process item. Start with a form; reviews will come later.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <form method="get" action={`/admin/${confId}/process-items/${itemId}/tasks/new/form`}>
            <button type="submit" className="btn">Create form</button>
          </form>
        </div>

        {tasks.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0', display: 'grid', gap: 8 }}>
            {tasks.map((t) => (
              <li key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background:'var(--card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{t.type === 'FORM' ? 'Form' : 'Task'}</strong>
                    <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>{t.formQuestions.length} question(s)</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`/admin/${confId}/process-items/${pItemId}/tasks/${t.id}`} className="btn">View</a>
                    <a href={`/admin/${confId}/process-items/${pItemId}/tasks/${t.id}/delete`} className="btn">Delete</a>
                    {t.type === 'FORM' ? (
                      <a href={`/admin/${confId}/process-items/${pItemId}/tasks/${t.id}/edit/form`} className="btn">Edit</a>
                    ) : (
                      <span className="btn" aria-disabled>Edit</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--muted)', marginTop: 12 }}>No tasks yet.</p>
        )}
      </section>
    </main>
  )
}
