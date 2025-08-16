import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth'
import prisma from '../../lib/prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions as any)
  const id = (session?.user as any)?.id
  if (!id) return null
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    return user
  } catch {
    return null
  }
}
