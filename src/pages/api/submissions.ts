import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const userId = (session?.user as any)?.id as number | undefined
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  if (req.method === 'POST') {
    const { title, conferenceId, firstAuthors, seniorAuthors, overleaf } = req.body as { title?: string; conferenceId?: string; firstAuthors?: string; seniorAuthors?: string; overleaf?: string }
    const confIdNum = conferenceId ? Number(conferenceId) : undefined
    await prisma.submission.create({
      data: {
        title: title || '',
        userId,
        conferenceId: confIdNum,
        firstAuthors: firstAuthors ? String(firstAuthors) : undefined,
        seniorAuthors: seniorAuthors ? String(seniorAuthors) : undefined,
        overleaf: overleaf ? String(overleaf) : undefined,
      },
    })
    return res.redirect(303, '/submissions')
  }

  res.status(405).end()
}
