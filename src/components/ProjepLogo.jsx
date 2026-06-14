export function ProjepSymbol({ size = 32, color = '#CE7028' }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top triangle */}
      <path d="M 50,0 L 15,45 L 85,45 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom elongated triangle */}
      <path d="M 15,45 L 50,120 L 85,45 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Vertical center line */}
      <line x1="50" y1="0" x2="50" y2="120" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* Horizontal center line */}
      <line x1="15" y1="45" x2="85" y2="45" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export function ProjepLogoFull({ symbolSize = 36, symbolColor = '#CE7028', textColor = 'white' }) {
  const textStyle = {
    color: textColor,
    fontFamily: 'Inter, sans-serif',
    fontWeight: 800,
    letterSpacing: '0.12em',
    lineHeight: 1,
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <ProjepSymbol size={symbolSize} color={symbolColor} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ ...textStyle, fontSize: symbolSize * 0.38 }}>PRO</span>
        <span style={{ ...textStyle, fontSize: symbolSize * 0.38 }}>JEP</span>
      </div>
    </div>
  )
}
