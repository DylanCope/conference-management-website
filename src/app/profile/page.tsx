import { getCurrentUser } from '../lib/auth'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  return (
    <main style={{ padding: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8,
        justifyContent: 'space-between', marginBottom: 16, background: 'var(--card)', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="get" action="/submissions">
            <button type="submit" className="btn">Back</button>
          </form>
        </div>
        <form method="post" action="/api/auth/signout">
          <input type="hidden" name="callbackUrl" value="/submissions" />
          <button type="submit" className="btn">Log out</button>
        </form>
      </div>

      <h1 style={{ fontSize: 24 }}>Profile</h1>
      <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 8, padding: 12, background: 'var(--card)' }}>
        <div><strong>Email:</strong> {user?.email ?? 'Not signed in'}</div>
      </div>
    </main>
  )
}
