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
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <form method="get" action={`/submissions/${s.id}`}>
                    <button type="submit" className="btn">Edit</button>
                  </form>
                  <form method="get" action={`/submissions/${s.id}/delete`}>
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
