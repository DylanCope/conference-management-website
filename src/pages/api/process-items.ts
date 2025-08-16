import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }
  try {
    const { conferenceId, title, description, dueDate } = req.body as any
    const confId = Number(conferenceId)
    if (!confId || !title || typeof title !== 'string') {
      res.status(400).send('conferenceId and title are required')
      return
    }

    // Compute relative days before abstract if an absolute due date is provided
    let dueDaysBeforeAbstract: number | null = null
    if (typeof dueDate === 'string' && dueDate.length > 0) {
      const conf = await prisma.conference.findUnique({ where: { id: confId } })
      if (!conf) {
        res.status(404).send('Conference not found')
        return
      }
      const abstract = new Date(conf.abstractDeadline)
      const due = new Date(`${dueDate}T12:00:00Z`)
      const msPerDay = 24 * 60 * 60 * 1000
      dueDaysBeforeAbstract = Math.round((abstract.getTime() - due.getTime()) / msPerDay)
    }

    // Determine next order for this conference
    const max = await prisma.processItem.aggregate({ where: { conferenceId: confId }, _max: { order: true } })
    const nextOrder = (max._max.order ?? -1) + 1

    await prisma.processItem.create({
      data: {
        conferenceId: confId,
        title,
        description: description || null,
        owner: null,
        dueDaysBeforeAbstract,
        order: nextOrder,
      }
    })

    // Redirect back to the conference edit page
    res.writeHead(303, { Location: `/admin/${confId}` })
    res.end()
  } catch (e) {
    console.error(e)
    res.status(500).send('Internal Server Error')
  }
}
