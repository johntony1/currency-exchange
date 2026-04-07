import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion, useAnimation } from 'framer-motion'
import { Flag } from './flags'
import CurrencyDropdown, { type Currency } from './CurrencyDropdown'
import TransactionSummary from './TransactionSummary'

/* ─────────────────────────────────────────────────────────────
 * SWAP CARD ANIMATION STORYBOARD
 *
 *  MOUNT
 *    0ms   card: opacity(0) y(12) scale(0.98) → opacity(1) y(0) scale(1)
 *          ease: [0.25, 0.46, 0.45, 0.94]  320ms
 *
 *  FLIP (↕ button)
 *    0ms   inner card: rotateX(0°→90°)    160ms ease-in  [tips forward]
 *    0ms   icon: rotate z 0°→180°         spring 480/36
 *  160ms   values swap at invisible midpoint
 *  160ms   inner card: set rotateX(-90°)  instant
 *  160ms   inner card: rotateX(-90°→0°)   spring dur:0.2 bounce:0.15 [lands]
 *  ~360ms  done — pure transform, GPU only
 *
 *  MAX (counting animation)
 *    0ms   numbers tick from current → balance  600ms ease-out-quart
 *          tabular-nums locks layout width — zero shift during count
 *         interrupts immediately if user starts typing
 *
 *  BUTTON PRESS
 *    0ms   scale(1→0.97) spring 700/42
 *
 *  DROPDOWN OPEN  → see CurrencyDropdown.tsx storyboard
 * ───────────────────────────────────────────────────────────── */

/* ── Counting animation ────────────────────────────────────── */
// ease-out-quart: rapid count start, decelerates onto target
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4) }

function useCountTo() {
  const rafRef = useRef<number>(0)

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
  }, [])

  const countTo = useCallback((
    from: number,
    to: number,
    duration: number,
    onTick: (v: number) => void,
    onDone: () => void,
  ) => {
    cancel()
    const startTime = performance.now()

    function step(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const value = from + (to - from) * easeOutQuart(progress)
      onTick(Math.round(value))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        onDone()
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [cancel])

  return { countTo, cancel }
}

/* ── Design tokens ─────────────────────────────────────────── */
const T = {
  textStrong: '#171717',
  textSub:    '#5c5c5c',
  textSoft:   '#a3a3a3',
  bgWeak:     '#f7f7f7',
  bgWhite:    '#ffffff',
  strokeSoft: '#ebebeb',
  bgStrong:   '#171717',
} as const

/* ── Animation presets ─────────────────────────────────────── */
const SWAP_SPRING   = { type: 'spring', stiffness: 480, damping: 36, mass: 0.8 } as const
const PRESS         = { type: 'spring', stiffness: 700, damping: 42 } as const
const FADE          = { duration: 0.12, ease: 'easeOut' } as const
const SPRING_LAYOUT = { type: 'spring', stiffness: 240, damping: 22 } as const

/* ── Shared typography base ────────────────────────────────── */
const inter = {
  fontFamily: "'Inter', -apple-system, sans-serif",
  fontFeatureSettings: "'ss11', 'calt' 0, 'liga' 0",
  WebkitFontSmoothing: 'antialiased',
} as const

/* ── Data ──────────────────────────────────────────────────── */
const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$',  name: 'United state Dollar',    balance: 15000 },
  { code: 'GBP', symbol: '£',  name: 'United kingdom pounds',  balance: 0     },
  { code: 'EUR', symbol: '€',  name: 'Euros',                  balance: 0     },
  { code: 'NGN', symbol: '₦',  name: 'Nigerian naira',         balance: 0     },
]

const RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.87,    GBP: 0.79,    NGN: 1618,   USD: 1 },
  EUR: { USD: 1.149,   GBP: 0.907,   NGN: 1859,   EUR: 1 },
  GBP: { USD: 1.267,   EUR: 1.102,   NGN: 2049,   GBP: 1 },
  NGN: { USD: 0.00062, EUR: 0.00054, GBP: 0.00049, NGN: 1 },
}

function fmt(n: number) {
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })
}

