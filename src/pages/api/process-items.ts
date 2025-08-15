import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }
  try {
    const { conferenceId, title, description, owner, dueDaysBeforeAbstract } = req.body as any
    const confId = Number(conferenceId)
    if (!confId || !title || typeof title !== 'string') {
      res.status(400).send('conferenceId and title are required')
      return
    }
    // Determine next order for this conference
    const max = await prisma.processItem.aggregate({ where: { conferenceId: confId }, _max: { order: true } })
    const nextOrder = (max._max.order ?? -1) + 1

    await prisma.processItem.create({
      data: {
        conferenceId: confId,
        title,
        description: description || null,
        owner: owner || null,
        dueDaysBeforeAbstract: dueDaysBeforeAbstract !== undefined && dueDaysBeforeAbstract !== '' ? Number(dueDaysBeforeAbstract) : null,
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
