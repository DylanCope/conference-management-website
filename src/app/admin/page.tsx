import prisma from '../../lib/prisma'
import { getCurrentUser } from '../lib/auth'

function fmt(d?: Date | null) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  const conferences = await prisma.conference.findMany({ orderBy: { createdAt: 'desc' } })
  return (
  <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid var(--border)', borderRadius:8,
        justifyContent:'space-between', marginBottom:16, background:'var(--card)'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/submissions" />
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action="/submissions">
            <button type="submit" className="btn">My Submissions</button>
          </form>
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Manage Conferences</h1>
      <p style={{marginTop:8}}>Create or manage conferences here.</p>
      <div style={{marginTop:12}}>
        <form method="get" action="/admin/new">
          <button type="submit" className="btn">Create new conference</button>
        </form>
      </div>

      <div style={{marginTop:16}}>
        <h2 style={{fontSize:18, marginBottom:8}}>Existing conferences</h2>
        {conferences.length === 0 ? (
          <p style={{color:'#666'}}>No conferences yet.</p>
        ) : (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {conferences.map(c => (
              <li key={c.id} style={{border:'1px solid var(--border)', borderRadius:8, padding:12, background:'var(--card)'}}>
                <div style={{fontWeight:600}}>{c.name}</div>
                <div style={{fontSize:14, color:'#555', marginTop:4}}>
                  Abstract: {fmt(c.abstractDeadline)} · Full: {fmt(c.fullSubmissionDeadline)} · Conference: {fmt(c.conferenceDate)}
                </div>
                {c.website && (
                  <div style={{marginTop:4}}>
                    <a href={c.website} target="_blank" rel="noopener noreferrer">{c.website}</a>
                  </div>
                )}
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <form method="get" action={`/admin/${c.id}/submissions`}>
                    <button type="submit" className="btn">View Submissions</button>
                  </form>
                  <form method="get" action={`/admin/${c.id}`}>
                    <button type="submit" className="btn">Edit</button>
                  </form>
                  <form method="get" action={`/admin/${c.id}/delete`}>
                    <button type="submit" className="btn">Delete</button>
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
