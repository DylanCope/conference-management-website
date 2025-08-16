"use client"

import { useState } from 'react'

type QuestionType = 'short' | 'paragraph' | 'multiple' | 'dropdown' | 'date'

type Question = {
  id: string
  type: QuestionType
  title: string
  options?: string[] // for multiple & dropdown
  required?: boolean
}

const defaultQuestionTitle: Record<QuestionType, string> = {
  short: 'Short answer question',
  paragraph: 'Paragraph question',
  multiple: 'Multiple choice question',
  dropdown: 'Dropdown question',
  date: 'Date question',
}

export default function FormBuilder({ processItemId, conferenceId }: { processItemId: number, conferenceId: number }) {
  const [questions, setQuestions] = useState<Question[]>([])

  function addQuestion(type: QuestionType) {
    const q: Question = {
      id: crypto.randomUUID(),
      type,
      title: defaultQuestionTitle[type],
      options: type === 'multiple' || type === 'dropdown' ? ['Option 1'] : undefined,
      required: false,
    }
    setQuestions(prev => [...prev, q])
  }

  function updateTitle(id: string, title: string) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, title } : q))
  }

  function toggleRequired(id: string) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, required: !q.required } : q))
  }

  function addOption(id: string) {
    setQuestions(prev => prev.map(q => q.id === id && (q.type === 'multiple' || q.type === 'dropdown')
      ? { ...q, options: [...(q.options || []), `Option ${((q.options || []).length + 1)}`] }
      : q
    ))
  }

  function updateOption(id: string, idx: number, value: string) {
    setQuestions(prev => prev.map(q => q.id === id && (q.type === 'multiple' || q.type === 'dropdown')
      ? { ...q, options: (q.options || []).map((o, i) => i === idx ? value : o) }
      : q
    ))
  }

  function removeOption(id: string, idx: number) {
    setQuestions(prev => prev.map(q => q.id === id && (q.type === 'multiple' || q.type === 'dropdown')
      ? { ...q, options: (q.options || []).filter((_, i) => i !== idx) }
      : q
    ))
  }

  function removeQuestion(id: string) {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button type="button" className="btn" onClick={() => addQuestion('short')}>Short answer</button>
        <button type="button" className="btn" onClick={() => addQuestion('paragraph')}>Paragraph</button>
        <button type="button" className="btn" onClick={() => addQuestion('multiple')}>Multiple choice</button>
        <button type="button" className="btn" onClick={() => addQuestion('dropdown')}>Dropdown</button>
        <button type="button" className="btn" onClick={() => addQuestion('date')}>Date</button>
      </div>

      {questions.length === 0 && (
  <p style={{ color: 'var(--muted)' }}>No questions yet. Use the buttons above to add your first question.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
        {questions.map((q, index) => (
          <li key={q.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 12, background:'var(--card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Q{index + 1}</strong>
              <div style={{ display: 'flex', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={!!q.required} onChange={() => toggleRequired(q.id)} /> Required
                </label>
                <button type="button" className="btn" onClick={() => removeQuestion(q.id)}>Delete</button>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <input
                value={q.title}
                onChange={(e) => updateTitle(q.id, e.target.value)}
                style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }}
              />
            </div>

            {(q.type === 'multiple' || q.type === 'dropdown') && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  {(q.options || []).map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input
                        value={opt}
                        onChange={(e) => updateOption(q.id, i, e.target.value)}
                        style={{ flex: 1, padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }}
                      />
                      <button type="button" className="btn" onClick={() => removeOption(q.id, i)}>Remove</button>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn" onClick={() => addOption(q.id)}>Add option</button>
                </div>
              </div>
            )}

            {q.type === 'short' && (
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>Short answer (free text).</div>
            )}
            {q.type === 'paragraph' && (
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>Paragraph (long text).</div>
            )}
            {q.type === 'date' && (
              <div style={{ marginTop: 8, color: 'var(--muted)' }}>Date input.</div>
            )}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            const payload = {
              processItemId,
              questions: questions.map((q, idx) => ({
                type: q.type,
                title: q.title,
                required: !!q.required,
                order: idx,
                options: (q.options || []).map((o, i) => ({ text: o, order: i })),
              })),
            }
            const res = await fetch('/api/tasks/form', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (res.ok) {
              window.location.href = `/admin/${conferenceId}/process-items/${processItemId}`
            } else {
              const msg = await res.text()
              alert(`Failed to save: ${msg}`)
            }
          }}
        >
          Save form
        </button>
        <button type="button" className="btn" onClick={() => setQuestions([])}>Clear</button>
      </div>
    </div>
  )
}
