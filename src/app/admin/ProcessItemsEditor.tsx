"use client"

import React, { useMemo, useState } from 'react'

export type ProcessItem = {
  id: string
  title: string
}

type Props = {
  conferenceId: number
  initialItems?: ProcessItem[]
}

export default function ProcessItemsEditor({ conferenceId, initialItems = [] }: Props) {
  const seeded = useMemo<ProcessItem[]>(() => {
    if (initialItems.length > 0) return initialItems
    // Starter seed just for UI demonstration
    return [
    //   { id: 'seed-0', title: 'Step 0 — Define goal and present to group' },
    //   { id: 'seed-1', title: 'Check-in 1 — Intro + Methods written' },
    //   { id: 'seed-2', title: 'Check-in 2 — First full draft + paper clinic' },
    //   { id: 'seed-3', title: 'Check-in 3 — Internal reviews x2' },
    ]
  }, [initialItems])

  const [items, setItems] = useState<ProcessItem[]>(seeded)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function startEdit(id: string, title: string) {
    const isPersisted = /^\d+$/.test(id)
    setEditingId(id)
    setEditTitle(title)
  }
  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
  }
  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    const title = editTitle.trim()
    if (!title) return
    setItems(prev => prev.map(it => it.id === editingId ? { ...it, title } : it))
    setEditingId(null)
    setEditTitle('')
  }
  async function removeItem(id: string) {
    const isPersisted = /^\d+$/.test(id)
    if (isPersisted) {
      const yes = window.confirm('Delete this process item? This will also delete its tasks and questions.')
      if (!yes) return
      try {
        setDeletingId(id)
        const res = await fetch(`/api/process-items/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const msg = await res.text()
          throw new Error(msg || 'Failed to delete')
        }
      } catch (e: any) {
        alert(e?.message || 'Failed to delete')
        setDeletingId(null)
        return
      }
      setDeletingId(null)
    }
    setItems(prev => prev.filter(it => it.id !== id))
  }

  // Drag & drop handlers
  function onDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain') || draggingId
    if (!sourceId || sourceId === targetId) return setDraggingId(null)
    setItems(prev => {
      const sourceIdx = prev.findIndex(i => i.id === sourceId)
      const targetIdx = prev.findIndex(i => i.id === targetId)
      if (sourceIdx === -1 || targetIdx === -1) return prev
      const next = [...prev]
      const [moved] = next.splice(sourceIdx, 1)
      next.splice(targetIdx, 0, moved)
      return next
    })
    setDraggingId(null)
  }
  function onDragEnd() {
    setDraggingId(null)
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Process items</h2>
  <p style={{ color: 'var(--muted)', marginTop: 0 }}>Drag the handle to reorder. Add, edit, or delete items.</p>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
        {items.map(item => {
          const isEditing = editingId === item.id
          const isDragging = draggingId === item.id
          const isPersisted = /^\d+$/.test(item.id)
          return (
            <li
              key={item.id}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, item.id)}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                background: isDragging ? 'color-mix(in oklab, var(--muted) 8%, var(--card))' : 'var(--card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                  <button
                    aria-label="Drag to reorder"
                    draggable
                    onDragStart={(e) => onDragStart(e, item.id)}
                    onDragEnd={onDragEnd}
                    style={{
                      cursor: 'grab', padding: '4px 8px',
                      border: '1px solid var(--border)', borderRadius: 6,
                      background: 'transparent', color: 'var(--muted)'
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.cursor = 'grabbing')}
                    onMouseUp={(e) => (e.currentTarget.style.cursor = 'grab')}
                  >
                    {/* Simple SVG grip for consistent dark/light rendering */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                      <circle cx="7" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="17" r="1.5" fill="currentColor"/>
                    </svg>
                  </button>

                  {isEditing ? (
                    <form onSubmit={saveEdit} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ flex: 1, padding: 8, border: '1px solid var(--border)', borderRadius: 4, background:'var(--card)', color:'var(--text)' }}
                      />
                      <button type="submit" className="btn">Save</button>
                      <button type="button" onClick={cancelEdit} className="btn">Cancel</button>
                    </form>
                  ) : (
                    <div style={{ flex: 1 }}>{item.title}</div>
                  )}
                </div>

                {!isEditing && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isPersisted ? (
                      <a
                        href={`/admin/${conferenceId}/process-items/${item.id}`}
                        className="btn"
                      >
                        Edit
                      </a>
                    ) : (
                      <span className="btn" aria-disabled>
                        Edit
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="btn"
                      disabled={deletingId === item.id}
                      aria-disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 12 }}>
          <form method="get" action={`/admin/${conferenceId}/process-items/new`}>
            <button type="submit" className="btn">Add process item</button>
          </form>
      </div>

    </section>
  )
}
