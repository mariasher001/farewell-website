'use client'

import { motion } from 'framer-motion'

const FLOATERS = [
  { emoji: '💙', left: '8%', top: '20%', delay: 0 },
  { emoji: '⭐', left: '22%', top: '65%', delay: 0.4 },
  { emoji: '✨', left: '55%', top: '18%', delay: 0.8 },
  { emoji: '💫', left: '70%', top: '70%', delay: 1.2 },
  { emoji: '🌟', left: '85%', top: '30%', delay: 1.6 },
  { emoji: '💖', left: '40%', top: '75%', delay: 2.0 },
]

export default function Closing() {
  return (
    <section className="py-28 px-6 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={{ left: f.left, top: f.top }}
          animate={{ y: [0, -14, 0], rotate: [0, 6, -6, 0] }}
          transition={{
            duration: 3.5 + i * 0.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: f.delay,
          }}
        >
          {f.emoji}
        </motion.span>
      ))}

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <motion.h2
          className="font-outfit text-4xl md:text-5xl font-extrabold text-slate-800 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Until we meet again, legend.
        </motion.h2>

        <motion.p
          className="font-inter text-lg text-slate-500 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Thank you for everything you brought to this team — the patience, the laughter,
          the late-night fixes, and the warmth. Wherever you go next, you carry a piece
          of DB PERF with you. We&apos;ll keep a chair warm.
        </motion.p>
      </div>
    </section>
  )
}
