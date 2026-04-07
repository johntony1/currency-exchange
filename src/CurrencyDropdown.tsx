import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Flag } from './flags'

/* ─────────────────────────────────────────────────────────────
 * DROPDOWN ANIMATION STORYBOARD
 *
 * Trigger: currency selector button click
 *
 *  OPEN
 *    0ms   container: opacity(0) scale(0.92) → opacity(1) scale(1)
 *          transform-origin: top right (anchors to selector)
 *          spring: stiffness 380, damping 26
 *    0ms   item[0]: y(8→0) opacity(0→1)
 *   30ms   item[1]: y(8→0) opacity(0→1)            stagger 30ms
 *   60ms   item[2]: …
 *   90ms   item[3]: …
 *
 *  HOVER
 *    bg: transparent → #f7f7f7  80ms ease-out  (hover-capable only)
 *
 *  SELECT / CLOSE
 *    0ms   row: scale(0.97) spring feedback
 *   60ms   container: opacity(1) scale(1) → opacity(0) scale(0.94)
 *          spring: stiffness 500, damping 38  (snappier exit)
 * ───────────────────────────────────────────────────────────── */

const TIMING = {
  itemStagger:  30,   // ms between each row staggering in
  itemDelay:     0,   // ms before first item starts
}

const SPRING_OPEN  = { type: 'spring', stiffness: 380, damping: 26 } as const
const SPRING_CLOSE = { type: 'spring', stiffness: 500, damping: 38 } as const
const SPRING_PRESS = { type: 'spring', stiffness: 700, damping: 42 } as const

/* ── Types ─────────────────────────────────────────────────── */
export type Currency = {
  code:    string
  symbol:  string
  name:    string
  balance: number
}

type Props = {
  currencies:     Currency[]
  selected:       Currency
  onSelect:       (c: Currency) => void
  onClose:        () => void
  /** Pixel position relative to the card's top-left */
  anchorTop:      number
  anchorRight:    number
}

/* ── Single row ────────────────────────────────────────────── */
function DropdownRow({
  currency,
  isSelected,
  index,
  onSelect,
  reduced,
}: {
  currency:   Currency
  isSelected: boolean
  index:      number
  onSelect:   () => void
  reduced:    boolean
}) {
  return (
    <motion.button
      layout
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: TIMING.itemDelay / 1000 + (index * TIMING.itemStagger) / 1000,
        type: 'spring', stiffness: 420, damping: 30,
      }}
      whileTap={{ scale: 0.97 }}
      onTap={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: 8,
        borderRadius: 8, border: 'none',
        background: isSelected ? '#f7f7f7' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        transition: 'background 80ms ease-out',
      }}
      onMouseEnter={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f7f7f7'
      }}
      onMouseLeave={e => {
        if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
      aria-pressed={isSelected}
      aria-label={`${currency.name}, balance ${currency.symbol}${currency.balance.toLocaleString('en-US')}`}
    >
      <Flag code={currency.code} size={32} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          fontSize: 12,
          lineHeight: '16px',
          letterSpacing: '-0.24px',
          fontFeatureSettings: "'calt' 0, 'liga' 0",
          color: '#171717',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {currency.name}
        </p>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: 11,
          lineHeight: '16px',
          letterSpacing: '-0.11px',
          fontFeatureSettings: "'calt' 0, 'liga' 0",
          color: '#a3a3a3',
          margin: 0,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          Bal:{currency.symbol}{currency.balance.toLocaleString('en-US')}
        </p>
      </div>
    </motion.button>
  )
}

/* ── Dropdown container ────────────────────────────────────── */
export default function CurrencyDropdown({
  currencies,
  selected,
  onSelect,
  onClose,
  anchorTop,
  anchorRight,
}: Props) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  /* ESC to close */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Invisible backdrop — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          zIndex: 40,
          cursor: 'default',
        }}
        aria-hidden
      />

      {/* Dropdown panel */}
      <motion.div
        ref={ref}
        role="listbox"
        aria-label="Select currency"
        initial={reduced ? false : { opacity: 0, scale: 0.92, y: -6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, scale: 0.94, y: -4 }}
        transition={SPRING_OPEN}
        style={{
          position: 'absolute',
          top: anchorTop,
          right: anchorRight,
          width: 280,
          zIndex: 50,
          background: '#ffffff',
          border: '0.5px solid #ebebeb',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          transformOrigin: 'top right',
          boxShadow: [
            '0px 8px 24px -4px rgba(0,0,0,0.10)',
            '0px 4px 8px -2px rgba(0,0,0,0.06)',
            '0px 0px 0px 0.5px rgba(0,0,0,0.05)',
          ].join(', '),
          willChange: 'transform, opacity',
        }}
      >
        {currencies.map((c, i) => (
          <DropdownRow
            key={c.code}
            currency={c}
            isSelected={c.code === selected.code}
            index={i}
            reduced={!!reduced}
            onSelect={() => {
              onSelect(c)
              onClose()
            }}

          />
        ))}
      </motion.div>
    </>
  )
}

/* ── Re-export spring configs so parent can use exit variant ─ */
export { SPRING_CLOSE, SPRING_PRESS }
