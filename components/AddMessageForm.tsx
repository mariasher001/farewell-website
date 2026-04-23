'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from '@/lib/types'

interface Props {
  onAdd: (message: Message, token: string) => void
  onCancel: () => void
}

export default function AddMessageForm({ onAdd, onCancel }: Props) {
  const [name, setName] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !messageText.trim()) return
    setIsSubmitting(true)
    setError('')

    const token = uuidv4()

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: messageText.trim(), token }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      const created = await res.json()
      onAdd(
        {
          id: created.id,
          name: created.name,
          message: created.message,
          created_at: created.created_at,
        },
        created.token
      )
    } catch {
      setError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 mb-8">
        <h3 className="font-outfit font-bold text-slate-700 text-lg mb-5">
          Leave your wishes 💙
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-inter">
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Priya S."
              className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide font-inter">
                Your Message
              </label>
              <span className="text-xs text-slate-400 font-inter">
                {messageText.length}/280
              </span>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
              maxLength={280}
              rows={4}
              placeholder="Share a memory, a thank you, or your best wishes…"
              className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-600 font-inter resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
            />
          </div>

          {error && <p className="text-sm text-red-400 font-inter">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-rose-100 text-slate-500 font-inter font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !messageText.trim()}
              className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-inter font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Sending…' : 'Send wishes 💙'}
            </button>
          </div>
        </div>
      </div>
    </motion.form>
  )
}
