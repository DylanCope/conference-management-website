import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function EditProcessItemPage({ params }: { params: Promise<{ id: string, itemId: string }> }) {
  const cookieStore = await cookies()
  const userEmail = (() => {
    try { return JSON.parse(cookieStore.get('session')?.value || '{}').email as string } catch { return undefined }
  })()
  const { id: idStr, itemId } = await params
  const confId = Number(idStr)

  // Placeholder initial values; will be replaced by DB fetch later
  const initial = {
    title: 'Internal review',
    description: 'Two lab members provide feedback on the draft.',
    owner: 'Project lead',
    dueDaysBeforeAbstract: 14,
  }

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
        <div style={{ color: '#555' }}>{userEmail ?? 'Not signed in'}</div>
      </div>

      <h1 style={{ fontSize: 24 }}>Edit Process Item</h1>
      <p style={{ color: '#666', marginTop: 4 }}>Edit the details for this process item.</p>

      <form method="post" action={`#`} style={{ maxWidth: 700, marginTop: 12 }}>
        <label style={{ display: 'block', marginBottom: 6 }}>Title</label>
        <input name="title" defaultValue={initial.title} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <label style={{ display: 'block', marginTop: 10 }}>Description</label>
        <textarea name="description" defaultValue={initial.description} rows={4} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <label style={{ display: 'block', marginTop: 10 }}>Owner/Lead</label>
        <input name="owner" defaultValue={initial.owner} style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <label style={{ display: 'block', marginTop: 10 }}>Due (relative days before abstract deadline)</label>
        <input type="number" name="dueDaysBeforeAbstract" defaultValue={initial.dueDaysBeforeAbstract} style={{ width: 200, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" className="btn">Save</button>
          <form method="post" action={`/admin/${confId}`}>
          <button type="submit" className="btn">Cancel</button>
          </form>
        </div>

      </form>

      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>Saving is not wired yet. This page is a placeholder for full details.</div>
    </main>
  )
}
