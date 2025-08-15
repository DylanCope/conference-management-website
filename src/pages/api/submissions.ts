import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { parse } from 'cookie'

const prisma = new PrismaClient()

function getSession(req: NextApiRequest){
  const c = req.headers.cookie
  if (!c) return null
  const parsed = parse(c)
  try { return JSON.parse(parsed.session || 'null') } catch { return null }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Not logged in' })

  if (req.method === 'POST') {
    const { title, conferenceId } = req.body as { title?: string; conferenceId?: string }
    const confIdNum = conferenceId ? Number(conferenceId) : undefined
    await prisma.submission.create({ data: { title: title || '', userId: session.userId, conferenceId: confIdNum } })
    return res.redirect(303, '/submissions')
  }

  res.status(405).end()
}
