import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as api from '../api/dnd5eApi.js'
import { loadCharacter, saveCharacter, blankCharacter } from '../storage/characterStorage.js'
import OptionBrowser, { mergeHomebrewIntoOptions } from '../components/OptionBrowser.jsx'
import AbilityScoreStep from '../components/AbilityScoreStep.jsx'
import AbilityFrame from '../components/AbilityFrame.jsx'
import {
  ABILITIES,
  ABILITY_LABELS,
  abilityModifier,
  formatModifier,
  defaultSlotsForClass,
  hitDieAverage,
} from '../utils/dnd5eCalculations.js'
import { resolveRaceMechanics, resolveClassMechanics, resolveBackgroundSkills } from '../utils/resolveMechanics.js'

const STEPS = ['Basics', 'Race', 'Class', 'Background', 'Ability Scores', 'Review']
const ALIGNMENTS = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil']

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function CharacterBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [character, setCharacter] = useState(null)
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)

  const [raceOptions, setRaceOptions] = useState([])
  const [classOptions, setClassOptions] = useState([])
  const [backgroundOptions, setBackgroundOptions] = useState([])
  const [loadingLists, setLoadingLists] = useState(true)
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    setCharacter(loadCharacter(id) || blankCharacter(id))
  }, [id])

  useEffect(() => {
    Promise.all([api.listRacesOpen5e(), api.listClassesOpen5e(), api.listBackgroundsOpen5e()])
      .then(([races, classes, backgrounds]) => {
        setRaceOptions(mergeHomebrewIntoOptions(races, 'race'))
        setClassOptions(mergeHomebrewIntoOptions(classes, 'class'))
        setBackgroundOptions(mergeHomebrewIntoOptions(backgrounds, 'background'))
      })
      .catch((e) => setError(`Couldn't load the content compendium (${e.message}). You can still fill things in by hand.`))
      .finally(() => setLoadingLists(false))
  }, [])

  function update(patch) {
    setCharacter((c) => ({ ...c, ...patch }))
  }

  function goTo(i) {
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)))
  }

  async function chooseRace(option) {
    setResolving(true)
    try {
      const mech = await resolveRaceMechanics(option)
      update({
        raceKey: option.key,
        raceSlug: slugify(option.name),
        raceName: option.name,
        raceSource: option.source,
        raceDesc: option.desc,
        raceAbilityBonuses: mech.abilityBonuses,
        raceSpeed: mech.speed,
        languages: mech.languages,
      })
      goTo(2)
    } finally {
      setResolving(false)
    }
  }

  async function chooseClass(option) {
    setResolving(true)
    try {
      const mech = await resolveClassMechanics(option)
      update({
        classKey: option.key,
        classSlug: slugify(option.name),
        className: option.name,
        classSource: option.source,
        classDesc: option.desc,
        classHitDie: mech.hitDie,
        classSavingThrows: mech.savingThrows,
        classSpellAbility: mech.spellcastingAbility,
      })
      goTo(3)
    } finally {
      setResolving(false)
    }
  }

  function chooseBackground(option) {
    const skills = resolveBackgroundSkills(option)
    update({
      backgroundKey: option.key,
      backgroundName: option.name,
      backgroundSource: option.source,
      backgroundDesc: option.desc,
      skillProficiencies: skills,
    })
    goTo(4)
  }

  const abilityScores = useMemo(() => {
    if (!character) return { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
    const bonuses = character.raceAbilityBonuses || {}
    const out = {}
    ABILITIES.forEach((ab) => {
      out[ab] = (character.abilityScoreAssignments?.[ab] || 10) + (bonuses[ab] || 0)
    })
    return out
  }, [character])

  function finishBuild() {
    if (!character.name || !character.raceName || !character.className) {
      setError('Give your character a name, race, and class before finishing.')
      goTo(0)
      return
    }
    const level = character.level || 1
    const hitDie = character.classHitDie || 8
    const conMod = abilityModifier(abilityScores.con)
    const maxHp = hitDie + conMod + (level - 1) * (hitDieAverage(hitDie) + conMod)
    const dexMod = abilityModifier(abilityScores.dex)
    const isCaster = !!character.classSpellAbility

    const finished = {
      ...character,
      level,
      abilityScores,
      savingThrowProficiencies: character.classSavingThrows || [],
      hp: { max: Math.max(1, maxHp), current: Math.max(1, maxHp), temp: 0 },
      hitDie,
      armorClass: 10 + dexMod,
      speed: character.raceSpeed || 30,
      spellcasting: isCaster
        ? {
            ability: character.classSpellAbility,
            slots: defaultSlotsForClass(character.classSlug, level),
            spellsKnown: character.spellcasting?.spellsKnown || [],
            spellsPrepared: character.spellcasting?.spellsPrepared || [],
          }
        : { ability: null, slots: [], spellsKnown: [], spellsPrepared: [] },
      isComplete: true,
    }
    saveCharacter(finished)
    navigate(`/sheet/${id}`)
  }

  function saveDraft() {
    saveCharacter(character)
    navigate('/')
  }

  if (!character) return <div className="page"><p>Loading…</p></div>

  return (
    <div className="page">
      <span className="eyebrow">TableTome Builder</span>
      <h1>{character.name || 'New Adventurer'}</h1>

      {error && (
        <div className="card" style={{ borderColor: 'var(--blood)', color: 'var(--blood-bright)', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <div className="tab-strip">
        {STEPS.map((s, i) => (
          <button key={s} className={`tab ${step === i ? 'active' : ''}`} onClick={() => goTo(i)}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="card">
          <h3>Basics</h3>
          <div className="grid-2">
            <label>
              Name
              <input style={{ width: '100%', marginTop: '0.35rem' }} value={character.name} onChange={(e) => update({ name: e.target.value })} placeholder="Sable Ashgrove" />
            </label>
            <label>
              Level
              <input type="number" min={1} max={20} style={{ width: '100%', marginTop: '0.35rem' }} value={character.level} onChange={(e) => update({ level: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })} />
            </label>
            <label>
              Alignment
              <select style={{ width: '100%', marginTop: '0.35rem' }} value={character.alignment} onChange={(e) => update({ alignment: e.target.value })}>
                <option value="">Choose…</option>
                {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => goTo(1)}>Next: Race →</button>
        </div>
      )}

      {step === 1 && (
        <div>
          {resolving && <p style={{ color: 'var(--parchment-dim)' }}>Loading race details…</p>}
          <OptionBrowser
            options={raceOptions}
            selectedKey={character.raceKey}
            onSelect={chooseRace}
            homebrewType="race"
            homebrewFields={[{ name: 'traits', label: 'Traits', placeholder: 'Ability bonuses, speed, special traits…' }]}
            onHomebrewAdded={(o) => setRaceOptions((prev) => [o, ...prev])}
            loading={loadingLists}
          />
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => goTo(0)}>← Back</button>
        </div>
      )}

      {step === 2 && (
        <div>
          {resolving && <p style={{ color: 'var(--parchment-dim)' }}>Loading class details…</p>}
          <OptionBrowser
            options={classOptions}
            selectedKey={character.classKey}
            onSelect={chooseClass}
            homebrewType="class"
            homebrewFields={[{ name: 'hit_dice', label: 'Hit Die', placeholder: 'e.g. d8' }, { name: 'prof_saving_throws', label: 'Saving Throws', placeholder: 'e.g. Strength, Constitution' }, { name: 'spellcasting_ability', label: 'Spellcasting Ability (optional)', placeholder: 'e.g. Wisdom' }]}
            onHomebrewAdded={(o) => setClassOptions((prev) => [o, ...prev])}
            loading={loadingLists}
          />
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => goTo(1)}>← Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <OptionBrowser
            options={backgroundOptions}
            selectedKey={character.backgroundKey}
            onSelect={chooseBackground}
            homebrewType="background"
            homebrewFields={[{ name: 'skills_text', label: 'Skills', placeholder: 'Skill Proficiencies: Insight, Religion' }]}
            onHomebrewAdded={(o) => setBackgroundOptions((prev) => [o, ...prev])}
            loading={loadingLists}
          />
          <button className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={() => goTo(2)}>← Back</button>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <AbilityScoreStep
            raceBonuses={character.raceAbilityBonuses}
            assignments={character.abilityScoreAssignments || {}}
            onAssignmentsChange={(a) => update({ abilityScoreAssignments: a })}
          />
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={() => goTo(3)}>← Back</button>
            <button className="btn btn-primary" onClick={() => goTo(5)}>Next: Review →</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <h3>Review</h3>
          <p style={{ color: 'var(--parchment-dim)' }}>
            {character.raceName || '—'} {character.className || '—'} · Level {character.level} · {character.alignment || 'No alignment set'}
          </p>
          <div className="grid-6" style={{ margin: '1rem 0' }}>
            {ABILITIES.map((ab) => (
              <div key={ab} className="ability-block">
                <AbilityFrame score={abilityScores[ab]} modifier={formatModifier(abilityModifier(abilityScores[ab]))} size={76} />
                <span className="ability-label">{ABILITY_LABELS[ab]}</span>
              </div>
            ))}
          </div>
          <p style={{ color: 'var(--parchment-dim)', fontSize: '0.9rem' }}>
            Background: {character.backgroundName || '—'} · Skills: {character.skillProficiencies?.join(', ') || 'none yet'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button className="btn btn-ghost" onClick={() => goTo(4)}>← Back</button>
            <button className="btn" onClick={saveDraft}>Save Draft &amp; Exit</button>
            <button className="btn btn-primary" onClick={finishBuild}>Finish &amp; Open Sheet</button>
          </div>
        </div>
      )}
    </div>
  )
    }
