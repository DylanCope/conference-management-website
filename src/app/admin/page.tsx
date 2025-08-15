export default function AdminPage() {
  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{fontSize:24}}>Admin — Conferences</h1>
      <p style={{marginTop:8}}>Create or manage conferences here. (Admin protected)</p>
      <p style={{marginTop:12}}><a href="/admin/new">Create new conference</a></p>
    </main>
  )
}
