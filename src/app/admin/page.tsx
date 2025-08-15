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

function fmt(d?: Date | null) {
  if (!d) return ''
  try { return new Date(d).toLocaleDateString() } catch { return '' }
}

export default async function AdminPage() {
  const user = await getCurrentUser()
  const conferences = await prisma.conference.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/logout">
            <button type="submit" style={{padding:'6px 10px'}}>Log out</button>
          </form>
          <form method="get" action="/submissions">
            <button type="submit" style={{padding:'6px 10px'}}>My Submissions</button>
          </form>
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Admin — Conferences</h1>
      <p style={{marginTop:8}}>Create or manage conferences here. (Admin protected)</p>
      <p style={{marginTop:12}}><a href="/admin/new">Create new conference</a></p>

      <div style={{marginTop:16}}>
        <h2 style={{fontSize:18, marginBottom:8}}>Existing conferences</h2>
        {conferences.length === 0 ? (
          <p style={{color:'#666'}}>No conferences yet.</p>
        ) : (
          <ul style={{listStyle:'none', padding:0, margin:0, display:'grid', gap:8}}>
            {conferences.map(c => (
              <li key={c.id} style={{border:'1px solid #eee', borderRadius:8, padding:12}}>
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
                    <button type="submit" style={{padding:'6px 10px'}}>View Submissions</button>
                  </form>
                  <form method="get" action={`/admin/${c.id}`}>
                    <button type="submit" style={{padding:'6px 10px'}}>Edit</button>
                  </form>
                  <form method="get" action={`/admin/${c.id}/delete`}>
                    <button type="submit" style={{padding:'6px 10px'}}>Delete</button>
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
