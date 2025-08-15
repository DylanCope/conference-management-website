import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string }
  const taskId = Number(id)
  if (!Number.isFinite(taskId)) {
    res.status(400).send('Invalid id')
    return
  }

  // Support HTML forms by allowing POST with _method override
  const method = (req.method === 'POST' && typeof req.query._method === 'string')
    ? (req.query._method as string).toUpperCase()
    : req.method

  if (method === 'DELETE') {
    try {
      await prisma.$transaction([
        prisma.formOption.deleteMany({ where: { question: { taskId } } }),
        prisma.formQuestion.deleteMany({ where: { taskId } }),
        prisma.task.delete({ where: { id: taskId } }),
      ])

      const returnTo = typeof req.query.returnTo === 'string' ? (req.query.returnTo as string) : null
      if (returnTo) return res.redirect(303, returnTo)
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error(e)
      return res.status(500).send('Internal Server Error')
    }
  }

  return res.status(405).end()
}
