// Decorative frame for an ability score: rounded rectangle border with
// diamond finials top/bottom and small flourish curls, in brass line-art.

export default function AbilityFrame({ score, modifier, size = 92 }) {
  const w = 128
  const h = 96
  const displayW = size * (w / h)

  return (
    <div style={{ position: 'relative', width: displayW, height: size, margin: '0 auto' }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <g stroke="var(--brass)" strokeWidth="2.25" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="16" width={w - 8} height={h - 32} rx="10" />

          {/* top diamond finial */}
          <path d={`M${w / 2},1 L${w / 2 + 9},11 L${w / 2},21 L${w / 2 - 9},11 Z`} fill="var(--ink-raised)" />
          {/* bottom diamond finial */}
          <path d={`M${w / 2},${h - 21} L${w / 2 + 9},${h - 11} L${w / 2},${h - 1} L${w / 2 - 9},${h - 11} Z`} fill="var(--ink-raised)" />

          {/* top flourishes */}
          <path d="M14,16 C24,9 30,22 41,16" />
          <circle cx="12" cy="16.5" r="2" fill="var(--brass)" stroke="none" />
          <path d={`M${w - 14},16 C${w - 24},9 ${w - 30},22 ${w - 41},16`} />
          <circle cx={w - 12} cy="16.5" r="2" fill="var(--brass)" stroke="none" />

          {/* bottom flourishes */}
          <path d={`M14,${h - 16} C24,${h - 9} 30,${h - 22} 41,${h - 16}`} />
          <circle cx="12" cy={h - 16.5} r="2" fill="var(--brass)" stroke="none" />
          <path d={`M${w - 14},${h - 16} C${w - 24},${h - 9} ${w - 30},${h - 22} ${w - 41},${h - 16}`} />
          <circle cx={w - 12} cy={h - 16.5} r="2" fill="var(--brass)" stroke="none" />
        </g>
      </svg>
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.34, fontWeight: 900, color: 'var(--parchment)', lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.15, color: 'var(--brass-bright)', marginTop: size * 0.03 }}>
          {modifier}
        </span>
      </div>
    </div>
  )
        }
