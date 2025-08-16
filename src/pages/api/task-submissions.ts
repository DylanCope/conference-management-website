import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Accept both form-encoded and JSON
    const method = req.method
    if (method !== 'POST') return res.status(405).send('Method Not Allowed')

    const body: any = req.body || {}
    const submissionId = Number(body.submissionId)
    const taskId = Number(body.taskId)
    const returnTo = typeof body.returnTo === 'string' ? body.returnTo : null

    if (!Number.isFinite(submissionId) || !Number.isFinite(taskId)) {
      return res.status(400).send('Invalid submissionId or taskId')
    }

  // Auth: NextAuth session
  const session = await getServerSession(req, res, authOptions)
  const currentUserId = (session?.user as any)?.id as number | undefined
  if (!currentUserId) return res.status(401).send('Not authenticated')

    const submission = await prisma.submission.findUnique({ where: { id: submissionId } })
    if (!submission) return res.status(404).send('Submission not found')
    if (submission.userId !== currentUserId) return res.status(403).send('Forbidden')

    const task = await prisma.task.findUnique({ where: { id: taskId }, include: { processItem: true, formQuestions: { include: { options: true } } } })
    if (!task) return res.status(404).send('Task not found')
    if (task.type !== 'FORM') return res.status(400).send('Unsupported task type')

    // Ensure same conference
    if (!submission.conferenceId || task.processItem.conferenceId !== submission.conferenceId) {
      return res.status(400).send("Task doesn't belong to submission's conference")
    }

    // Ensure the task's process item is ACTIVE: first item always active; otherwise previous item's due date must have passed
    if (submission.conferenceId) {
      const items = await prisma.processItem.findMany({ where: { conferenceId: submission.conferenceId }, orderBy: { order: 'asc' } })
      const idx = items.findIndex(i => i.id === task.processItemId)
      if (idx > 0) {
        const prev = items[idx - 1]
        if (prev) {
          const conf = await prisma.conference.findUnique({ where: { id: submission.conferenceId } })
          if (conf) {
            const a = new Date(conf.abstractDeadline)
            const abstractUTC = new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()))
            let prevDueStr: string | null = null
            if (prev.dueDaysBeforeAbstract !== null && prev.dueDaysBeforeAbstract !== undefined) {
              const d = new Date(abstractUTC)
              d.setUTCDate(d.getUTCDate() - prev.dueDaysBeforeAbstract)
              prevDueStr = d.toISOString().slice(0,10)
            }
            const today = new Date()
            const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0,10)
            if (prevDueStr && prevDueStr > todayStr) {
              return res.status(400).send('Task is not active yet')
            }
          }
        }
      }
    }

    // Build answers object from q_<id> fields
    const answers: Record<string, any> = {}
    for (const q of task.formQuestions) {
      const key = `q_${q.id}`
      const raw = (body as any)[key]
      if (q.required && (raw === undefined || raw === null || String(raw).trim() === '')) {
        return res.status(400).send(`Missing required answer for question ${q.title}`)
      }
      if (raw === undefined) continue
      let value: any = raw
      if (q.type === 'DATE' && value) {
        // Normalize date to YYYY-MM-DD
        try {
          const d = new Date(value)
          value = isNaN(d.getTime()) ? String(value) : d.toISOString().slice(0,10)
        } catch {
          value = String(value)
        }
      }
      if ((q.type === 'MULTIPLE' || q.type === 'DROPDOWN') && value) {
        const allowed = new Set(q.options.map(o => o.text))
        if (!allowed.has(String(value))) {
          return res.status(400).send(`Invalid option for ${q.title}`)
        }
      }
      answers[String(q.id)] = value
    }

    const now = new Date()
  await (prisma as any).taskSubmission.upsert({
      where: { taskId_submissionId: { taskId, submissionId } },
      create: { taskId, submissionId, answers: answers as any, completedAt: now },
      update: { answers: answers as any, completedAt: now },
    })

    if (returnTo) return res.redirect(303, returnTo)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).send('Internal Server Error')
  }
}
