import { useState } from 'react'

export default function Inventory({ items, onChange }) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState(1)

  function addItem() {
    if (!name.trim()) return
    onChange([...items, { id: `item_${Date.now()}`, name: name.trim(), quantity: Number(qty) || 1, equipped: false, notes: '' }])
    setName('')
    setQty(1)
  }

  function updateItem(id, patch) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function removeItem(id) {
    onChange(items.filter((it) => it.id !== id))
  }

  return (
    <div className="card">
      <span className="eyebrow">Inventory ({items.length})</span>

      <div style={{ display: 'flex', gap: '0.5rem', margin: '0.75rem 0 1.25rem', flexWrap: 'wrap' }}>
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          style={{ flex: 1, minWidth: 180 }}
        />
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          style={{ width: 70 }}
        />
        <button className="btn btn-primary" onClick={addItem}>Add Item</button>
      </div>

      {items.length === 0 && <p style={{ color: 'var(--parchment-dim)' }}>Your pack is empty.</p>}

      <div className="ledger-grid">
        {items.map((it) => (
          <div className="ledger-row" key={it.id} style={{ gridTemplateColumns: 'auto 1fr auto auto auto' }}>
            <button
              className={`pill ${it.equipped ? 'on' : ''}`}
              onClick={() => updateItem(it.id, { equipped: !it.equipped })}
              title="Toggle equipped"
            >
              {it.equipped ? 'Equipped' : 'Stowed'}
            </button>
            <span style={{ color: 'var(--parchment)' }}>{it.name}</span>
            <input
              type="number"
              min={0}
              value={it.quantity}
              onChange={(e) => updateItem(it.id, { quantity: Math.max(0, Number(e.target.value) || 0) })}
              style={{ width: 55 }}
            />
            <span style={{ color: 'var(--parchment-dim)', fontSize: '0.78rem' }}>qty</span>
            <button className="btn-ghost" onClick={() => removeItem(it.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
        }
