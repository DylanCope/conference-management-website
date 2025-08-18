import prisma from '../../../../lib/prisma'
import { getCurrentUser } from '../../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DeleteConferencePage({ params }: { params: { id: string } }) {
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
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid var(--border)', borderRadius:8,
        justifyContent:'space-between', marginBottom:16, background:'var(--card)', flexWrap:'wrap'
      }}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <form method="post" action="/api/auth/signout">
            <input type="hidden" name="callbackUrl" value="/submissions" />
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action="/admin">
            <button type="submit" className="btn">Manage Conferences</button>
          </form>
        </div>
        <form method="get" action="/profile">
          <button type="submit" className="btn">Profile</button>
        </form>
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
