"use client"

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  return (
    <main style={{padding:24,fontFamily:'Inter, system-ui, Arial'}}>
      <h1 style={{fontSize:24}}>Sign in</h1>
      <form method="post" action="/api/login" style={{maxWidth:420, marginTop:12}}>
        <label style={{display:'block', marginBottom:8}}>Email</label>
        <input name="email" type="email" style={{width:'100%', padding:8, border:'1px solid #ddd', borderRadius:4}} />
        <div style={{marginTop:12}}>
          <button type="submit" style={{padding:'8px 12px'}}>Continue</button>
        </div>
      </form>
    </main>
  )
}
