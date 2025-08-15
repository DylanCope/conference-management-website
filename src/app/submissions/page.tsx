export default function SubmissionsPage(){
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{fontSize:24}}>My Submissions</h1>
      <p style={{marginTop:8}}><a href="/submissions/new">Create new submission</a></p>
      <ul style={{marginTop:12}}>
        <li>Example Submission — <a href="/submissions/1">Manage</a></li>
      </ul>
    </main>
  )
}
