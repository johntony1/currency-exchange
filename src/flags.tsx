/**
 * Inline SVG flag components — exported from Figma, zero external deps.
 * Each component accepts a `size` prop (24 in selector, 32 in dropdown).
 */

type FlagProps = { size?: number }

export function FlagUSD({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* White circle base */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white"/>
      </svg>
      {/* Red stripes — inset 10.87% top, 1.72% left */}
      <div style={{ position: 'absolute', top: '10.87%', right: 0, bottom: 0, left: '1.72%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 23.5866 21.3913" fill="none">
          <path d="M11.0649 9.39131H23.5866C23.5866 8.30822 23.4422 7.25897 23.1732 6.26086H11.0649V9.39131Z" fill="#D80027"/>
          <path d="M11.0649 3.13045H21.8253C21.0907 1.93177 20.1515 0.87225 19.0564 0H11.0649V3.13045Z" fill="#D80027"/>
          <path d="M11.5866 21.3913C14.4108 21.3913 17.0066 20.4152 19.0564 18.7826H4.1168C6.16664 20.4152 8.76244 21.3913 11.5866 21.3913Z" fill="#D80027"/>
          <path d="M1.34789 15.6522H21.8253C22.4151 14.6899 22.8724 13.638 23.1732 12.5217H0C0.300797 13.638 0.758156 14.6899 1.34789 15.6522Z" fill="#D80027"/>
        </svg>
      </div>
      {/* Blue canton + stars — top-left quadrant */}
      <div style={{ position: 'absolute', top: 0, right: '50%', bottom: '50%', left: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 12 12" fill="none">
          <path d="M5.55862 1.87397H6.65217L5.63498 2.61295L6.02353 3.80869L5.00639 3.0697L3.98925 3.80869L4.32487 2.7757C3.42928 3.52172 2.64431 4.39575 1.99744 5.36963H2.34783L1.70034 5.84002C1.59947 6.0083 1.50272 6.17925 1.41 6.35273L1.71919 7.30434L1.14234 6.88523C0.998953 7.18903 0.867797 7.49967 0.749906 7.81678L1.09055 8.86528H2.34783L1.33064 9.60427L1.71919 10.8L0.702047 10.061L0.0927656 10.5037C0.0317812 10.9939 0 11.4932 0 12H12C12 5.37262 12 4.59131 12 0C9.62944 0 7.41961 0.687656 5.55862 1.87397Z" fill="#0052B4"/>
        </svg>
      </div>
    </div>
  )
}

export function FlagEUR({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      {/* Blue circle */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 24 24" fill="none">
        <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#0052B4"/>
      </svg>
      {/* Yellow stars — inset 19.57% */}
      <div style={{ position: 'absolute', inset: '19.57%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 14.6086 14.6087" fill="none">
          <path d="M7.30434 0L7.69289 1.19573H8.95008L7.93294 1.93472L8.32149 3.13045L7.30434 2.39142L6.28716 3.13045L6.6757 1.93472L5.65856 1.19573H6.9158L7.30434 0Z" fill="#FFDA44"/>
          <path d="M2.13933 2.13937L3.25964 2.71013L4.14862 1.82119L3.95189 3.06291L5.07216 3.6337L3.83039 3.83039L3.6337 5.0722L3.06291 3.95194L1.82119 4.14867L2.71017 3.25969L2.13933 2.13937Z" fill="#FFDA44"/>
          <path d="M0 7.30434L1.19573 6.9158V5.65856L1.93467 6.67575L3.13045 6.2872L2.39137 7.30434L3.13045 8.32148L1.93467 7.93299L1.19573 8.95012V7.69289L0 7.30434Z" fill="#FFDA44"/>
          <path d="M2.13933 12.4693L2.71012 11.349L1.82119 10.46L3.06295 10.6568L3.63366 9.53653L3.83039 10.7783L5.07211 10.975L3.95198 11.5458L4.14862 12.7875L3.25964 11.8985L2.13933 12.4693Z" fill="#FFDA44"/>
          <path d="M7.30434 14.6087L6.91575 13.413H5.65856L6.67575 12.674L6.28716 11.4783L7.30434 12.2173L8.32149 11.4783L7.93294 12.674L8.95008 13.413H7.69284L7.30434 14.6087Z" fill="#FFDA44"/>
          <path d="M12.4693 12.4693L11.349 11.8986L10.46 12.7875L10.6568 11.5457L9.53658 10.975L10.7783 10.7783L10.975 9.53653L11.5457 10.6568L12.7875 10.46L11.8985 11.3491L12.4693 12.4693Z" fill="#FFDA44"/>
          <path d="M14.6086 7.30434L13.4129 7.69289V8.95012L12.6739 7.93294L11.4783 8.32148L12.2173 7.30434L11.4783 6.2872L12.674 6.67575L13.4129 5.65856V6.91584L14.6086 7.30434Z" fill="#FFDA44"/>
          <path d="M12.4693 2.13937L11.8985 3.25969L12.7875 4.14867L11.5457 3.95189L10.975 5.07216L10.7783 3.83039L9.53658 3.63366L10.6568 3.06291L10.46 1.82123L11.3491 2.71017L12.4693 2.13937Z" fill="#FFDA44"/>
        </svg>
      </div>
    </div>
  )
}

export function FlagGBP({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      {/* Grey circle base */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="#F0F0F0"/>
      </svg>
      {/* Blue diagonal bands — inset 1.72% */}
      <div style={{ position: 'absolute', inset: '1.72%' }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 30.8976 30.8976" fill="none">
          <path d="M2.75631 5.70769C1.4995 7.34287 0.551813 9.22756 0 11.275H8.32362L2.75631 5.70769Z" fill="#0052B4"/>
          <path d="M30.8976 11.275C30.3458 9.22762 29.3981 7.34294 28.1413 5.70775L22.5741 11.275H30.8976Z" fill="#0052B4"/>
          <path d="M0 19.6228C0.551875 21.6702 1.49956 23.5549 2.75631 25.19L8.32344 19.6228H0Z" fill="#0052B4"/>
          <path d="M25.1899 2.75638C23.5548 1.49956 21.6701 0.551875 19.6227 0V8.32356L25.1899 2.75638Z" fill="#0052B4"/>
          <path d="M5.70769 28.1413C7.34288 29.3981 9.22756 30.3457 11.2749 30.8976V22.5741L5.70769 28.1413Z" fill="#0052B4"/>
          <path d="M11.2749 0C9.2275 0.551875 7.34281 1.49956 5.70769 2.75631L11.2749 8.3235V0Z" fill="#0052B4"/>
          <path d="M19.6227 30.8976C21.6701 30.3457 23.5548 29.3981 25.1899 28.1413L19.6227 22.5741V30.8976Z" fill="#0052B4"/>
          <path d="M22.5741 19.6228L28.1413 25.1901C29.3981 23.5549 30.3458 21.6702 30.8976 19.6228H22.5741Z" fill="#0052B4"/>
        </svg>
      </div>
      {/* Red cross — full overlay */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M31.8646 13.9131H18.087V0.135438C17.4038 0.0465 16.7073 0 16 0C15.2926 0 14.5962 0.0465 13.9131 0.135438V13.913H0.135438C0.0465 14.5962 0 15.2927 0 16C0 16.7074 0.0465 17.4038 0.135438 18.0869H13.913V31.8646C14.5962 31.9535 15.2926 32 16 32C16.7073 32 17.4038 31.9536 18.0869 31.8646V18.087H31.8646C31.9535 17.4038 32 16.7074 32 16C32 15.2927 31.9535 14.5962 31.8646 13.9131Z" fill="#D80027"/>
        <path d="M20.1739 20.174L27.3137 27.3137C27.6421 26.9855 27.9553 26.6423 28.2542 26.2866L22.1416 20.1739H20.1739V20.174Z" fill="#D80027"/>
        <path d="M11.8261 20.174H11.8259L4.68625 27.3137C5.0145 27.6421 5.35769 27.9553 5.71344 28.2542L11.8261 22.1414V20.174Z" fill="#D80027"/>
        <path d="M11.8261 11.8262V11.8261L4.68631 4.68625C4.35794 5.0145 4.04469 5.35769 3.74581 5.71344L9.8585 11.8261H11.8261V11.8262Z" fill="#D80027"/>
        <path d="M20.1739 11.8262L27.3137 4.68631C26.9855 4.35794 26.6423 4.04469 26.2866 3.74588L20.1739 9.85856V11.8262Z" fill="#D80027"/>
      </svg>
    </div>
  )
}

export function FlagNGN({ size = 24 }: FlagProps) {
  return (
    <div style={{ position: 'relative', width: size, height: size, overflow: 'hidden', flexShrink: 0 }}>
      {/* White circle base */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 32" fill="none">
        <path d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z" fill="white"/>
      </svg>
      {/* Green stripes left+right — inset 3.11% top/bottom, 0 left/right */}
      <div style={{ position: 'absolute', top: '3.11%', right: 0, bottom: '3.11%', left: 0 }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 32 30.0097" fill="none">
          <path d="M0 15.0047C0 21.8842 4.342 27.7489 10.4348 30.0096V0C4.342 2.26062 0 8.12537 0 15.0047Z" fill="#6DA544"/>
          <path d="M32 15.0048C32 8.12538 27.658 2.26062 21.5652 0V30.0097C27.658 27.7489 32 21.8843 32 15.0048Z" fill="#6DA544"/>
        </svg>
      </div>
    </div>
  )
}

export function Flag({ code, size = 24 }: { code: string; size?: number }) {
  if (code === 'USD') return <FlagUSD size={size} />
  if (code === 'EUR') return <FlagEUR size={size} />
  if (code === 'GBP') return <FlagGBP size={size} />
  if (code === 'NGN') return <FlagNGN size={size} />
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.6, lineHeight: 1, background: '#f0f0f0',
    }}>🏳️</div>
  )
}
