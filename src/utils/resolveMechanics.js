import * as api from '../api/dnd5eApi.js'
import { abilityBonusesFromText, hitDieFromText, abilityCodesFromText, speedFromText, skillsFromText } from './parse5e.js'

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// Tries the precise, structured dnd5eapi.co SRD data first (works for the
// 9 core races + subraces); falls back to parsing whatever text Open5e or
// a homebrew entry provided.
export async function resolveRaceMechanics(raceOption) {
  const slug = slugify(raceOption.name)
  try {
    const detail = await api.getRace(slug)
    return {
      abilityBonuses: Object.fromEntries(
        detail.ability_bonuses.map((b) => [b.ability_score.name.toLowerCase(), b.bonus])
      ),
      speed: detail.speed || 30,
      languages: detail.languages?.map((l) => l.name) || [],
      source: 'srd-structured',
    }
  } catch {
    const text = [raceOption.desc, raceOption.raw?.asi_desc, raceOption.raw?.traits].filter(Boolean).join('\n')
    return {
      abilityBonuses: abilityBonusesFromText(text),
      speed: speedFromText(text),
      languages: [],
      source: 'parsed',
    }
  }
}

export async function resolveClassMechanics(classOption) {
  const slug = slugify(classOption.name)
  try {
    const detail = await api.getClass(slug)
    return {
      hitDie: detail.hit_die || 8,
