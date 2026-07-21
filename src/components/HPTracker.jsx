import { useState } from 'react'

export default function HPTracker({ hp, onChange }) {
  const [amount, setAmount] = useState(1)
  const pct = Math.max(0, Math.min(100, (hp.current / hp.max) * 100))

  function applyDamage() {
    const dmg = Math.max(0, Number(amount) || 0)
    let temp = hp.temp
    let current = hp.current
    if (temp > 0) {
      const absorbed = Math.min(temp, dmg)
      temp -= absorbed
      current -= (dmg - absorbed)
    } else {
      current -= dmg
    }
    onChange({ ...hp, current: Math.max(0, current), temp })
  }

  function applyHeal() {
    const heal = Math.max(0, Number(amount) || 0)
    onChange({ ...hp, current: Math.min(hp.max, hp.current + heal) })
  }

  return (
    <div className="card">
      <span className="eyebrow">Hit Points</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <span className="stat-figure" style={{ fontSize: '2.1rem' }}>{hp.current}</span>
        <span style={{ color: 'var(--parchment-dim)' }}>/ {hp.max}</span>
        {hp.temp > 0 && <span className="pill on">+{hp.temp} temp</span>}
      </div>
      <div className="hp-bar-track" style={{ marginBottom: '0.9rem' }}>
        <div className="hp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: '70px' }}
        />
        <button className="btn btn-danger" onClick={applyDamage}>Damage</button>
        <button className="btn" onClick={applyHeal}>Heal</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--parchment-dim)' }}>
          Temp HP
          <input
            type="number"
            min={0}
            value={hp.temp}
            onChange={(e) => onChange({ ...hp, temp: Math.max(0, Number(e.target.value) || 0) })}
            style={{ width: '60px' }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--parchment-dim)' }}>
          Max HP
          <input
            type="number"
            min={1}
            value={hp.max}
            onChange={(e) => onChange({ ...hp, max: Math.max(1, Number(e.target.value) || 1) })}
            style={{ width: '60px' }}
          />
        </label>
      </div>
    </div>
  )
      }
