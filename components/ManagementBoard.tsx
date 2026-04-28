'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import MessageCard from './MessageCard'
import type { Message } from '@/lib/types'

export default function ManagementBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [name, setName] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { fetchMessages() }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/management-messages')
      if (!res.ok) throw new Error()
      setMessages(await res.json())
    } catch {
      // keep empty
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !messageText.trim()) return
    setIsSubmitting(true)
    setFormError('')
    try {
      const res = await fetch('/api/management-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), message: messageText.trim() }),
      })
      if (!res.ok) {
        const d = await res.json()
        setFormError(d.error ?? 'Something went wrong')
        return
      }
      const created: Message = await res.json()
      setMessages((prev) => [created, ...prev])
      setName('')
      setMessageText('')
      setShowForm(false)
    } catch {
      setFormError('Failed to submit. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdate(id: string, updatedName: string, updatedMessage: string) {
    const res = await fetch(`/api/management-messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: updatedName, message: updatedMessage }),
    })
    if (res.ok) {
      const updated: Message = await res.json()
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/management-messages/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <section className="py-20 px-6 bg-rose-50/40">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            From the Management
          </h2>
          <p className="font-inter text-slate-500">
            A few words from leadership
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => setShowForm((v) => !v)}
            aria-expanded={showForm}
            className="inline-flex items-center gap-2 bg-white border border-rose-200 text-rose-500 font-inter font-semibold px-6 py-3 rounded-2xl shadow-sm hover:bg-rose-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add a note'}
          </motion.button>
        </div>

        <AnimatePresence>
          {showForm && (
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
                  Add your note 💙
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="mgmt-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 font-inter">
                      Your Name
                    </label>
                    <input
                      id="mgmt-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Sunil"
                      className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-700 font-inter focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="mgmt-message" className="text-xs font-semibold text-slate-500 uppercase tracking-wide font-inter">
                        Your Message
                      </label>
                      <span className="text-xs text-slate-400 font-inter">{messageText.length}/1000</span>
                    </div>
                    <textarea
                      id="mgmt-message"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      required
                      maxLength={1000}
                      rows={4}
                      placeholder="Share your farewell message…"
                      className="w-full border border-rose-100 rounded-xl px-4 py-3 text-sm text-slate-600 font-inter resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-300"
                    />
                  </div>
                  {formError && <p className="text-sm text-red-400 font-inter">{formError}</p>}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 border border-rose-100 text-slate-500 font-inter font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !name.trim() || !messageText.trim()}
                      className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-inter font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? 'Sending…' : 'Post note 💙'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div role="status" className="text-center text-slate-400 py-16 font-inter">
            Loading…
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } }, hidden: {} }}
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  layout
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <MessageCard
                    message={msg}
                    isOwned={true}
                    cardHeight="h-64"
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  )
}
