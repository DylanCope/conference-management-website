import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const confId = Number(id)
  if (!confId || Number.isNaN(confId)) return res.status(400).json({ error: 'Invalid id' })

  // Support HTML forms by allowing POST with _method override
  const method = (req.method === 'POST' && typeof req.query._method === 'string')
    ? (req.query._method as string).toUpperCase()
    : req.method

  if (method === 'DELETE') {
    await prisma.conference.delete({ where: { id: confId } })
    return res.redirect(303, '/admin')
  }

  if (method === 'PUT') {
    const { name, website, abstractDeadline, fullSubmissionDeadline, conferenceDate } = req.body as Record<string, string>
    await prisma.conference.update({
      where: { id: confId },
      data: {
        name,
        website: website || null,
        abstractDeadline: abstractDeadline ? new Date(abstractDeadline) : undefined,
        fullSubmissionDeadline: fullSubmissionDeadline ? new Date(fullSubmissionDeadline) : undefined,
        conferenceDate: conferenceDate ? new Date(conferenceDate) : undefined,
      },
    })
    return res.redirect(303, '/admin')
  }

  return res.status(405).end()
}
