import prisma from '../../../lib/prisma'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewSubmissionPage(){
  const conferences = await prisma.conference.findMany({ orderBy: { name: 'asc' } })
  const hasConfs = conferences.length > 0
  return (
  <main style={{padding:24}}>
      <h1 style={{fontSize:24}}>Create Submission</h1>

      {!hasConfs && (
        <p style={{marginTop:12, color:'#666'}}>
          No conferences available. Please ask an admin to create one first.
        </p>
      )}

      <form method="post" action="/api/submissions" style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block', marginBottom:6}}>Title</label>
  <input name="title" required style={{width:'100%', padding:8, border:'1px solid var(--border)', borderRadius:4, background:'var(--card)', color:'var(--text)'}} />

        <label style={{display:'block', marginTop:10}}>Conference</label>
  <select name="conferenceId" required disabled={!hasConfs} style={{width:'100%', padding:8, border:'1px solid var(--border)', borderRadius:4, background:'var(--card)', color:'var(--text)'}}>
          <option value="">Select a conference…</option>
          {conferences.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div style={{marginTop:12}}>
          <button type="submit" className="btn" disabled={!hasConfs} aria-disabled={!hasConfs}>Create</button>
        </div>
      </form>
    </main>
  )
}
