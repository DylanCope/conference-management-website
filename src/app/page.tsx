export default function Home() {
  return (
  <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Conference Submissions Manager</h1>
      <p style={{ marginBottom: 16, color: '#444' }}>
        Enter your email to continue. No password needed.
      </p>

      <form method="post" action="/api/login" style={{ maxWidth: 420, marginTop: 12 }}>
        <label htmlFor="email" style={{ display: 'block', marginBottom: 8 }}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@lab.edu"
          style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4 }}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit" className="btn">Continue</button>
        </div>
      </form>
    </main>
  )
}
