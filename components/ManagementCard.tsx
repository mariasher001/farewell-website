'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Message } from '@/lib/types'

interface Props {
  message: Message
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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ManagementCard({ message, onUpdate, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [editName, setEditName] = useState(message.name)
  const [editMessage, setEditMessage] = useState(message.message)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!editName.trim() || !editMessage.trim()) return
    setIsSaving(true)
    try {
      await onUpdate(message.id, editName.trim(), editMessage.trim())
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
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
      className="bg-white rounded-2xl border border-rose-100 shadow-sm p-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ boxShadow: '0 8px 30px rgba(251,113,133,0.12)' }}
      transition={{ duration: 0.3 }}
    >
      {/* Controls */}
      {!isEditing && !isConfirmingDelete && (
        <div className="absolute top-6 right-6 flex gap-1">
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

      {isConfirmingDelete && (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-white border border-rose-100 rounded-xl px-3 py-1.5 shadow-md z-10">
          <span className="text-xs text-slate-500">Delete?</span>
          <button
            onClick={() => onDelete(message.id)}
            className="text-xs font-semibold text-red-400 hover:text-red-500"
          >
            Yes
          </button>
          <button
            onClick={() => setIsConfirmingDelete(false)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            No
          </button>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-3">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 border border-rose-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 font-inter"
            placeholder="Your name"
          />
          <textarea
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            maxLength={1000}
            rows={6}
            className="w-full text-sm text-slate-600 border border-rose-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 font-inter"
            placeholder="Your message"
          />
          <p className="text-xs text-slate-400 text-right font-inter">{editMessage.length}/1000</p>
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
        <div className="flex items-start gap-5">
          {/* Large avatar */}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center font-outfit font-bold text-base flex-shrink-0 ring-2 ring-white shadow-sm ${avatarColor}`}
          >
            {initials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-8">
            <p className="font-outfit font-bold text-slate-800 text-lg leading-snug mb-0.5">
              {message.name}
            </p>
            <p className="font-inter text-xs text-slate-400 mb-4">
              {formatDate(message.created_at)}
            </p>
            <p className="font-inter text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
              {message.message}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  )
}
