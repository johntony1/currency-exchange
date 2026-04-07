import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flag } from './flags'

/* ─────────────────────────────────────────────────────────────
 * TRANSACTION SUCCESS — ANIMATION STORYBOARD
 *
 *   0ms   green glow: scale(0.5) opacity(0) → in     spring bounce:0.2
 *  80ms   badge: scale(0) blur(8px) → [1.25 / 0.92 / 1.06 / 1]  distortion pop
 * 150ms   confetti burst: 72 ribbons + dots from badge center
 *          arc outward, gravity + air drag, fade @ 2.8s, done @ 3.6s
 * 220ms   "Transaction completed" fades + slides up               spring
 * 300ms   currency pair row fades + slides up                     spring
 * 440ms   "Back to home" button fades + slides up                 spring
 *
 * CONFETTI palette: greens, gold, white — feels celebratory, on-brand
 * Each particle: 5–14 × 8–18 px ribbon, random rotation velocity,
 *               downward gravity 0.28px/frame², air resistance 0.992
 * ───────────────────────────────────────────────────────────── */

/* ── Tokens (mirrors CurrencySwap / TransactionSummary) ────── */
const T = {
  strong:  '#171717',
  sub:     '#5c5c5c',
  stroke:  '#ebebeb',
  bgWhite: '#ffffff',
  green:   '#16a34a',
} as const

const inter = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0",
  WebkitFontSmoothing: 'antialiased',
} as const

/* ── Springs ───────────────────────────────────────────────── */
const SPRING_ENTRY = { type: 'spring', visualDuration: 0.42, bounce: 0.14 } as const
const SPRING_PRESS = { type: 'spring', stiffness: 700, damping: 42 }        as const

/* ── Confetti ──────────────────────────────────────────────── */
const CONFETTI_COLORS = [
  '#22c55e', '#4ade80', '#86efac', '#bbf7d0',   // greens
  '#fbbf24', '#fde68a', '#f59e0b',               // golds
  '#ffffff', '#f0fdf4',                           // whites/light
  '#6ee7b7', '#a7f3d0',                           // mints
]

const DURATION   = 5200   // ms — full confetti lifetime
const FADE_START = 3600   // ms — start fading at 3.6 s, done at 5.2 s

type Particle = {
  x: number; y: number
  vx: number; vy: number
  rot: number; rotV: number
  w: number; h: number
  color: string
  alpha: number
  dot: boolean  // circle vs ribbon
}

function spawnParticles(cx: number, cy: number, count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 1.8 + Math.random() * 5.5   // slower burst
    const dot   = Math.random() < 0.25
    return {
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.5,   // gentler upward bias
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,  // slower tumble
      w: dot ? 5 + Math.random() * 4 : 4  + Math.random() * 8,
      h: dot ? 5 + Math.random() * 4 : 9  + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      alpha: 1,
      dot,
    }
  })
}

