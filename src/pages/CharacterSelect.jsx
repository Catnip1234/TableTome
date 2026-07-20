import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listCharacters, deleteCharacter, saveCharacter, blankCharacter, newCharacterId } from '../storage/characterStorage.js'

export default function CharacterSelect() {
  const [characters, setCharacters] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setCharacters(listCharacters())
  }, [])

  function handleCreate() {
    const id = newCharacterId()
    saveCharacter(blankCharacter(id))
    navigate(`/build/${id}`)
  }

  function handleDelete(id, name) {
    if (!confirm(`Delete ${name || 'this character'}? This can't be undone.`)) return
    deleteCharacter(id)
    setCharacters(listCharacters())
  }

  return (
    <div className="page">
      <span className="eyebrow">TableTome</span>
      <h1>Your Characters</h1>
      <p style={{ color: 'var(--parchment-dim)', maxWidth: 560 }}>
        Everything here is saved to this browser only. Build a new adventurer or
        pick up where you left off.
      </p>

      <hr className="rule" />

      {characters.length === 0 ? (
        <div className="empty-state card">
          <h3>The ledger is empty</h3>
          <p>No characters yet on this device. Start your first one below.</p>
          <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: '1rem' }}>
            + New Character
          </button>
        </div>
      ) : (
        <>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {characters.map((c) => (
              <div key={c.id} className="card">
                <span className="eyebrow">
                  {c.isComplete ? 'Level ' + c.level : 'Draft'}
                </span>
                <h3 style={{ marginBottom: '0.15rem' }}>{c.name || 'Unnamed'}</h3>
                <p style={{ margin: 0, color: 'var(--parchment-dim)', fontSize: '0.9rem' }}>
                  {c.raceName || '—'} {c.className || ''}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(c.isComplete ? `/sheet/${c.id}` : `/build/${c.id}`)}
                  >
                    {c.isComplete ? 'Open Sheet' : 'Continue Build'}
                  </button>
                  {c.isComplete && (
                    <button className="btn" onClick={() => navigate(`/build/${c.id}`)}>
                      Edit
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={() => handleDelete(c.id, c.name)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>
            + New Character
          </button>
        </>
      )}
    </div>
  )
                                                                    }
