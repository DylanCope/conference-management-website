export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Conference Submissions Manager</h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Sign in to continue.
      </p>

  <a href="/api/auth/signin/github" className="btn">Sign in with GitHub</a>
  <div style={{ height: 8 }} />
  <a href="/api/auth/signin/google" className="btn">Sign in with Google</a>
    </main>
  )
}
