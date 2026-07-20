// All character data lives in the browser's localStorage, keyed under a
// single index plus one entry per character. Nothing leaves the device.

const INDEX_KEY = 'dnd-characters:index'
const CHAR_KEY = (id) => `dnd-characters:char:${id}`

export function listCharacters() {
  const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]')
  return index
    .map((id) => loadCharacter(id))
    .filter(Boolean)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
}

export function loadCharacter(id) {
  const raw = localStorage.getItem(CHAR_KEY(id))
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveCharacter(character) {
  const now = Date.now()
  const toSave = { ...character, updatedAt: now, createdAt: character.createdAt || now }
  localStorage.setItem(CHAR_KEY(toSave.id), JSON.stringify(toSave))

  const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]')
  if (!index.includes(toSave.id)) {
    index.push(toSave.id)
    localStorage.setItem(INDEX_KEY, JSON.stringify(index))
  }
  return toSave
}

export function deleteCharacter(id) {
  localStorage.removeItem(CHAR_KEY(id))
  const index = JSON.parse(localStorage.getItem(INDEX_KEY) || '[]')
  localStorage.setItem(INDEX_KEY, JSON.stringify(index.filter((x) => x !== id)))
}

export function newCharacterId() {
  return `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function blankCharacter(id) {
  return {
    id,
    name: '',
    raceKey: '',
    raceSlug: '',
    raceName: '',
    raceSource: '',
    raceDesc: '',
    raceAbilityBonuses: {},
    raceSpeed: 30,
    classKey: '',
    classSlug: '',
    className: '',
    classSource: '',
    classDesc: '',
    classHitDie: 8,
    classSavingThrows: [],
    classSpellAbility: null,
    backgroundKey: '',
    backgroundName: '',
    backgroundSource: '',
    backgroundDesc: '',
    level: 1,
    alignment: '',
    abilityScoreAssignments: {},
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    skillProficiencies: [],
    savingThrowProficiencies: [],
    hp: { max: 10, current: 10, temp: 0 },
    hitDie: 8,
    armorClass: 10,
    speed: 30,
    spellcasting: { ability: null, slots: [], spellsKnown: [], spellsPrepared: [] },
    inventory: [],
    languages: [],
    proficiencies: [],
    notes: '',
    isComplete: false,
  }
}
