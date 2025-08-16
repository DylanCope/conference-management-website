import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const userId = (session?.user as any)?.id as number | undefined
  if (!userId) return res.status(401).json({ error: 'Not logged in' })

  const id = Number(req.query.id)
  if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' })

  const method = (req.method === 'POST' && typeof req.query._method === 'string')
    ? (req.query._method as string).toUpperCase()
    : req.method

  if (method === 'PUT') {
    const { title, firstAuthors, seniorAuthors, overleaf, conferenceId } = req.body as Record<string, string>
    const confIdNum = conferenceId ? Number(conferenceId) : undefined
  await prisma.submission.update({
      where: { id },
      data: {
        title,
        firstAuthors: firstAuthors ?? null,
        seniorAuthors: seniorAuthors ?? null,
        overleaf: overleaf ?? null,
        conferenceId: confIdNum,
      },
    })
    return res.redirect(303, '/submissions')
  }

  if (method === 'DELETE') {
    await prisma.submission.delete({ where: { id } })
    return res.redirect(303, '/submissions')
  }

  return res.status(405).end()
}
