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
      const { title, description, dueDate, owner, dueDaysBeforeAbstract } = (req.body || {}) as any
      if (!title || typeof title !== 'string') {
        return res.status(400).send('title is required')
      }

      // If dueDate provided, compute relative days vs. conference abstract deadline
      let relative: number | null | undefined = undefined
      if (typeof dueDate === 'string') {
        if (dueDate.length === 0) {
          relative = null
        } else {
          const proc = await prisma.processItem.findUnique({ where: { id: pid }, select: { conferenceId: true } })
          if (!proc) return res.status(404).send('Process item not found')
          const conf = await prisma.conference.findUnique({ where: { id: proc.conferenceId }, select: { abstractDeadline: true } })
          if (!conf) return res.status(404).send('Conference not found')
          const abstract = new Date(conf.abstractDeadline)
          const due = new Date(`${dueDate}T12:00:00Z`)
          const msPerDay = 24 * 60 * 60 * 1000
          relative = Math.round((abstract.getTime() - due.getTime()) / msPerDay)
        }
      }

      await prisma.processItem.update({
        where: { id: pid },
        data: {
          title,
          description: description !== undefined ? (description || null) : undefined,
          owner: owner !== undefined ? (owner || null) : undefined,
          dueDaysBeforeAbstract:
            relative !== undefined ? relative : (
              dueDaysBeforeAbstract !== undefined && dueDaysBeforeAbstract !== ''
                ? Number(dueDaysBeforeAbstract)
                : dueDaysBeforeAbstract === ''
                  ? null
                  : undefined
            ),
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
        (prisma as any).taskSubmission.deleteMany({ where: { taskId: { in: taskIds } } }),
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
