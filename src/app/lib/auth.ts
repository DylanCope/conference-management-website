import { cookies } from 'next/headers'
import prisma from '../../lib/prisma'

export async function getCurrentUser() {
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
