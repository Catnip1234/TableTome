// Core 5e SRD rules math shared across the builder and sheet.

export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

export const ABILITY_LABELS = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
}

export const SKILLS = [
  { name: 'Acrobatics', ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' },
  { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' },
  { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' },
  { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' },
  { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' },
  { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' },
  { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' },
  { name: 'Survival', ability: 'wis' },
]

export function abilityModifier(score) {
  return Math.floor((Number(score || 10) - 10) / 2)
}

export function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`
}

export function proficiencyBonus(level) {
  return Math.ceil(level / 4) + 1
}

// Standard array for quick ability-score assignment during the build flow.
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

// Full-caster spell slot table by character level (Wizard, Cleric, Druid,
// Bard, Sorcerer). Half/third casters and pact magic aren't in the SRD's
// simplified data, so we approximate with this table for full casters and
// leave slots editable by hand on the sheet either way.
const FULL_CASTER_SLOTS = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
}

export const FULL_CASTER_CLASSES = ['wizard', 'cleric', 'druid', 'bard', 'sorcerer']
export const HALF_CASTER_CLASSES = ['paladin', 'ranger']
export const PACT_CASTER_CLASSES = ['warlock']

export function defaultSlotsForClass(classIndex, level) {
  if (FULL_CASTER_CLASSES.includes(classIndex)) {
    const row = FULL_CASTER_SLOTS[Math.min(level, 20)] || []
    return row.map((max, i) => ({ level: i + 1, max, used: 0 }))
  }
  if (HALF_CASTER_CLASSES.includes(classIndex)) {
    const casterLevel = Math.floor(level / 2)
    const row = FULL_CASTER_SLOTS[M
