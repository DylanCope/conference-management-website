import Link from 'next/link'
import prisma from '../../../../../lib/prisma'
import { getCurrentUser } from '../../../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewProcessItemPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
    const { id: idStr } = params
  const confId = Number(idStr)

  return (
  <main style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid #eee', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/" />
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
