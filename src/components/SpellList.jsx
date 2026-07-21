import { useEffect, useState } from 'react'
import * as api from '../api/dnd5eApi.js'

export default function SpellList({ classIndex, spellsKnown, spellsPrepared, onChange }) {
  const [available, setAvailable] = useState([])
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [spellDetails, setSpellDetails] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classIndex) { setLoading(false); return }
    setLoading(true)
    api.getClassSpells(classIndex)
      .then((data) => {
        if (data.results && data.results.length > 0) {
          setAvailable(data.results)
        } else {
          return api.listSpells().then((all) => setAvailable(all.results || []))
        }
      })
      .catch(() => api.listSpells().then((all) => setAvailable(all.results || [])).catch(() => setAvailable([])))
      .finally(() => setLoading(false))
  }, [classIndex])

  function addSpell(spell) {
    if (spellsKnown.find((s) => s.index === spell.index)) return
    onChange({
      spellsKnown: [...spellsKnown, { index: spell.index, name: spell.name }],
      spellsPrepared,
    })
  }

  function removeSpell(index) {
    onChange({
      spellsKnown: spellsKnown.filter((s) => s.index !== index),
      spellsPrepared: spellsPrepared.filter((i) => i !== index),
    })
  }

  function togglePrepared(index) {
    const isPrepared = spellsPrepared.includes(index)
    onChange({
      spellsKnown,
      spellsPrepared: isPrepared ? spellsPrepared.filter((i) => i !== index) : [...spellsPrepared, index],
    })
  }

  async function toggleExpand(spell) {
    if (expanded === spell.index) { setExpanded(null); return }
    setExpanded(spell.index)
    if (!spellDetails[spell.index]) {
      try {
        const detail = await api.getSpell(spell.index)
        setSpellDetails((d) => ({ ...d, [spell.index]: detail }))
      } catch {
        // ignore fetch failure, just won't show details
      }
    }
  }

  const filtered = available.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="grid-2">
      <div className="card">
        <span className="eyebrow">Your Spells ({spellsKnown.length})</span>
        {spellsKnown.length === 0 && (
          <p style={{ color: 'var(--parchment-dim)' }}>No spells added yet. Pick some from the compendium →</p>
        )}
        <div className="ledger-grid" style={{ marginTop: '0.5rem' }}>
          {spellsKnown.map((s) => {
            const isPrepared = spellsPrepared.includes(s.index)
            return (
              <div className="ledger-row" key={s.index}>
                <button
                  onClick={() => togglePrepared(s.index)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', border: 'none', padding: 0, textAlign: 'left', color: 'var(--parchment)' }}
                >
                  <span className={`pill ${isPrepared ? 'on' : ''}`}>{isPrepared ? 'Prepared' : 'Known'}</span>
                  {s.name}
                </button>
                <button className="btn-ghost" onClick={() => removeSpell(s.index)}>✕</button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <span className="eyebrow">Compendium{classIndex ? ` — ${classIndex}` : ''}</span>
        <input
          placeholder="Search spells…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', marginBottom: '0.75rem' }}
        />
        {loading && <p style={{ color: 'var(--parchment-dim)' }}>Loading spell list…</p>}
        {!loading && !classIndex && <p style={{ color: 'var(--parchment-dim)' }}>No class set for this character.</p>}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {filtered.map((s) => (
            <div key={s.index} style={{ borderBottom: '1px solid var(--rule)', padding: '0.5rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => toggleExpand(s)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--parchment)', padding: 0, textAlign: 'left', cursor: 'pointer' }}
                >
                  {s.name}
                </button>
                <button className="btn" onClick={() => addSpell(s)}>Add</button>
              </div>
              {expanded === s.index && spellDetails[s.index] && (
                <p style={{ color: 'var(--parchment-dim)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                  Level {spellDetails[s.index].level} · {spellDetails[s.index].school?.name} · {spellDetails[s.index].range}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
        }
