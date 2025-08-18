import { cookies } from 'next/headers'
import prisma from '../../../../../../../../lib/prisma'
export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getCurrentUser() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  try {
    const session = JSON.parse(sessionCookie) as { userId?: number }
    if (!session.userId) return null
    const user = await prisma.user.findUnique({ where: { id: session.userId } })
    return user
  } catch {
    return null
  }
}
import FormBuilder from './FormBuilder'

export default async function NewFormTaskPage({ params }: { params: { id: string, itemId: string } }) {
  const user = await getCurrentUser()
  const { id: idStr, itemId } = params
  const confId = Number(idStr)

  return (
    <main style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, justifyContent: 'space-between', marginBottom: 16, background: 'var(--card)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <form method="post" action="/api/logout">
            <button type="submit" className="btn">Log out</button>
          </form>
          <form method="get" action={`/admin/${confId}/process-items/${itemId}`}>
            <button type="submit" className="btn">Back to Process Item</button>
          </form>
        </div>
        <form method="get" action="/profile">
          <button type="submit" className="btn">Profile</button>
        </form>
      </div>

  <h1 style={{ fontSize: 24 }}>New Form Task</h1>
  <p style={{ color: 'var(--muted)', marginTop: 4 }}>Build a form consisting of questions your team needs to fill in.</p>

  <FormBuilder processItemId={Number(itemId)} conferenceId={confId} />
    </main>
  )
}
