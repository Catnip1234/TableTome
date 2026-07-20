// Open5e's v1 API mixes structured and free-text fields across publishers,
// so rather than trust one exact field name, these helpers pull mechanical
// info out of whatever text is available. Best-effort by design — anything
// that can't be parsed just falls back to a sane default and stays
// editable by hand in the builder/sheet.

import { ABILITY_LABELS } from './dnd5eCalculations.js'

const ABILITY_NAME_TO_CODE = Object.fromEntries(
  Object.entries(ABILITY_LABELS).map(([code, label]) => [label.toLowerCase(), code])
)

export function hitDieFromText(text, fallback = 8) {
  if (!text) return fallback
  const m = String(text).match(/d(4|6|8|10|12|20)\b/i)
  return m ? Number(m[1]) : fallback
}

export function abilityCodesFromText(text) {
  if (!text) return []
  const found = []
  for (const [name, code] of Object.entries(ABILITY_NAME_TO_CODE)) {
    if (new RegExp(`\\b${name}\\b`, 'i').test(text)) found.push(code)
  }
  return found
}

// Parses phrases like "+2 Dexterity", "Strength score increases by 2",
// or "Dexterity +1" out of race description/asi text and sums them by ability.
export function abilityBonusesFromText(text) {
  const bonuses = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }
  if (!text) return bonuses
  const patterns = [
    /([+-]\s?\d+)\s+(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)/gi,
    /(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\s+
