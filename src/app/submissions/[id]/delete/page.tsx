import prisma from '../../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DeleteSubmissionPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const id = Number(params.id)
  const sub = await prisma.submission.findUnique({ where: { id } })
  if (!sub) return <main style={{padding:24}}>Submission not found.</main>

  return (
    <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid var(--border)', borderRadius:8,
        justifyContent:'space-between', marginBottom:16, background:'var(--card)', flexWrap:'wrap'
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
        <form method="get" action="/profile">
          <button type="submit" className="btn">Profile</button>
        </form>
      </div>

      <h1 style={{fontSize:24}}>Delete Submission</h1>
  <p>Are you sure you want to delete “{sub.title}”?</p>

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <form method="post" action={`/api/submissions/${sub.id}?_method=DELETE`}>
          <button type="submit" className="btn">Yes, delete</button>
        </form>
        <form method="get" action="/submissions">
          <button type="submit" className="btn">Cancel</button>
        </form>
      </div>
    </main>
  )
}
