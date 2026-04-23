'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import MessageCard from './MessageCard'
import AddMessageForm from './AddMessageForm'
import type { Message } from '@/lib/types'

const TOKENS_KEY = 'farewell_tokens'

function getStoredTokens(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveToken(id: string, token: string): void {
  const tokens = getStoredTokens()
  tokens[id] = token
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

function removeToken(id: string): void {
  const tokens = getStoredTokens()
  delete tokens[id]
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

export default function MessageBoard() {
  const [messages, setMessages] = useState<Message[]>([])
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    setTokens(getStoredTokens())
  }, [])

  async function fetchMessages() {
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Message[] = await res.json()
      setMessages(data)
    } catch {
      // keep messages as empty array on failure
    } finally {
      setIsLoading(false)
    }
  }

  function handleAdd(message: Message, token: string) {
    saveToken(message.id, token)
    setTokens((prev) => ({ ...prev, [message.id]: token }))
    setMessages((prev) => [message, ...prev])
    setShowForm(false)
  }

  async function handleUpdate(id: string, name: string, message: string) {
    const token = tokens[id]
    if (!token) return
    const res = await fetch(`/api/messages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message, token }),
    })
    if (res.ok) {
      const updated: Message = await res.json()
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)))
    }
  }

  async function handleDelete(id: string) {
    const token = tokens[id]
    if (!token) return
    const res = await fetch(`/api/messages/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (res.ok) {
      removeToken(id)
      setTokens((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setMessages((prev) => prev.filter((m) => m.id !== id))
    }
  }

  return (
    <section id="messages" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            Wishes from the team
          </h2>
          <p className="font-inter text-slate-500">
            Everyone has something to say — leave yours below
          </p>
        </div>

        {/* Add button */}
        <div className="flex justify-center mb-8">
          <motion.button
            onClick={() => setShowForm((v) => !v)}
            aria-expanded={showForm}
            className="inline-flex items-center gap-2 bg-white border border-rose-200 text-rose-500 font-inter font-semibold px-6 py-3 rounded-2xl shadow-sm hover:bg-rose-50 transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Add your wishes'}
          </motion.button>
        </div>

        {/* Slide-down form */}
        <AnimatePresence>
          {showForm && (
            <AddMessageForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading ? (
          <div role="status" className="text-center text-slate-400 py-16 font-inter">
            Loading wishes…
          </div>
        ) : (
          <>
            {/* Prompt when only the seeded card exists */}
            {messages.length <= 1 && !showForm && (
              <p className="text-center font-inter text-slate-400 text-sm mb-6">
                Be the first to leave a wish for Basavaraj →
              </p>
            )}

            {/* Card grid */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.08 } },
                hidden: {},
              }}
            >
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
                    }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  >
                    <MessageCard
                      message={msg}
                      isOwned={!!tokens[msg.id]}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}
