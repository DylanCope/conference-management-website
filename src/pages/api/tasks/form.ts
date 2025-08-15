import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }
  try {
    const { processItemId, questions } = req.body as any
    const pid = Number(processItemId)
    if (!pid || !Array.isArray(questions)) {
      res.status(400).send('processItemId and questions are required')
      return
    }

    // Create the task first
    const max = await prisma.task.aggregate({ where: { processItemId: pid }, _max: { order: true } })
    const nextOrder = (max._max.order ?? -1) + 1

    const task = await prisma.task.create({ data: { processItemId: pid, type: 'FORM', order: nextOrder } })

    // Create questions and options
    for (const [qIdx, q] of questions.entries()) {
      const qrec = await prisma.formQuestion.create({
        data: {
          taskId: task.id,
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

    res.status(200).json({ ok: true, taskId: task.id })
  } catch (e) {
    console.error(e)
    res.status(500).send('Internal Server Error')
  }
}
