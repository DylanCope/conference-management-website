import prisma from '../../../lib/prisma'
import { getCurrentUser } from '../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SubmissionDetailPage({ params }: { params: { id: string } }){
  const user = await getCurrentUser()
  const id = Number(params.id)
  const sub = await prisma.submission.findUnique({ where: { id }, include: { conference: true } })
  const conferences = await prisma.conference.findMany({ orderBy: { name: 'asc' } })
  if (!sub) return <main style={{padding:24}}>Submission not found.</main>

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
          <form method="get" action="/submissions">
            <button type="submit" className="btn">Back to Submissions</button>
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
          <button type="submit" className="btn">Save</button>
        </div>
      </form>
    </main>
  )
}
