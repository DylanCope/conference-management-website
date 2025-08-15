import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { serialize } from 'cookie'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  let { email } = req.body as { email?: string }
  if (!email) return res.status(400).json({ error: 'Email required' })
  email = String(email).trim().toLowerCase()

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
  create: { email }
  })

  const session = { userId: user.id }
  res.setHeader(
    'Set-Cookie',
    serialize('session', JSON.stringify(session), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  )
  res.redirect(303, '/submissions')
}
