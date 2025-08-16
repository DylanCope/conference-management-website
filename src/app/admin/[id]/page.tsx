import prisma from '../../../lib/prisma'
import ProcessItemsEditor from '../ProcessItemsEditor'
import { getCurrentUser } from '../../lib/auth'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditConferencePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const { id: idStr } = params
  const id = Number(idStr)
  const conf = await prisma.conference.findUnique({ where: { id } })
  const processItems = await prisma.processItem.findMany({ where: { conferenceId: id }, orderBy: { order: 'asc' } })

  if (!conf) {
    return <main style={{padding:24}}>Conference not found.</main>
  }

  const toInputDate = (d?: Date | null) => d ? new Date(d).toISOString().slice(0,10) : ''

  return (
    <main style={{padding:24}}>
      <div style={{
        display:'flex', alignItems:'center', gap:12, padding:'8px 12px', border:'1px solid #eee', borderRadius:8,
        justifyContent:'space-between', marginBottom:16
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
        <div style={{color:'#555'}}>
          {user?.email ?? 'Not signed in'}
        </div>
      </div>

      <h1 style={{fontSize:24}}>Edit Conference</h1>
      <form method="post" action={`/api/conferences/${id}?_method=PUT`} style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block', marginBottom:6}}>Name</label>
        <input defaultValue={conf.name} name="name" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:10}}>Website</label>
        <input defaultValue={conf.website ?? ''} name="website" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:10}}>Abstract deadline</label>
        <input name="abstractDeadline" type="date" defaultValue={toInputDate(conf.abstractDeadline)} />

        <label style={{display:'block', marginTop:10}}>Full submission deadline</label>
        <input name="fullSubmissionDeadline" type="date" defaultValue={toInputDate(conf.fullSubmissionDeadline)} />

        <label style={{display:'block', marginTop:10}}>Conference date</label>
        <input name="conferenceDate" type="date" defaultValue={toInputDate(conf.conferenceDate)} />

        <div style={{marginTop:12}}>
          <button type="submit" className="btn">Save</button>
        </div>
      </form>

      {/* Process items editor */}
      <ProcessItemsEditor
        conferenceId={conf.id}
        initialItems={processItems.map(pi => ({ id: String(pi.id), title: pi.title }))}
      />
    </main>
  )
}
