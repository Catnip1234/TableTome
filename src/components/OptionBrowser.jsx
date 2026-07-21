import { useMemo, useState } from 'react'
import { saveHomebrew, listHomebrew, normalizeHomebrew } from '../storage/homebrewStorage.js'

// options: array of normalized entries (see dnd5eApi normalizeOpen5eEntry / homebrewStorage normalizeHomebrew)
// selectedKey: currently chosen option's key
// onSelect(option): commit a pick
// homebrewType: 'race' | 'class' | 'background' — enables the "+ Add Homebrew" form
// homebrewFields: array of {name, label, placeholder} extra text fields collected for homebrew, beyond name/desc
export default function OptionBrowser({ options, selectedKey, onSelect, homebrewType, homebrewFields = [], onHomebrewAdded, loading }) {
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [previewKey, setPreviewKey] = useState(selectedKey || null)
  const [showHomebrewForm, setShowHomebrewForm] = useState(false)
  const [homebrewDraft, setHomebrewDraft] = useState({ name: '', desc: '' })

  const sources = useMemo(() => {
    const set = new Map()
    options.forEach((o) => set.set(o.sourceSlug, o.source))
    return Array.from(set.entries())
  }, [options])

  const filtered = useMemo(() => {
    return options.filter((o) => {
      if (sourceFilter === 'homebrew' && !o.isHomebrew) return false
      if (sourceFilter === 'official' && !o.isOfficial) return false
      if (sourceFilter !== 'all' && sourceFilter !== 'homebrew' && sourceFilter !== 'official' && o.sourceSlug !== sourceFilter) return false
      if (query && !o.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [options, sourceFilter, query])

  const previewed = options.find((o) => o.key === previewKey) || null

  function submitHomebrew() {
    if (!homebrewDraft.name.trim()) return
    const saved = saveHomebrew(homebrewType, homebrewDraft)
    const normalized = normalizeHomebrew(saved, homebrewType)
    setHomebrewDraft({ name: '', desc: '' })
    setShowHomebrewForm(false)
    onHomebrewAdded?.(normalized)
    setPreviewKey(normalized.key)
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, minWidth: 140 }}
          />
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="all">All sources</option>
            <option value="official">Official SRD</option>
            <option value="homebrew">My Homebrew</option>
            {sources.filter(([slug]) => slug !== 'wotc-srd' && slug !== 'srd' && slug !== 'homebrew').map(([slug, title]) => (
              <option key={slug} value={slug}>{title}</option>
            ))}
          </select>
        </div>

        {loading && <p style={{ color: 'var(--parchment-dim)' }}>Loading options…</p>}

        <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {filtered.map((o) => (
            <button
              key={o.key}
              onClick={() => setPreviewKey(o.key)}
              className="btn"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                textAlign: 'left',
                borderColor: previewKey === o.key ? 'var(--brass)' : undefined,
                background: selectedKey === o.key ? 'var(--ink-raised-2)' : undefined,
              }}
            >
              <span style={{ color: 'var(--parchment)' }}>
                {o.name} {selectedKey === o.key && <span style={{ color: 'var(--brass-bright)' }}>✓</span>}
              </span>
              <span className={`pill ${o.isHomebrew ? 'on' : ''}`} style={{ fontSize: '0.68rem' }}>{o.source}</span>
            </button>
          ))}
          {!loading && filtered.length === 0 && (
            <p style={{ color: 'var(--parchment-dim)' }}>No matches. Try a different search or source filter.</p>
          )}
        </div>

        {homebrewType && (
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--rule)', paddingTop: '1rem' }}>
            {!showHomebrewForm ? (
              <button className="btn" onClick={() => setShowHomebrewForm(true)}>+ Add Homebrew {labelFor(homebrewType)}</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  placeholder={`${labelFor(homebrewType)} name`}
                  value={homebrewDraft.name}
                  onChange={(e) => setHomebrewDraft((d) => ({ ...d, name: e.target.value }))}
                />
                <textarea
                  placeholder="Description / traits / features…"
                  rows={4}
                  value={homebrewDraft.desc}
                  onChange={(e) => setHomebrewDraft((d) => ({ ...d, desc: e.target.value }))}
                />
                {homebrewFields.map((f) => (
                  <input
                    key={f.name}
                    placeholder={f.placeholder}
                    value={homebrewDraft[f.name] || ''}
                    onChange={(e) => setHomebrewDraft((d) => ({ ...d, [f.name]: e.target.value }))}
                  />
                ))}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary" onClick={submitHomebrew}>Save Homebrew</button>
                  <button className="btn btn-ghost" onClick={() => setShowHomebrewForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card" style={{ minHeight: 200 }}>
        <span className="eyebrow">Details</span>
        {!previewed && <p style={{ color: 'var(--parchment-dim)' }}>Select an option on the left to read its full details before choosing.</p>}
        {previewed && (
          <>
            <h3 style={{ marginBottom: '0.15rem' }}>{previewed.name}</h3>
            <p style={{ color: 'var(--parchment-dim)', fontSize: '0.8rem', marginTop: 0 }}>{previewed.source}</p>
            <div style={{ maxHeight: 320, overflowY: 'auto', color: 'var(--parchment)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {previewed.desc || 'No description available for this entry.'}
            </div>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => onSelect(previewed)}>
              Choose {previewed.name}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function labelFor(type) {
  return { race: 'Race', class: 'Class', background: 'Background' }[type] || type
}

export function mergeHomebrewIntoOptions(apiOptions, type) {
  const homebrew = listHomebrew(type).map((h) => normalizeHomebrew(h, type))
  return [...homebrew, ...apiOptions]
        }
