'use client'

import { motion } from 'framer-motion'
import { Code2, Coffee, Heart, Star, Users, Zap } from 'lucide-react'

const highlights = [
  { Icon: Code2, text: 'Turned every debugging session into a learning moment' },
  { Icon: Coffee, text: 'Made Mondays feel like catching up with friends' },
  { Icon: Heart, text: 'Brought warmth to every standup and late-night incident' },
  { Icon: Star, text: 'Left the codebase better than you found it — always' },
  { Icon: Users, text: 'The person the team called when nothing made sense' },
  { Icon: Zap, text: 'Made performance feel personal, not just technical' },
]

export default function Highlights() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-outfit text-3xl md:text-4xl font-extrabold text-slate-800 mb-3">
            What we&apos;ll always remember
          </h2>
          <p className="font-inter text-slate-500">A few things that made you, you</p>
        </div>

        <div className="space-y-5">
          {highlights.map(({ Icon, text }, i) => (
            <motion.div
              key={text}
              className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-rose-100 shadow-sm"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
            >
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-rose-400" />
              </div>
              <p className="font-inter text-slate-600 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
