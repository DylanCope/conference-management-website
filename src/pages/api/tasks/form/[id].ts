import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string }
  const taskId = Number(id)
  if (!Number.isFinite(taskId)) return res.status(400).send('Invalid id')

  const method = (req.method === 'POST' && typeof req.query._method === 'string')
    ? (req.query._method as string).toUpperCase()
    : req.method

  if (method !== 'PUT') return res.status(405).end()

  try {
    const { questions } = (req.body || {}) as any
    if (!Array.isArray(questions)) return res.status(400).send('questions is required')

    // Ensure task exists and is a FORM
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return res.status(404).send('Task not found')
    if (String(task.type) !== 'FORM') return res.status(400).send('Only FORM tasks are editable')

    // Delete existing questions/options, then recreate from payload
    await prisma.$transaction([
      prisma.formOption.deleteMany({ where: { question: { taskId } } }),
      prisma.formQuestion.deleteMany({ where: { taskId } } ),
    ])

    for (const [qIdx, q] of questions.entries()) {
      const qrec = await prisma.formQuestion.create({
        data: {
          taskId: taskId,
          type: q.type?.toUpperCase?.() || 'SHORT',
          title: String(q.title || ''),
          required: !!q.required,
          order: typeof q.order === 'number' ? q.order : qIdx,
        }
      })
      if (Array.isArray(q.options) && q.options.length > 0) {
        for (const [oIdx, opt] of q.options.entries()) {
          await prisma.formOption.create({
            data: {
              questionId: qrec.id,
              text: String(opt.text || ''),
              order: typeof opt.order === 'number' ? opt.order : oIdx,
            }
          })
        }
      }
    }

    const returnTo = typeof req.query.returnTo === 'string' ? (req.query.returnTo as string) : null
    if (returnTo) return res.redirect(303, returnTo)
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error(e)
    return res.status(500).send('Internal Server Error')
  }
}