/* ── Confetti canvas component ─────────────────────────────── */
function ConfettiCanvas({
  badgeRef,
}: {
  badgeRef: React.RefObject<HTMLDivElement | null>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced   = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    if (!ctx) return

    // Measure after layout
    const dpr     = window.devicePixelRatio || 1
    const rect    = canvas.getBoundingClientRect()
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const W = rect.width
    const H = rect.height

    let particles: Particle[] = []
    let start: number | null = null
    let rafId: number

    // Delay burst so it fires as badge pops into view
    const launchTimer = window.setTimeout(() => {
      const badge     = badgeRef.current
      const origin    = badge?.getBoundingClientRect()
      const canvasPos = canvas.getBoundingClientRect()
      const cx = origin ? origin.left + origin.width  / 2 - canvasPos.left : W / 2
      const cy = origin ? origin.top  + origin.height / 2 - canvasPos.top  : H * 0.28
      particles = spawnParticles(cx, cy, 72)
    }, 180)

    function frame(now: number) {
      if (!start) start = now
      const t = now - start

      ctx.clearRect(0, 0, W, H)

      for (const p of particles) {
        // Physics — gentle gravity + strong air drag so they float longer
        p.vy  += 0.16
        p.vx  *= 0.988
        p.vy  *= 0.988
        p.x   += p.vx
        p.y   += p.vy
        p.rot += p.rotV

        // Fade out in final window
        if (t > FADE_START) {
          p.alpha = Math.max(0, 1 - (t - FADE_START) / 900)
        }
        if (p.alpha <= 0 || p.y > H + 40) continue

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color

        if (p.dot) {
          ctx.beginPath()
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        }
        ctx.restore()
      }

      if (t < DURATION) {
        rafId = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, W, H)
      }
    }

    rafId = requestAnimationFrame(frame)

    return () => {
      clearTimeout(launchTimer)
      cancelAnimationFrame(rafId)
      ctx.clearRect(0, 0, W, H)
    }
  }, [reduced, badgeRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════
 * MAIN EXPORT
 * ═══════════════════════════════════════════════════════════ */
export default function TransactionSuccess({
  sell, receive, sellAmt, receiveAmt, onBack,
}: {
  sell:       { code: string; symbol: string }
  receive:    { code: string; symbol: string }
  sellAmt:    number
  receiveAmt: number
  onBack:     () => void
}) {
  const reduced  = useReducedMotion()
  const badgeRef = useRef<HTMLDivElement>(null)

  return (
    /* Wrapper clips confetti canvas to card border-radius */
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 20,
      height: 320,                                      // fixed card height
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── Confetti canvas ───────────────────────────────── */}
      {!reduced && <ConfettiCanvas badgeRef={badgeRef} />}

      {/* ── Soft green radial glow — top-centre ──────────── */}
      {/* NOTE: no `transform` in style — Framer Motion owns that property.
               Centre horizontally with left: calc(50% - 170px) instead.    */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduced
          ? { duration: 0.15 }
          : { type: 'spring', visualDuration: 0.55, bounce: 0.2 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 'calc(50% - 170px)',   // centres the 340px element without touching `transform`
          width: 340, height: 280,
          transformOrigin: 'center top',
          background: [
            'radial-gradient(ellipse 60% 60% at 50% 10%,',
            '  rgba(187,247,208,0.95) 0%,',
            '  rgba(134,239,172,0.55) 40%,',
            '  rgba(74,222,128,0.15) 65%,',
            '  transparent 85%)',
          ].join(''),
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'transform',
        }}
      />

      {/* ── Body content ─────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 24px',
        gap: 16,
      }}>

        {/* Check badge — distortion pop entry */}
        <motion.div
          ref={badgeRef}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale:   reduced ? [0, 1] : [0, 1.25, 0.92, 1.06, 1],
            opacity: [0, 1, 1, 1, 1],
            filter:  reduced
              ? ['blur(0px)', 'blur(0px)']
              : ['blur(8px)', 'blur(3px)', 'blur(0px)', 'blur(0px)', 'blur(0px)'],
          }}
          transition={{
            times:    [0, 0.34, 0.56, 0.76, 1],
            duration: reduced ? 0.15 : 0.72,
            ease:     'easeOut',
            delay:    reduced ? 0 : 0.08,
          }}
          style={{
            width: 64, height: 64, borderRadius: 9999,
            background: T.bgWhite,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: [
              '0px 32px 32px -16px rgba(11,70,39,0.08)',
              '0px 16px 16px -8px  rgba(11,70,39,0.06)',
              '0px 9.6px 9.6px -4.8px rgba(11,70,39,0.05)',
              '0px 4.8px 4.8px -2.4px rgba(11,70,39,0.04)',
              '0px 1.6px 1.6px -0.8px rgba(11,70,39,0.04)',
              '0px 0px 0px 1.6px    rgba(11,70,39,0.07)',
            ].join(', '),
          }}
        >
          {/* Green checkmark */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12L10 17L19 7"
              stroke={T.green} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          {/* Inset highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 9999, pointerEvents: 'none',
            boxShadow: 'inset 0px 1px 2px 0px rgba(255,255,255,0.60)',
          }} />
        </motion.div>

        {/* Text group */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <motion.p
            initial={{ opacity: 0, y: reduced ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0.22 }}
            style={{
              ...inter, fontWeight: 600, fontSize: 16,
              lineHeight: '24px', letterSpacing: '-0.096px',
              color: T.strong, margin: 0, textAlign: 'center',
            }}
          >
            Transaction completed
          </motion.p>

          {/* Currency pair: flag  amount CODE  to  flag  amount CODE */}
          <motion.div
            initial={{ opacity: 0, y: reduced ? 0 : 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0.30 }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <Flag code={sell.code} size={16} />
            <span style={{
              ...inter, fontWeight: 500, fontSize: 14,
              lineHeight: '20px', letterSpacing: '-0.084px',
              color: T.strong, fontVariantNumeric: 'tabular-nums',
            }}>
              {sellAmt.toLocaleString('en-US')} {sell.code}
            </span>
            <span style={{
              ...inter, fontWeight: 400, fontSize: 13,
              lineHeight: '20px', letterSpacing: '-0.078px', color: T.sub,
            }}>
              to
            </span>
            <Flag code={receive.code} size={16} />
            <span style={{
              ...inter, fontWeight: 500, fontSize: 14,
              lineHeight: '20px', letterSpacing: '-0.084px',
              color: T.strong, fontVariantNumeric: 'tabular-nums',
            }}>
              {receiveAmt.toLocaleString('en-US', { maximumFractionDigits: 2 })} {receive.code}
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Footer: Back to home ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0.44 }}
        style={{ padding: '0 16px 20px', position: 'relative', zIndex: 1, flexShrink: 0 }}
      >
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.97 }}
          transition={SPRING_PRESS}
          aria-label="Back to home"
          style={{
            width: '100%', height: 40,
            borderRadius: 24, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: T.bgWhite,
            cursor: 'pointer',
            boxShadow: [
              '0px 1px 3px 0px rgba(14,18,27,0.12)',
              '0px 0px 0px 1px #ebebeb',
            ].join(', '),
            WebkitTapHighlightColor: 'transparent', outline: 'none',
          }}
        >
          <span style={{
            ...inter, fontWeight: 500, fontSize: 14,
            lineHeight: '20px', letterSpacing: '-0.084px', color: T.sub,
          }}>
            Back to home
          </span>
        </motion.button>
      </motion.div>

    </div>
  )
}
