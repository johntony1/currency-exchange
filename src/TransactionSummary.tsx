import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from 'framer-motion'
import exchange3d from './assets/modal/exchange-3d.png'

/* ─────────────────────────────────────────────────────────────
 * TRANSACTION SUMMARY — ANIMATION STORYBOARD
 *
 *  ENTER (container already morphed via layout in parent)
 *    0ms   header: opacity(0) y(6) → in          spring entry
 *   60ms   3D icon: scale(0.85) opacity(0) → in  spring bounce:0.22
 *  120ms   "Exchange" label fades up
 *  160ms   currency pair slides up
 *  220ms   large amount springs in
 *  300ms   separator fades
 *  320ms   row[0]: opacity(0) y(6) → in          stagger 50ms each
 *  370ms   row[1] …
 *  420ms   row[2] …
 *  470ms   row[3] …
 *  540ms   slide button fades up
 *
 *  SLIDE TO SWAP
 *    drag  handle slides right (dragConstraints)
 *          text opacity fades as handle approaches right
 *   100%   success: handle snaps to end, checkmark appears
 *
 *  EXIT
 *    0ms   opacity(1→0) 100ms ease-in  (parent drives collapse)
 * ───────────────────────────────────────────────────────────── */

const SPRING_ENTRY  = { type: 'spring', visualDuration: 0.42, bounce: 0.14 } as const
const SPRING_ICON   = { type: 'spring', visualDuration: 0.48, bounce: 0.22 } as const
const SPRING_PRESS  = { type: 'spring', stiffness: 600, damping: 40        } as const

/* ── Design tokens ─────────────────────────────────────────── */
const T = {
  strong:  '#171717',
  sub:     '#5c5c5c',
  soft:    '#a3a3a3',
  stroke:  '#ebebeb',
  bgWeak:  '#f7f7f7',
  bgWhite: '#ffffff',
} as const

const inter = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0",
  WebkitFontSmoothing: 'antialiased',
} as const

/* ── Inline SVG icons ──────────────────────────────────────── */
function IconWallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 14.8333 14.3475" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.75 8.59747C10.75 8.82759 10.5635 9.01413 10.3333 9.01413C10.1032 9.01413 9.91667 8.82759 9.91667 8.59747C9.91667 8.36735 10.1032 8.1808 10.3333 8.1808C10.5635 8.1808 10.75 8.36735 10.75 8.59747Z" fill="#A4A4A4"/>
      <path d="M12.4167 3.59747V2.25136C12.4167 1.25521 11.4635 0.535774 10.5055 0.808806L1.83887 3.27881C1.19444 3.46247 0.75 4.05128 0.75 4.72136V6.09747M10.75 8.59747C10.75 8.82759 10.5635 9.01413 10.3333 9.01413C10.1032 9.01413 9.91667 8.82759 9.91667 8.59747C9.91667 8.36735 10.1032 8.1808 10.3333 8.1808C10.5635 8.1808 10.75 8.36735 10.75 8.59747ZM1.75 13.5975H13.0833C13.6356 13.5975 14.0833 13.1498 14.0833 12.5975V4.59747C14.0833 4.04518 13.6356 3.59747 13.0833 3.59747H1.75C1.19772 3.59747 0.75 4.04518 0.75 4.59747V12.5975C0.75 13.1498 1.19771 13.5975 1.75 13.5975Z" stroke="#A4A4A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconCoin() {
  return (
    <svg width="20" height="20" viewBox="0 0 16.5 11.5" fill="none" style={{ flexShrink: 0 }}>
      <path d="M15.75 4.08333C15.75 5.92428 12.3921 7.41667 8.25 7.41667C4.10786 7.41667 0.75 5.92428 0.75 4.08333M15.75 4.08333C15.75 2.24238 12.3921 0.75 8.25 0.75C4.10786 0.75 0.75 2.24238 0.75 4.08333M15.75 4.08333V7.41667C15.75 9.25762 12.3921 10.75 8.25 10.75C4.10786 10.75 0.75 9.25762 0.75 7.41667V4.08333" stroke="#A4A4A4" strokeWidth="1.5"/>
    </svg>
  )
}

