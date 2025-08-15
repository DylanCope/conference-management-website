import { cookies } from 'next/headers'
import prisma from '../../../lib/prisma'

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

type Props = { params: { id: string } }

export default async function SubmissionDetailPage({ params }: Props){
  const user = await getCurrentUser()
  const id = Number(params.id)
  const sub = await prisma.submission.findUnique({ where: { id }, include: { conference: true } })
  const conferences = await prisma.conference.findMany({ orderBy: { name: 'asc' } })
  if (!sub) return <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>Submission not found.</main>

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
            <button type="submit" style={{padding:'6px 10px'}}>Back to Conference Submissions</button>
          </form>
        </div>
        <div style={{color:'#555'}}>{user?.email ?? 'Not signed in'}</div>
      </div>

      <h1 style={{fontSize:24}}>Submission</h1>
      <form method="post" action={`/api/submissions/${id}?_method=PUT`} style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block', marginBottom:6}}>Title</label>
        <input name="title" defaultValue={sub.title} style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:10}}>Conference</label>
        <select name="conferenceId" defaultValue={sub.conference?.id ?? ''} style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}}>
          <option value="">Select a conference…</option>
          {conferences.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <label style={{display:'block', marginTop:8}}>First authors</label>
        <input name="firstAuthors" defaultValue={sub.firstAuthors ?? ''} style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:8}}>Senior authors</label>
        <input name="seniorAuthors" defaultValue={sub.seniorAuthors ?? ''} style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:8}}>Overleaf link</label>
        <input name="overleaf" defaultValue={sub.overleaf ?? ''} style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <div style={{marginTop:12}}>
          <button type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}
