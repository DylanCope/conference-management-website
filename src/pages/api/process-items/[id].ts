import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string }
  const pid = Number(id)
  if (!Number.isFinite(pid)) {
    res.status(400).send('Invalid id')
    return
  }

  // Allow HTML forms to POST with _method override
  const method = (req.method === 'POST' && typeof req.query._method === 'string')
    ? (req.query._method as string).toUpperCase()
    : req.method

  if (method === 'PUT') {
    try {
      const { title, description, owner, dueDaysBeforeAbstract } = (req.body || {}) as any
      if (!title || typeof title !== 'string') {
        return res.status(400).send('title is required')
      }
      await prisma.processItem.update({
        where: { id: pid },
        data: {
          title,
          description: description !== undefined ? (description || null) : undefined,
          owner: owner !== undefined ? (owner || null) : undefined,
          dueDaysBeforeAbstract:
            dueDaysBeforeAbstract !== undefined && dueDaysBeforeAbstract !== ''
              ? Number(dueDaysBeforeAbstract)
              : dueDaysBeforeAbstract === ''
                ? null
                : undefined,
        }
      })

      const returnTo = typeof req.query.returnTo === 'string' ? (req.query.returnTo as string) : null
      if (returnTo) return res.redirect(303, returnTo)
      return res.status(200).json({ ok: true })
    } catch (e) {
      console.error(e)
      return res.status(500).send('Internal Server Error')
    }
  }

  if (method === 'DELETE') {
    try {
      // Collect all task ids for this process item
      const tasks = await prisma.task.findMany({ where: { processItemId: pid }, select: { id: true } })
      const taskIds = tasks.map(t => t.id)

      await prisma.$transaction([
        prisma.formOption.deleteMany({ where: { question: { taskId: { in: taskIds } } } }),
        prisma.formQuestion.deleteMany({ where: { taskId: { in: taskIds } } }),
        prisma.task.deleteMany({ where: { processItemId: pid } }),
        prisma.processItem.delete({ where: { id: pid } }),
      ])

    // Keep JSON response for fetch-based delete callers
    res.status(200).json({ ok: true })
    } catch (e) {
      console.error(e)
      res.status(500).send('Internal Server Error')
    }
    return
  }

  res.status(405).send('Method Not Allowed')
}
