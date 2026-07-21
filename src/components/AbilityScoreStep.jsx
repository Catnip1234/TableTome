import { useState } from 'react'
import AbilityFrame from './AbilityFrame.jsx'
import {
  ABILITIES,
  ABILITY_LABELS,
  STANDARD_ARRAY,
  abilityModifier,
  formatModifier,
} from '../utils/dnd5eCalculations.js'

function rollDie(sides) {
  return 1 + Math.floor(Math.random() * sides)
}

// Classic 4d6-drop-lowest, six times.
function rollAbilityScores() {
  return Array.from({ length: 6 }, () => {
    const dice = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort((a, b) => b - a)
    return dice[0] + dice[1] + dice[2]
  })
}

export default function AbilityScoreStep({ raceBonuses, assignments, onAssignmentsChange }) {
  const [method, setMethod] = useState('standardArray')
  const [rolledPool, setRolledPool] = useState(null)

  const pool = method === 'roll' ? rolledPool : method === 'standardArray' ? STANDARD_ARRAY : null

  const remainingPoolValues = (() => {
    if (!pool) return []
    const used = Object.values(assignments)
    const copy = [...pool]
    used.forEach((v) => {
      const i = copy.indexOf(v)
      if (i >= 0) copy.splice(i, 1)
    })
    return copy
  })()

  function assignFromPool(ability, value) {
    onAssignmentsChange({ ...assignments, [ability]: value === '' ? undefined : Number(value) })
  }

  function assignManual(ability, value) {
    const n = value === '' ? undefined : Math.max(1, Math.min(30, Number(value) || 0))
    onAssignmentsChange({ ...assignments, [ability]: n })
  }

  function reroll() {
    setRolledPool(rollAbilityScores())
    onAssignmentsChange({})
  }

  function switchMethod(next) {
    setMethod(next)
    onAssignmentsChange({})
    if (next === 'roll' && !rolledPool) setRolledPool(rollAbilityScores())
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="btn" style={method === 'standardArray' ? { borderColor: 'var(--brass)', color: 'var(--brass-bright)' } : {}} onClick={() => switchMethod('standardArray')}>
          Standard Array
        </button>
        <button className="btn" style={method === 'roll' ? { borderColor: 'var(--brass)', color: 'var(--brass-bright)' } : {}} onClick={() => switchMethod('roll')}>
          Roll Dice
        </button>
        <button className="btn" style={method === 'manual' ? { borderColor: 'var(--brass)', color: 'var(--brass-bright)' } : {}} onClick={() => switchMethod('manual')}>
          Manual Entry
        </button>
      </div>

      {method === 'standardArray' && (
        <p style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem' }}>
          Assign the standard array (15, 14, 13, 12, 10, 8) to each ability.
        </p>
      )}
      {method === 'roll' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <p style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem', margin: 0 }}>
            Rolled with 4d6, drop the lowest die, six times: <span className="stat-figure" style={{ fontSize: '0.9rem' }}>{rolledPool?.join(', ')}</span>
          </p>
          <button className="btn" onClick={reroll}>🎲 Reroll All</button>
        </div>
      )}
      {method === 'manual' && (
        <p style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem' }}>
          Type in whatever base scores you like (1–30) — useful for pre-rolled or GM-assigned stats.
        </p>
      )}

      <div className="grid-6">
        {ABILITIES.map((ab) => {
          const base = assignments[ab]
          const bonus = raceBonuses?.[ab] || 0
          const total = (base || 10) + bonus
          return (
            <div key={ab} className="ability-block">
              {method === 'manual' ? (
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={base ?? ''}
                  onChange={(e) => assignManual(ab, e.target.value)}
                  style={{ width: '100%', textAlign: 'center' }}
                />
              ) : (
                <select value={base ?? ''} onChange={(e) => assignFromPool(ab, e.target.value)} style={{ width: '100%' }}>
                  <option value="">–</option>
                  {[base, ...remainingPoolValues].filter((v) => v !== undefined).map((v, i) => (
                    <option key={`${v}-${i}`} value={v}>{v}</option>
                  ))}
                </select>
              )}
              <div style={{ marginTop: '0.6rem' }}>
                <AbilityFrame score={total} modifier={formatModifier(abilityModifier(total))} size={80} />
              </div>
              <span className="ability-label">{ABILITY_LABELS[ab]}{bonus ? ` (+${bonus})` : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
                    }
