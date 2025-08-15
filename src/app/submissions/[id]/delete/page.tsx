import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'

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

export default async function DeleteSubmissionPage({ params }: Props) {
  const user = await getCurrentUser()
  const id = Number(params.id)
  const sub = await prisma.submission.findUnique({ where: { id } })
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
            <button type="submit" style={{padding:'6px 10px'}}>Back to My Submissions</button>
          </form>
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Delete Submission</h1>
      <p>Are you sure you want to delete “{sub.title}”?</p>

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <form method="post" action={`/api/submissions/${sub.id}?_method=DELETE`}>
          <button type="submit" style={{padding:'6px 10px'}}>Yes, delete</button>
        </form>
        <form method="get" action="/submissions">
          <button type="submit" style={{padding:'6px 10px'}}>Cancel</button>
        </form>
      </div>
    </main>
  )
}
