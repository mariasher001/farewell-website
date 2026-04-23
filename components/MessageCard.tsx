'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Message } from '@/lib/types'

interface Props {
  message: Message
  isOwned: boolean
  onUpdate: (id: string, name: string, message: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const AVATAR_COLORS = [
  'bg-rose-100 text-rose-600',
  'bg-amber-100 text-amber-600',
  'bg-emerald-100 text-emerald-600',
  'bg-violet-100 text-violet-600',
  'bg-sky-100 text-sky-600',
]

function getAvatarColor(name: string): string {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export default function MessageCard({ message, isOwned, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [editName, setEditName] = useState(message.name)
  const [editMessage, setEditMessage] = useState(message.message)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!editName.trim() || !editMessage.trim()) return
    setIsSaving(true)
    await onUpdate(message.id, editName.trim(), editMessage.trim())
    setIsEditing(false)
    setIsSaving(false)
  }

  function handleCancelEdit() {
    setEditName(message.name)
    setEditMessage(message.message)
    setIsEditing(false)
  }

  const avatarColor = getAvatarColor(message.name)
  const initials = getInitials(message.name)

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 relative h-full"
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(251,113,133,0.15)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Owned card controls */}
      {isOwned && !isEditing && !isConfirmingDelete && (
        <div className="absolute top-4 right-4 flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            aria-label="Edit message"
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setIsConfirmingDelete(true)}
            aria-label="Delete message"
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {isConfirmingDelete && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white border border-rose-100 rounded-xl px-3 py-1.5 shadow-md z-10">
          <span className="text-xs text-slate-500">Delete?</span>
          <button
            onClick={() => onDelete(message.id)}
            aria-label="Confirm delete"
            className="text-xs font-semibold text-red-400 hover:text-red-500"
          >
            Yes
          </button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            aria-label="Cancel delete"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            No
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-outfit font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-sm ${avatarColor}`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full text-sm font-semibold text-slate-700 border border-rose-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Your name"
              />
              <textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                maxLength={280}
                rows={4}
                className="w-full text-sm text-slate-600 border border-rose-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Your message"
              />
              <p className="text-xs text-slate-400 text-right">{editMessage.length}/280</p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 font-inter"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="text-xs font-semibold text-white bg-rose-400 hover:bg-rose-500 px-3 py-1.5 rounded-lg disabled:opacity-50 font-inter"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-outfit font-semibold text-slate-700 text-sm mb-1.5 pr-14">
                {message.name}
              </p>
              <p className="font-inter text-slate-500 text-sm leading-relaxed">
                {message.message}
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
