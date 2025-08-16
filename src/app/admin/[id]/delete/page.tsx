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

export default async function DeleteConferencePage({ params }: Props) {
  const user = await getCurrentUser()
  const { id: idStr } = params
  const id = Number(idStr)
  const conf = await prisma.conference.findUnique({ where: { id } })

  if (!conf) {
    return <main style={{padding:24}}>Conference not found.</main>
  }

  return (
    <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action="/admin">
            <button type="submit" className="btn">Manage Conferences</button>
          </form>
        </div>
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Delete Conference</h1>
      <p>Are you sure you want to delete “{conf.name}”?</p>

      <div style={{display:'flex', gap:8, marginTop:12}}>
        <form method="post" action={`/api/conferences/${conf.id}?_method=DELETE`}>
          <button type="submit" className="btn">Yes, delete</button>
        </form>
        <form method="get" action="/admin">
          <button type="submit" className="btn">Cancel</button>
        </form>
      </div>
    </main>
  )
}
