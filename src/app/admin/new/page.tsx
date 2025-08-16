export default function NewConferencePage() {
  return (
  <main style={{padding:24}}>
      <h1 style={{fontSize:24}}>Create Conference</h1>
      <form method="post" action="/api/conferences" style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block', marginBottom:6}}>Name</label>
  <input name="name" style={{width:'100%', padding:8, border:'1px solid var(--border)', borderRadius:4, background:'var(--card)', color:'var(--text)'}} />

        <label style={{display:'block', marginTop:10}}>Website</label>
  <input name="website" style={{width:'100%', padding:8, border:'1px solid var(--border)', borderRadius:4, background:'var(--card)', color:'var(--text)'}} />

        <label style={{display:'block', marginTop:10}}>Abstract deadline</label>
        <input name="abstractDeadline" type="date" />

        <label style={{display:'block', marginTop:10}}>Full submission deadline</label>
        <input name="fullSubmissionDeadline" type="date" />

        <label style={{display:'block', marginTop:10}}>Conference date</label>
        <input name="conferenceDate" type="date" />

        <div style={{marginTop:12}}>
          <button type="submit">Create</button>
        </div>
      </form>
    </main>
  )
}