function IconHandCoin() {
  return (
    <svg width="20" height="20" viewBox="0 0 14.8333 14.3475" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10.75 8.59747C10.75 8.82759 10.5635 9.01413 10.3333 9.01413C10.1032 9.01413 9.91667 8.82759 9.91667 8.59747C9.91667 8.36735 10.1032 8.1808 10.3333 8.1808C10.5635 8.1808 10.75 8.36735 10.75 8.59747Z" fill="#A4A4A4"/>
      <path d="M12.4167 3.59747V2.25136C12.4167 1.25521 11.4635 0.535774 10.5055 0.808806L1.83887 3.27881C1.19444 3.46247 0.75 4.05128 0.75 4.72136V6.09747M10.75 8.59747C10.75 8.82759 10.5635 9.01413 10.3333 9.01413C10.1032 9.01413 9.91667 8.82759 9.91667 8.59747C9.91667 8.36735 10.1032 8.1808 10.3333 8.1808C10.5635 8.1808 10.75 8.36735 10.75 8.59747ZM1.75 13.5975H13.0833C13.6356 13.5975 14.0833 13.1498 14.0833 12.5975V4.59747C14.0833 4.04518 13.6356 3.59747 13.0833 3.59747H1.75C1.19772 3.59747 0.75 4.04518 0.75 4.59747V12.5975C0.75 13.1498 1.19771 13.5975 1.75 13.5975Z" stroke="#A4A4A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="13" height="13" viewBox="0 0 12.7877 12.7877" fill="none">
      <path d="M5.41176 6.39385L0 0.98209L0.98209 0L6.39384 5.4117L11.8056 0L12.7877 0.98209L7.37592 6.39385L12.7877 11.8055L11.8056 12.7877L6.39384 7.37594L0.98209 12.7877L0 11.8055L5.41176 6.39385Z" fill="#5C5C5C"/>
    </svg>
  )
}

function IconArrowsRight() {
  return (
    <svg width="11" height="10" viewBox="0 0 10.5809 9.74755" fill="none">
      <path d="M0.707107 9.04044L4.87377 4.87377L0.707107 0.707107M5.70711 9.04044L9.87377 4.87377L5.70711 0.707107" stroke="white" strokeLinecap="square"/>
    </svg>
  )
}

/* ── Detail row ────────────────────────────────────────────── */
function DetailRow({
  icon, label, value, delay,
}: {
  icon:  React.ReactNode
  label: string
  value: React.ReactNode
  delay: number
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon}
        <span style={{ ...inter, fontWeight: 400, fontSize: 13, lineHeight: '20px', letterSpacing: '-0.078px', color: T.sub }}>
          {label}
        </span>
      </div>
      <span style={{ ...inter, fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.084px', color: T.strong, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </motion.div>
  )
}

/* ── Slide-to-swap button ──────────────────────────────────── */
function SlideToSwap({ onConfirm }: { onConfirm: () => void }) {
  const reduced   = useReducedMotion()
  const [done, setDone]   = useState(false)
  const trackRef  = useRef<HTMLDivElement>(null)
  const dragX     = useMotionValue(0)
  const HANDLE    = 48  // handle diameter

  // Fade out label as handle approaches right
  const labelOpacity = useTransform(dragX, [0, 120], [1, 0])

  function handleDragEnd() {
    const trackW = (trackRef.current?.offsetWidth ?? 320) - HANDLE - 8
    if (dragX.get() >= trackW * 0.78) {
      // Snap to end
      animate(dragX, trackW, { type: 'spring', stiffness: 500, damping: 40 })
      setDone(true)
      setTimeout(onConfirm, 500)
    } else {
      // Spring back
      animate(dragX, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0.52 }}
    >
      <div
        ref={trackRef}
        style={{
          position: 'relative',
          height: HANDLE + 8,
          borderRadius: 999,
          padding: 4,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.153) 6.67%, rgba(255,255,255,0) 103.33%), linear-gradient(90deg, #f7f7f7 0%, #f7f7f7 100%)',
          boxShadow: '0px 0px 0px 0.3px #ebebeb, 0px 1px 3px -1.5px rgba(51,51,51,0.16)',
          display: 'flex', alignItems: 'center',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {/* "Slide To Swap" label — centered, fades as handle moves */}
        <motion.p
          style={{
            ...inter, fontWeight: 500, fontSize: 14,
            lineHeight: '20px', letterSpacing: '-0.084px', color: T.sub,
            position: 'absolute', left: 0, right: 0, textAlign: 'center',
            pointerEvents: 'none',
            opacity: labelOpacity,
          }}
        >
          {done ? 'Swapped!' : 'Slide To Swap'}
        </motion.p>

        {/* Draggable handle */}
        <motion.div
          drag={done ? false : 'x'}
          dragConstraints={trackRef}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{
            x: dragX,
            width: HANDLE, height: HANDLE,
            borderRadius: 999, flexShrink: 0, zIndex: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: done ? 'default' : 'grab',
            position: 'relative',
            backgroundImage: [
              'linear-gradient(180deg, rgba(255,255,255,0.153) 6.67%, rgba(255,255,255,0) 103.33%)',
              `linear-gradient(90deg, #171717 0%, #171717 100%)`,
            ].join(', '),
            boxShadow: [
              '0px 0px 0px 0.75px #171717',
              '0px 16px 8px -8px rgba(51,51,51,0.01)',
              '0px 12px 6px -6px rgba(51,51,51,0.02)',
              '0px 5px 5px -2.5px rgba(51,51,51,0.08)',
              '0px 1px 3px -1.5px rgba(51,51,51,0.16)',
            ].join(', '),
            WebkitTapHighlightColor: 'transparent',
          }}
          whileTap={{ scale: 0.94 }}
          transition={SPRING_PRESS}
        >
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.svg
                key="check"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <path d="M5 12L10 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </motion.svg>
            ) : (
              <motion.span key="arrows" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <IconArrowsRight />
              </motion.span>
            )}
          </AnimatePresence>
          {/* Inset highlight */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 999, pointerEvents: 'none',
            boxShadow: 'inset 0px 1px 2px 0px rgba(255,255,255,0.16)',
          }}/>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * MAIN EXPORT
 * ═══════════════════════════════════════════════════════════ */
