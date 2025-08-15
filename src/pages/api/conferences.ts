import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, website, abstractDeadline, fullSubmissionDeadline, conferenceDate } = req.body
    const conf = await prisma.conference.create({ data: { name, website, abstractDeadline: new Date(abstractDeadline), fullSubmissionDeadline: new Date(fullSubmissionDeadline), conferenceDate: new Date(conferenceDate) } })
    return res.redirect('/admin')
  }

  if (req.method === 'GET') {
    const all = await prisma.conference.findMany()
    return res.json(all)
  }

  res.status(405).end()
}
