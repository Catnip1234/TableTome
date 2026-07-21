import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadCharacter, saveCharacter } from '../storage/characterStorage.js'
import {
  ABILITIES,
  ABILITY_LABELS,
  abilityModifier,
  formatModifier,
  proficiencyBonus as calcProficiencyBonus,
} from '../utils/dnd5eCalculations.js'
import HPTracker from '../components/HPTracker.jsx'
import AbilityFrame from '../components/AbilityFrame.jsx'
import SkillList from '../components/SkillList.jsx'
import SpellSlotTracker from '../components/SpellSlotTracker.jsx'
import SpellList from '../components/SpellList.jsx'
import Inventory from '../components/Inventory.jsx'

const TABS = ['Stats', 'Spells', 'Inventory', 'Notes']

export default function CharacterSheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [tab, setTab] = useState('Stats')

  useEffect(() => {
    const c = loadCharacter(id)
    if (!c) { navigate('/'); return }
    setCharacter(c)
  }, [id, navigate])

  function persist(patch) {
    setCharacter((c) => {
      const next = { ...c, ...patch }
      saveCharacter(next)
      return next
    })
  }

  if (!character) return <div className="page"><p>Loading…</p></div>

  const profBonus = calcProficiencyBonus(character.level)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="eyebrow">{character.raceName} {character.className} · Level {character.level}</span>
          <h1 style={{ marginBottom: 0 }}>{character.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn" onClick={() => navigate(`/build/${id}`)}>Edit Character</button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← All Characters</button>
        </div>
      </div>

      <hr className="rule" />

      <div className="tab-strip">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Stats' && (
        <div>
          <div className="grid-6" style={{ marginBottom: '1.5rem' }}>
            {ABILITIES.map((ab) => {
              const score = character.abilityScores[ab]
              return (
                <div key={ab} className="ability-block">
                  <AbilityFrame score={score} modifier={formatModifier(abilityModifier(score))} />
                  <span className="ability-label">{ABILITY_LABELS[ab]}</span>
                </div>
              )
            })}
          </div>

          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="card">
              <span className="eyebrow">Armor Class</span>
              <span className="stat-figure" style={{ fontSize: '2rem' }}>{character.armorClass}</span>
            </div>
            <div className="card">
              <span className="eyebrow">Speed</span>
              <span className="stat-figure" style={{ fontSize: '2rem' }}>{character.speed} ft</span>
            </div>
            <div className="card">
              <span className="eyebrow">Proficiency Bonus</span>
              <span className="stat-figure" style={{ fontSize: '2rem' }}>{formatModifier(profBonus)}</span>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
            <HPTracker hp={character.hp} onChange={(hp) => persist({ hp })} />
            <div className="card">
              <span className="eyebrow">Saving Throws</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {ABILITIES.map((ab) => {
                  const isProf = character.savingThrowProficiencies.includes(ab)
                  const mod = abilityModifier(character.abilityScores[ab]) + (isProf ? profBonus : 0)
                  return (
                    <div key={ab} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`pill ${isProf ? 'on' : ''}`} style={{ width: 16, height: 16, padding: 0, justifyContent: 'center' }}>
                          {isProf ? '●' : ''}
                        </span>
                        {ABILITY_LABELS[ab]}
                      </span>
                      <span className="stat-figure" style={{ fontSize: '1rem' }}>{formatModifier(mod)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <SkillList
            abilityScores={character.abilityScores}
            proficientSkills={character.skillProficiencies}
            proficiencyBonus={profBonus}
            onToggle={(skillName) => {
              const has = character.skillProficiencies.includes(skillName)
              persist({
                skillProficiencies: has
                  ? character.skillProficiencies.filter((s) => s !== skillName)
                  : [...character.skillProficiencies, skillName],
              })
            }}
          />
        </div>
      )}

      {tab === 'Spells' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <SpellSlotTracker
              slots={character.spellcasting.slots}
              onChange={(slots) => persist({ spellcasting: { ...character.spellcasting, slots } })}
            />
          </div>
          <SpellList
            classIndex={character.classSlug}
            spellsKnown={character.spellcasting.spellsKnown}
            spellsPrepared={character.spellcasting.spellsPrepared}
            onChange={({ spellsKnown, spellsPrepared }) =>
              persist({ spellcasting: { ...character.spellcasting, spellsKnown, spellsPrepared } })
            }
          />
        </div>
      )}

      {tab === 'Inventory' && (
        <Inventory items={character.inventory} onChange={(inventory) => persist({ inventory })} />
      )}

      {tab === 'Notes' && (
        <div className="card">
          <span className="eyebrow">Notes</span>
          <textarea
            value={character.notes}
            onChange={(e) => persist({ notes: e.target.value })}
            rows={14}
            style={{ width: '100%', marginTop: '0.5rem', resize: 'vertical' }}
            placeholder="Backstory, allies, quest hooks, that one NPC you keep forgetting the name of…"
          />
        </div>
      )}
    </div>
  )
}
