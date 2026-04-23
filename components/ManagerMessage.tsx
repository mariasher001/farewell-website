'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pencil } from 'lucide-react'

interface ManagerMsg {
  name: string
  message: string
  updated_at: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function ManagerMessage() {
  const [data, setData] = useState<ManagerMsg | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editMessage, setEditMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/manager-message')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return
        setData(d)
        setEditName(d.name)
        setEditMessage(d.message)
      })
  }, [])

  async function handleSave() {
    if (!editName.trim() || !editMessage.trim()) return
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch('/api/manager-message', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), message: editMessage.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to save')
        return
      }
      const updated = await res.json()
      setData(updated)
      setIsEditing(false)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancelEdit() {
    if (data) {
      setEditName(data.name)
      setEditMessage(data.message)
    }
    setIsEditing(false)
    setError('')
  }

  if (!data) return null

  return (
    <section className="py-20 px-6 bg-rose-50/40">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            Wishes from the manager
          </h2>
          <p className="font-inter text-slate-500">A personal note from the team&apos;s manager</p>
        </div>

        <motion.div
          className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 relative"
          whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(251,113,133,0.15)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              aria-label="Edit manager message"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
            >
              <Pencil size={14} />
            </button>
          )}

          {isEditing ? (
            <div className="space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm font-semibold text-slate-700 border border-rose-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300 font-inter"
                placeholder="Manager&apos;s name"
              />
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                maxLength={1000}
                rows={5}
                className="w-full text-sm text-slate-600 border border-rose-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 font-inter"
                placeholder="Manager&apos;s message"
              />
              <p className="text-xs text-slate-400 text-right font-inter">
                {editMessage.length}/1000
              </p>
              {error && <p className="text-sm text-red-400 font-inter">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !editName.trim() || !editMessage.trim()}
                  className="text-xs font-semibold text-white bg-rose-400 hover:bg-rose-500 px-3 py-1.5 rounded-lg disabled:opacity-50 font-inter"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center font-outfit font-bold text-rose-600 text-sm flex-shrink-0 ring-2 ring-white shadow-sm">
                {getInitials(data.name)}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="font-outfit font-semibold text-slate-700 mb-2">{data.name}</p>
                <p className="font-inter text-slate-500 leading-relaxed">{data.message}</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
