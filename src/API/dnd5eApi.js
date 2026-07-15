// Thin client for the free D&D 5e SRD API (https://www.dnd5eapi.co).
// No API key needed. Responses are cached in localStorage since SRD
// content is static and this keeps the app fast and mostly-offline
// after first load.

const BASE_URL = 'https://www.dnd5eapi.co/api/2014'
const CACHE_PREFIX = 'dnd5e-cache:'

async function cachedGet(path) {
  const cacheKey = CACHE_PREFIX + path
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      // fall through to re-fetch on corrupt cache entry
    }
  }
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`5e API request failed (${res.status}): ${path}`)
  }
  const data = await res.json()
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch {
    // localStorage full or unavailable — non-fatal, just skip caching
  }
  return data
}

export const listRaces = () => cachedGet('/races')
export const getRace = (index) => cachedGet(`/races/${index}`)

export const listClasses = () => cachedGet('/classes')
export const getClass = (index) => cachedGet(`/classes/${index}`)
export const getClassLevel = (index, level) => cachedGet(`/classes/${index}/levels/${level}`)
export const getClassSpells = (index) => cachedGet(`/classes/${index}/spells`)

export const listSpells = () => cachedGet('/spells')
export const getSpell = (index) => cachedGet(`/spells/${index}`)

export const listEquipment = () => cachedGet('/equipment')
export const getEquipment = (index) => cachedGet(`/equipment/${index}`)
export const listEquipmentCategories = () => cachedGet('/equipment-categories')
export const getEquipmentCategory = (index) => cachedGet(`/equipment-categories/${index}`)

export const listAlignments = () => cachedGet('/alignments')
export const listLanguages = () => cachedGet('/languages')

// The SRD API doesn't expose a /backgrounds endpoint with full mechanical
// detail, so a small curated set of the classic SRD backgrounds ships
// locally. Users can still hand-edit skills/equipment on the sheet.
export const BACKGROUNDS = [
  {
    index: 'acolyte',
    name: 'Acolyte',
    skillProficiencies: ['Insight', 'Religion'],
    equipment: ['Holy symbol', 'Prayer book', 'Incense (5)', 'Vestments', "Common clothes", 'Belt pouch (15 gp)'],
    feature: 'Shelter of the Faithful',
  },
  {
    index: 'criminal',
    name: 'Criminal',
    skillProficiencies: ['Deception', 'Stealth'],
    equipment: ['Crowbar', 'Dark common clothes with hood', 'Belt pouch (15 gp)'],
    feature: 'Criminal Contact',
  },
  {
    index: 'folk-hero',
    name: 'Folk Hero',
    skillProficiencies: ['Animal Handling', 'Survival'],
    equipment: ["Set of artisan's tools", 'Shovel', 'Iron pot', 'Common clothes', 'Belt pouch (10 gp)'],
    feature: 'Rustic Hospitality',
  },
  {
    index: 'noble',
    name: 'Noble',
    skillProficiencies: ['History', 'Persuasion'],
    equipment: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', 'Purse (25 gp)'],
    feature: 'Position of Privilege',
  },
  {
    index: 'sage',
    name: 'Sage',
    skillProficiencies: ['Arcana', 'History'],
    equipment: ['Bottle of ink', 'Quill', 'Small knife', 'Letter from a dead colleague', 'Common clothes', 'Belt pouch (10 gp)'],
    feature: 'Researcher',
  },
  {
    index: 'soldier',
    name: 'Soldier',
    skillProficiencies: ['Athletics', 'Intimidation'],
    equipment: ['Insignia of rank', 'Trophy from a fallen enemy', 'Set of bone dice', 'Common clothes', 'Belt pouch (10 gp)'],
    feature: 'Military Rank',
  },
  {
    index: 'charlatan',
    name: 'Charlatan',
    skillProficiencies: ['Deception', 'Sleight of Hand'],
    equipment: ['Fine clothes', 'Disguise kit', 'Con tools', 'Belt pouch (15 gp)'],
    feature: 'False Identity',
  },
  {
    index: 'hermit',
    name: 'Hermit',
    skillProficiencies: ['Medicine', 'Religion'],
    equipment: ['Herbalism kit', 'Scroll case of notes', 'Winter blanket', 'Common clothes', '5 gp'],
    feature: 'Discovery',
  },
]

// ---------------------------------------------------------------------
// Open5e v1 API — a community-maintained aggregation of the SRD plus
// several third-party publishers' content released under open licenses
// (Kobold Press, Green Ronin, etc). Used to give the builder a much wider
// spread of race/class/background options than the SRD alone, each
// tagged with its source book so nothing reads as an unlabeled duplicate.
// v1 (rather than v2) is used deliberately: it predates the 2024 SRD
// revision, so it doesn't contain the "same race twice" duplication that
// v2 has between the 2014 and 2024 rule sets.
const OPEN5E_BASE = 'https://api.open5e.com/v1'

async function cachedGetAbsolute(url) {
  const cacheKey = CACHE_PREFIX + url
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {
      // fall through to re-fetch on corrupt cache entry
    }
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Open5e request failed (${res.status}): ${url}`)
  const data = await res.json()
  try {
    localStorage.setItem(cacheKey, JSON.stringify(data))
  } catch {
    // non-fatal
  }
  return data
}

// Follows pagination up to a sane cap so a single browse doesn't balloon
// into hundreds of requests.
async function fetchAllPages(firstUrl, maxPages = 8) {
  let url = firstUrl
  let page = 0
  const results = []
  while (url && page < maxPages) {
    const data = await cachedGetAbsolute(url)
    results.push(...(data.results || []))
    url = data.next
    page += 1
  }
  return results
}

function normalizeOpen5eEntry(raw, type) {
  const sourceSlug = raw.document__slug || raw.document?.slug || 'unknown'
  const sourceTitle = raw.document__title || raw.document?.title || sourceSlug
  return {
    key: `${sourceSlug}:${raw.slug || raw.name}`,
    slug: raw.slug || raw.name?.toLowerCase().replace(/\s+/g, '-'),
    name: raw.name,
    source: sourceTitle,
    sourceSlug,
    isOfficial: sourceSlug === 'wotc-srd' || sourceSlug === 'srd',
    isHomebrew: false,
    desc: raw.desc || raw.traits || '',
    type,
    raw,
  }
}

async function listOpen5e(resource, type) {
  const results = await fetchAllPages(`${OPEN5E_BASE}/${resource}/?limit=100`)
  const normalized = results.map((r) => normalizeOpen5eEntry(r, type))
  // De-dupe by natural key (source + slug) in case of any pagination overlap.
  const seen = new Set()
  return normalized.filter((r) => {
    if (seen.has(r.key)) return false
    seen.add(r.key)
    return true
  })
}

export const listRacesOpen5e = () => listOpen5e('races', 'race')
export const listClassesOpen5e = () => listOpen5e('classes', 'class')
export const listBackgroundsOpen5e = () => listOpen5e('backgrounds', 'background')
