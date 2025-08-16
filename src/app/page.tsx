import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const session = await getServerSession(authOptions as any)
  if (session) {
    redirect('/submissions')
  }
  redirect('/api/auth/signin?callbackUrl=%2Fsubmissions')
}
