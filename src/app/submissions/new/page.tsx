export default function NewSubmissionPage(){
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{fontSize:24}}>Create Submission</h1>
      <form method="post" action="/api/submissions" style={{maxWidth:640, marginTop:12}}>
        <label style={{display:'block', marginBottom:6}}>Title</label>
        <input name="title" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <div style={{marginTop:12}}>
          <button type="submit">Create</button>
        </div>
      </form>
    </main>
  )
}