export default function TransactionSummary({
  sell, receive, sellAmt, receiveAmt,
  onClose, onConfirm,
}: {
  sell:       { code: string; symbol: string }
  receive:    { code: string; symbol: string }
  sellAmt:    number
  receiveAmt: number
  onClose:    () => void
  onConfirm:  () => void
}) {
  const reduced = useReducedMotion()
  const rate    = (receiveAmt / sellAmt).toFixed(2)

  const rows = [
    { icon: <IconWallet />,   label: 'Amount',    value: `${sell.symbol}${sellAmt.toLocaleString('en-US')}`,    delay: 0.32 },
    { icon: <IconCoin />,     label: 'Price',     value: `${sell.symbol}1 - ${receive.symbol}${rate}`,          delay: 0.37 },
    { icon: <IconCoin />,     label: 'Exchanged', value: `${receive.symbol}${receiveAmt.toLocaleString('en-US', { maximumFractionDigits: 2 })}`, delay: 0.42 },
    { icon: <IconHandCoin />, label: 'Fees',      value: `${sell.symbol}0`,                                     delay: 0.47 },
  ]

  return (
    <>
      {/* ── Header ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 60,
          borderBottom: `1px solid ${T.stroke}`,
          flexShrink: 0,
        }}
      >
        <span style={{ ...inter, fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.176px', color: T.sub }}>
          Transaction summary
        </span>
        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.85 }} transition={SPRING_PRESS}
          aria-label="Close"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, borderRadius: 6, outline: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <IconClose />
        </motion.button>
      </motion.div>

      {/* ── Body ──────────────────────────────────────────── */}
      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>

        {/* 3D icon + labels */}
        <motion.div
          initial={{ opacity: 0, scale: reduced ? 1 : 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={reduced ? { duration: 0.12 } : { ...SPRING_ICON, delay: 0.06 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
        >
          <img
            src={exchange3d}
            alt="Exchange"
            style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: -8 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: -8 }}>
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0.1 } : { ...SPRING_ENTRY, delay: 0.14 }}
              style={{ ...inter, fontWeight: 400, fontSize: 13, lineHeight: '20px', letterSpacing: '-0.078px', color: T.sub, margin: 0 }}
            >
              Exchange
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: reduced ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? { duration: 0.1 } : { ...SPRING_ENTRY, delay: 0.18 }}
              style={{ ...inter, fontWeight: 600, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.096px', color: T.strong, margin: 0 }}
            >
              {sell.code} - {receive.code}
            </motion.p>
          </div>
        </motion.div>

        {/* Large amount */}
        <motion.p
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0.12 } : { ...SPRING_ENTRY, delay: 0.22 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600, fontSize: 32,
            lineHeight: '40px', letterSpacing: '-0.16px',
            fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0",
            color: T.strong,
            textAlign: 'center', margin: '16px 0 24px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span style={{ fontWeight: 400, color: T.sub }}>{receive.symbol}</span>
          {receiveAmt.toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </motion.p>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.3 }}
          style={{ height: 1, background: T.stroke, marginBottom: 16, flexShrink: 0 }}
        />

        {/* Detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.map(r => (
            <DetailRow key={r.label} icon={r.icon} label={r.label} value={r.value} delay={r.delay} />
          ))}
        </div>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.5 }}
          style={{ height: 1, background: T.stroke, margin: '16px 0', flexShrink: 0 }}
        />
      </div>

      {/* ── Footer — Slide To Swap ─────────────────────────── */}
      <div style={{ padding: '0 16px 20px', flexShrink: 0 }}>
        <SlideToSwap onConfirm={onConfirm} />
      </div>
    </>
  )
}