/* ── Inline icons ──────────────────────────────────────────── */
function IconClose() {
  return (
    <svg width="13" height="13" viewBox="0 0 12.7877 12.7877" fill="none">
      <path d="M5.41176 6.39385L0 0.98209L0.98209 0L6.39384 5.4117L11.8056 0L12.7877 0.98209L7.37592 6.39385L12.7877 11.8055L11.8056 12.7877L6.39384 7.37594L0.98209 12.7877L0 11.8055L5.41176 6.39385Z" fill="#5C5C5C"/>
    </svg>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={PRESS}
      width="14" height="14" viewBox="0 0 11.4552 7.0002" fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M10.748 1.27246L5.72754 6.29297L0.707031 1.27246L1.27246 0.707031L5.72754 5.16211L10.1826 0.707031L10.748 1.27246Z" fill="#A4A4A4"/>
    </motion.svg>
  )
}

function IconTransfer() {
  return (
    <svg width="14" height="15" viewBox="0 0 14.0592 14.8925" fill="none">
      <path d="M7.41667 11.1963L10.3629 14.1425L13.3092 11.1963M10.3629 4.11283L10.3629 14.1128M0.75 3.69628L3.69628 0.75L6.64256 3.69628M3.69628 0.7795L3.69628 10.7795" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Currency selector button ──────────────────────────────── */
function CurrencySelector({
  currency,
  isOpen,
  onClick,
  btnRef,
}: {
  currency: Currency
  isOpen:   boolean
  onClick:  () => void
  btnRef:   React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <motion.button
      ref={btnRef}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      transition={PRESS}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', padding: 0,
        cursor: 'pointer', WebkitTapHighlightColor: 'transparent', outline: 'none',
      }}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={`Select currency, currently ${currency.code}`}
    >
      <Flag code={currency.code} size={24} />
      <span style={{
        ...inter, fontWeight: 500, fontSize: 18,
        lineHeight: '24px', letterSpacing: '-0.2px', color: T.textStrong, whiteSpace: 'nowrap',
      }}>
        {currency.code}
      </span>
      <IconChevron open={isOpen} />
    </motion.button>
  )
}

