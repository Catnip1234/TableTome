export default function SpellSlotTracker({ slots, onChange }) {
  function toggleSlot(levelIdx, boxIdx) {
    const next = slots.map((s, i) => {
      if (i !== levelIdx) return s
      const used = boxIdx < s.used ? boxIdx : boxIdx + 1
      return { ...s, used: Math.max(0, Math.min(s.max, used)) }
    })
    onChange(next)
  }

  function resetAll() {
    onChange(slots.map((s) => ({ ...s, used: 0 })))
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="card">
        <span className="eyebrow">Spell Slots</span>
        <p style={{ color: 'var(--parchment-dim)', margin: 0 }}>This character has no spell slots yet.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow" style={{ marginBottom: 0 }}>Spell Slots</span>
        <button className="btn" onClick={resetAll}>Long Rest (reset all)</button>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {slots.map((s, levelIdx) => (
          <div key={s.level} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '70px', fontFamily: 'var(--font-mono)', color: 'var(--parchment-dim)', fontSize: '0.85rem' }}>
              Level {s.level}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {Array.from({ length: s.max }).map((_, boxIdx) => (
                <button
                  key={boxIdx}
                  className={`slot-box ${boxIdx < s.used ? 'used' : ''}`}
                  onClick={() => toggleSlot(levelIdx, boxIdx)}
                  aria-label={`Slot level ${s.level} #${boxIdx + 1} ${boxIdx < s.used ? 'used' : 'available'}`}
                >
                  ✦
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
            }
