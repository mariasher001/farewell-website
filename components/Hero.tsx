'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50" />

      {/* Floating decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { w: 80, l: '8%', t: '15%', delay: 0 },
          { w: 120, l: '22%', t: '60%', delay: 0.5 },
          { w: 60, l: '55%', t: '20%', delay: 1 },
          { w: 100, l: '70%', t: '65%', delay: 1.5 },
          { w: 70, l: '85%', t: '30%', delay: 2 },
        ].map((blob, i) => (
          <motion.div
            key={blob.delay}
            className="absolute rounded-full"
            style={{
              width: blob.w,
              height: blob.w,
              left: blob.l,
              top: blob.t,
              background:
                'radial-gradient(circle, rgba(251,113,133,0.25), rgba(251,191,36,0.15))',
            }}
            animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: blob.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.p
          className="text-sm font-semibold text-rose-400 uppercase tracking-widest mb-4 font-inter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          DB Performance Team · 29 April 2026
        </motion.p>

        <h1 className="font-outfit text-5xl md:text-7xl font-extrabold text-slate-800 mb-6 leading-tight">
          Farewell,{' '}
          <span className="text-rose-400">Basavaraj</span>{' '}
          <span>🌟</span>
        </h1>

        <motion.p
          className="font-inter text-lg md:text-xl text-slate-500 mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          The best teams are built by people like you &mdash; Thank you for everything.{' '}
          {['🎉', '✨', '🥳', '💫', '🎊'].map((emoji, i) => (
            <motion.span
              key={emoji}
              className="inline-block"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: [0, -8, 0] }}
              transition={{
                opacity: { delay: 0.7 + i * 0.1, duration: 0.3 },
                y: { delay: 0.7 + i * 0.1, duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: i * 0.3 },
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.p>

        <motion.a
          href="#messages"
          className="inline-flex items-center gap-2 bg-rose-400 hover:bg-rose-500 text-white font-inter font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-rose-200 transition-colors"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Heart size={18} aria-hidden={true} />
          Read Messages
        </motion.a>
      </motion.div>
    </section>
  )
}
