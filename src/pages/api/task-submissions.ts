import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { parse as parseCookie } from 'cookie'

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

    // Auth: get current user from cookie
    const rawCookie = req.headers.cookie || ''
    const cookies = parseCookie(rawCookie || '')
  const sessionRaw = cookies['session']
    let currentUserId: number | null = null
    if (sessionRaw) {
      try {
  const sess = JSON.parse(decodeURIComponent(sessionRaw)) as { userId?: number }
        if (sess.userId) currentUserId = Number(sess.userId)
      } catch {}
    }
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
