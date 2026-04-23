'use client'

import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#fb7185', '#fbbf24', '#f97316', '#a78bfa', '#34d399', '#38bdf8', '#f472b6']

export default function ConfettiBlast() {
  useEffect(() => {
    const duration = 3500
    const end = Date.now() + duration

    function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 65,
        startVelocity: 55,
        origin: { x: 0, y: 0.1 },
        colors: COLORS,
        ticks: 200,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 65,
        startVelocity: 55,
        origin: { x: 1, y: 0.1 },
        colors: COLORS,
        ticks: 200,
      })

      if (Date.now() < end) requestAnimationFrame(frame)
    }

    frame()
  }, [])

  return null
}
