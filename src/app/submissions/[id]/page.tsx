export default function SubmissionDetailPage(){
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{fontSize:24}}>Submission</h1>
      <form method="post" action="/api/submissions/update" style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block'}}>First authors</label>
        <input name="firstAuthors" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:8}}>Senior authors</label>
        <input name="seniorAuthors" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <label style={{display:'block', marginTop:8}}>Overleaf link</label>
        <input name="overleaf" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />

        <div style={{marginTop:12}}>
          <button type="submit">Save</button>
        </div>
      </form>
    </main>
  )
}