/* ── Sell card ─────────────────────────────────────────────── */
function SellCard({
  currency, inputStr, onInputChange, isCounting,
  isDropdownOpen, onSelectorClick, selectorRef, onMax,
}: {
  currency:        Currency
  inputStr:        string
  onInputChange:   (v: string) => void
  isCounting:      boolean
  isDropdownOpen:  boolean
  onSelectorClick: () => void
  selectorRef:     React.RefObject<HTMLButtonElement | null>
  onMax:           () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Only allow digits and a single decimal point
    const raw = e.target.value.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1')
    onInputChange(raw)
  }

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Label — clicking it focuses the input */}
      <label
        htmlFor="sell-amount"
        style={{ ...inter, fontWeight: 400, fontSize: 12, lineHeight: '16px', color: T.textSoft, cursor: 'text' }}
      >
        You sell
      </label>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Symbol + editable amount */}
        <div
          style={{ display: 'flex', alignItems: 'baseline', gap: 1, flex: 1, minWidth: 0, cursor: 'text' }}
          onClick={() => inputRef.current?.focus()}
        >
          <span style={{
            ...inter, fontWeight: 400, fontSize: 24, lineHeight: 1,
            letterSpacing: '-0.36px', color: T.textSub,
            flexShrink: 0, userSelect: 'none',
          }}>
            {currency.symbol}
          </span>
          <input
            ref={inputRef}
            id="sell-amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            data-1p-ignore
            value={inputStr}
            onChange={handleChange}
            readOnly={isCounting}
            maxLength={12}
            placeholder="0"
            style={{
              ...inter,
              fontWeight: 600, fontSize: 24, lineHeight: 1,
              letterSpacing: '-0.36px', fontVariantNumeric: 'tabular-nums',
              color: T.textStrong,
              background: 'transparent', border: 'none', outline: 'none',
              padding: 0, margin: 0, width: '100%', minWidth: 0,
              cursor: 'text',
              // Remove browser number input chrome
              MozAppearance: 'textfield',
            } as React.CSSProperties}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', minWidth: 113, flexShrink: 0 }}>
          <CurrencySelector
            currency={currency} isOpen={isDropdownOpen}
            onClick={onSelectorClick} btnRef={selectorRef}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              ...inter, fontWeight: 500, fontSize: 14, lineHeight: '20px',
              letterSpacing: '-0.084px', fontVariantNumeric: 'tabular-nums',
              color: T.textSoft, whiteSpace: 'nowrap',
            }}>
              {currency.symbol}{currency.balance.toLocaleString('en-US')}
            </span>
            <motion.button
              whileTap={{ scale: 0.92 }} transition={PRESS}
              onClick={onMax}
              style={{
                ...inter, fontWeight: 500, fontSize: 12, lineHeight: '16px',
                color: T.textSoft, background: T.bgWeak,
                border: 'none', borderRadius: 999, padding: '4px 8px',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent', outline: 'none',
              }}
            >
              Max
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Receive card ──────────────────────────────────────────── */
function ReceiveCard({
  currency, amount, isDropdownOpen, onSelectorClick, selectorRef,
}: {
  currency:       Currency
  amount:         number
  isDropdownOpen: boolean
  onSelectorClick:() => void
  selectorRef:    React.RefObject<HTMLButtonElement | null>
}) {
  return (
    <div style={{
      background: T.bgWeak, borderRadius: '8px 8px 24px 24px',
      padding: 12, display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <p style={{ ...inter, fontWeight: 400, fontSize: 12, lineHeight: '16px', color: T.textSoft, margin: 0 }}>
        Recieve at least
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${currency.code}-${amount}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={FADE}
            style={{
              ...inter, fontWeight: 600, fontSize: 24, lineHeight: 1,
              letterSpacing: '-0.36px', fontVariantNumeric: 'tabular-nums',
              color: T.textStrong, margin: 0, whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: T.textSub, fontWeight: 400 }}>{currency.symbol}</span>
            {fmt(amount)}
          </motion.p>
        </AnimatePresence>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <CurrencySelector
            currency={currency} isOpen={isDropdownOpen}
            onClick={onSelectorClick} btnRef={selectorRef}
          />
          <span style={{
            ...inter, fontWeight: 500, fontSize: 14, lineHeight: '20px',
            letterSpacing: '-0.084px', fontVariantNumeric: 'tabular-nums',
            color: T.textSoft, whiteSpace: 'nowrap',
          }}>
            Bal : {currency.symbol}{currency.balance.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ═══════════════════════════════════════════════════════════ */
export default function CurrencySwap() {
  const reduced      = useReducedMotion()
  const flipControls = useAnimation()
  const cardRef    = useRef<HTMLDivElement>(null)
  const sellBtnRef = useRef<HTMLButtonElement>(null)
  const recvBtnRef = useRef<HTMLButtonElement>(null)

  const [sell,    setSell]    = useState(CURRENCIES[0])
  const [receive, setReceive] = useState(CURRENCIES[2]) // EUR

  // inputStr is the raw string in the sell input ("1200", "12.5", "")
  const [inputStr,   setInputStr]   = useState('1200')
  const [isCounting, setIsCounting] = useState(false)
  const { countTo, cancel: cancelCount } = useCountTo()

  const [openDropdown,   setOpenDropdown]   = useState<'sell' | 'receive' | null>(null)
  const [dropdownAnchor, setDropdownAnchor] = useState({ top: 0, right: 0 })
  const [swapping,    setSwapping]   = useState(false)
  const [iconAngle,   setIconAngle]  = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [view,       setView]       = useState<'swap' | 'summary'>('swap')

  const sellAmt    = parseFloat(inputStr) || 0
  const receiveAmt = +(sellAmt * RATES[sell.code][receive.code]).toFixed(3)

  /* ── Calculate dropdown anchor from clicked button's rect ── */
  function openFor(slot: 'sell' | 'receive') {
    if (openDropdown === slot) { setOpenDropdown(null); return }
    const btnRef = slot === 'sell' ? sellBtnRef : recvBtnRef
    const btn  = btnRef.current
    const card = cardRef.current
    if (!btn || !card) return

    const btnRect  = btn.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()

    const DROPDOWN_W = 280
    setDropdownAnchor({
      top:   btnRect.bottom - cardRect.top + 8,
      // centre dropdown within the card
      right: (cardRect.width - DROPDOWN_W) / 2,
    })
    setOpenDropdown(slot)
  }

  function handleMax() {
    const from = sellAmt
    const to   = sell.balance
    if (from === to) return
    // Skip counting animation if reduced motion or same value
    if (reduced) { setInputStr(String(to)); return }
    setIsCounting(true)
    // Duration scales with distance, capped 300–700ms
    const duration = Math.min(700, Math.max(300, Math.abs(to - from) / 20))
    countTo(from, to, duration,
      v  => setInputStr(String(v)),
      () => { setInputStr(String(to)); setIsCounting(false) },
    )
  }

  function handleInputChange(v: string) {
    cancelCount()
    setIsCounting(false)
    setInputStr(v)
  }

  async function handleSwap() {
    if (swapping || openDropdown) return
    cancelCount()
    setIsCounting(false)
    setSwapping(true)

    const next = receiveAmt % 1 === 0 ? String(Math.round(receiveAmt)) : String(receiveAmt)

    setIconAngle(a => a + 180)

    if (reduced) {
      // No animation — swap immediately
      setSell(receive); setReceive(sell); setInputStr(next)
      setSwapping(false)
      return
    }

    // Phase 1: tip card forward (0° → 90°) — ease-in so it accelerates into the flip
    await flipControls.start({
      rotateX: 90,
      transition: { duration: 0.16, ease: [0.55, 0, 1, 0.45] },
    })

    // Invisible midpoint — swap values
    setSell(receive)
    setReceive(sell)
    setInputStr(next)

    // Phase 2: snap to -90° then spring back to flat (slight bounce on landing)
    flipControls.set({ rotateX: -90 })
    await flipControls.start({
      rotateX: 0,
      transition: { type: 'spring', duration: 0.26, bounce: 0.18 },
    })

    setSwapping(false)
  }

  async function handleProceed() {
    if (submitting || !sellAmt) return
    setSubmitting(true)
    setOpenDropdown(null)
    await new Promise(r => setTimeout(r, 500))
    setSubmitting(false)
    setView('summary')
  }

  function handleBack() {
    setView('swap')
  }

  function handleConfirm() {
    // Slide-to-swap completed — reset and go back
    setTimeout(() => {
      setView('swap')
      setInputStr('0')
    }, 800)
  }

  /* Currencies available for the other slot (prevent same-same) */
  const sellOptions    = CURRENCIES.filter(c => c.code !== receive.code)
  const receiveOptions = CURRENCIES.filter(c => c.code !== sell.code)

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        layout: SPRING_LAYOUT,
        default: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      style={{
        position: 'relative',        /* anchor for dropdown */
        width: 400,
        background: T.bgWhite,
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {view === 'swap' ? (
          /* ══ SWAP VIEW ══════════════════════════════════════ */
          <motion.div
            key="swap"
            style={{ display: 'flex', flexDirection: 'column' }}
            exit={reduced ? { opacity: 0 } : {
              opacity: 0, scale: 0.97,
              transition: { duration: 0.14, ease: [0.4, 0, 1, 1] },
            }}
          >
            {/* ── Header ──────────────────────────────────── */}
            <div style={{
              height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px', borderBottom: `1px solid ${T.strokeSoft}`, opacity: 0.6,
            }}>
              <span style={{ ...inter, fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: '-0.176px', color: T.textSub }}>
                Currency exchange
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }} transition={PRESS} aria-label="Close"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: 4, borderRadius: 6, outline: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <IconClose />
              </motion.button>
            </div>

            {/* ── Swap card ───────────────────────────────── */}
            {/* perspective on wrapper so rotateX reads as 3-D depth */}
            <div style={{ padding: 16, perspective: 900, perspectiveOrigin: '50% 50%' }}>
              <motion.div
                animate={flipControls}
                style={{
                  position: 'relative',
                  borderRadius: 32,
                  background: T.bgWhite,
                  boxShadow: [
                    '0px 4px 8px -2px rgba(51,51,51,0.06)',
                    '0px 2px 4px 0px rgba(51,51,51,0.04)',
                    '0px 1px 2px 0px rgba(51,51,51,0.04)',
                    '0px 0px 0px 1px #f5f5f5',
                    'inset 0px -1px 1px -0.5px rgba(51,51,51,0.06)',
                  ].join(', '),
                  padding: 8,
                  display: 'flex', flexDirection: 'column',
                  transformOrigin: '50% 50%',
                  backfaceVisibility: 'hidden',
                  willChange: 'transform',
                }}
              >
                {/* You sell */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`sell-${sell.code}`}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={FADE}
                  >
                    <SellCard
                      currency={sell}
                      inputStr={inputStr}
                      onInputChange={handleInputChange}
                      isCounting={isCounting}
                      isDropdownOpen={openDropdown === 'sell'}
                      onSelectorClick={() => openFor('sell')}
                      selectorRef={sellBtnRef}
                      onMax={handleMax}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Swap button — outer div owns centering so Framer Motion's
                    rotate doesn't conflict with translateX(-50%)            */}
                <div style={{
                  position: 'absolute', top: 85, left: '50%',
                  transform: 'translateX(-50%)', zIndex: 10,
                }}>
                  <motion.button
                    onClick={handleSwap}
                    whileTap={{ scale: 0.86 }}
                    animate={reduced ? {} : { rotate: iconAngle }}
                    transition={SWAP_SPRING}
                    aria-label="Swap currencies"
                    style={{
                      width: 36, height: 36,
                      background: T.bgWeak, border: '2px solid white', borderRadius: 999,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', padding: 8,
                      WebkitTapHighlightColor: 'transparent', outline: 'none',
                    }}
                  >
                    <IconTransfer />
                  </motion.button>
                </div>

                {/* Receive at least */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={`receive-${receive.code}`}
                    layout={!reduced}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={FADE}
                  >
                    <ReceiveCard
                      currency={receive} amount={receiveAmt}
                      isDropdownOpen={openDropdown === 'receive'}
                      onSelectorClick={() => openFor('receive')}
                      selectorRef={recvBtnRef}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>

            {/* ── CTA ─────────────────────────────────────── */}
            <div style={{ borderTop: `1px solid ${T.strokeSoft}`, padding: 16, background: T.bgWhite, borderRadius: '0 0 20px 20px' }}>
              <motion.button
                onClick={handleProceed}
                whileTap={{ scale: 0.97 }} transition={PRESS}
                disabled={submitting}
                aria-label="Proceed to swap"
                style={{
                  width: '100%', height: 40, borderRadius: 24, border: 'none',
                  cursor: submitting ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  backgroundImage: [
                    'linear-gradient(180deg, rgba(255,255,255,0.153) 6.67%, rgba(255,255,255,0) 103.33%)',
                    `linear-gradient(90deg, ${T.bgStrong} 0%, ${T.bgStrong} 100%)`,
                  ].join(', '),
                  boxShadow: [
                    `0px 0px 0px 0.75px ${T.bgStrong}`,
                    '0px 16px 8px -8px rgba(51,51,51,0.01)',
                    '0px 12px 6px -6px rgba(51,51,51,0.02)',
                    '0px 5px 5px -2.5px rgba(51,51,51,0.08)',
                    '0px 1px 3px -1.5px rgba(51,51,51,0.16)',
                  ].join(', '),
                  WebkitTapHighlightColor: 'transparent', outline: 'none',
                  willChange: 'transform',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none',
                  boxShadow: 'inset 0px 1px 2px 0px rgba(255,255,255,0.16)',
                }} />
                <AnimatePresence mode="wait" initial={false}>
                  {submitting ? (
                    <motion.span key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={FADE}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <motion.span
                        animate={reduced ? {} : { rotate: 360 }}
                        transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
                        style={{
                          display: 'inline-block', width: 13, height: 13,
                          border: '1.5px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white', borderRadius: '50%',
                        }}
                      />
                      <span style={{ ...inter, fontWeight: 500, fontSize: 14, lineHeight: '20px', letterSpacing: '-0.084px', color: 'white' }}>
                        Processing…
                      </span>
                    </motion.span>
                  ) : (
                    <motion.span key="idle"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={FADE}
                      style={{
                        fontFamily: "'SF Pro Rounded', -apple-system, 'Inter', sans-serif",
                        fontWeight: 500, fontSize: 14, lineHeight: '20px',
                        letterSpacing: '-0.084px', color: 'white',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      Proceed to swap
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* ── Currency dropdown overlay ────────────────── */}
            <AnimatePresence mode="wait" custom={openDropdown} onExitComplete={() => {}}>
              {openDropdown && (
                <CurrencyDropdown
                  key={openDropdown}
                  currencies={openDropdown === 'sell' ? sellOptions : receiveOptions}
                  selected={openDropdown === 'sell' ? sell : receive}
                  onSelect={c => {
                    if (openDropdown === 'sell') setSell(c)
                    else setReceive(c)
                  }}
                  onClose={() => setOpenDropdown(null)}
                  anchorTop={dropdownAnchor.top}
                  anchorRight={dropdownAnchor.right}
                />
              )}
            </AnimatePresence>
          </motion.div>

        ) : (
          /* ══ SUMMARY VIEW ═══════════════════════════════════ */
          <motion.div
            key="summary"
            style={{ display: 'flex', flexDirection: 'column' }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <TransactionSummary
              sell={sell}
              receive={receive}
              sellAmt={sellAmt}
              receiveAmt={receiveAmt}
              onClose={handleBack}
              onConfirm={handleConfirm}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
