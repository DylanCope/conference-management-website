import Link from 'next/link'
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

export default async function NewProcessItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id: idStr } = await params
  const confId = Number(idStr)

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}`}>
            <button type="submit" className="btn">Back to Conference</button>
          </form>
        </div>
  <div style={{ color: '#555' }}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>New Process Item</h1>
      <p style={{ color: '#666', marginTop: 4 }}>Create a process item with full details.</p>

      <form method="post" action={`/api/process-items`} style={{ maxWidth: 700, marginTop: 12 }}>
        <input type="hidden" name="conferenceId" value={confId} />
        <label style={{ display: 'block', marginBottom: 6 }}>Title</label>
        <input name="title" placeholder="e.g., Internal review" style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <label style={{ display: 'block', marginTop: 10 }}>Description</label>
        <textarea name="description" placeholder="Optional longer description or checklist" rows={4} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

  <label style={{ display: 'block', marginTop: 10 }}>Due date</label>
  <input type="date" name="dueDate" style={{ width: 220, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" className="btn">Save</button>
          <Link
            href={`/admin/${confId}`}
            style={{
              padding: '6px 10px',
              border: '1px solid #ddd',
              borderRadius: 4,
              textDecoration: 'none',
              background: '#f7f7f7',
              color: '#111',
              display: 'inline-block',
            }}
          >
            Cancel
          </Link>
        </div>
      </form>

  <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>This creates a new process item for the conference.</div>
    </main>
  )
}
