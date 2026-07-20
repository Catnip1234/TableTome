// Homebrew races/classes/backgrounds are stored locally per-device and
// merged into the option lists the builder shows, tagged as "Homebrew".

const KEY = (type) => `tabletome-homebrew:${type}`

export function listHomebrew(type) {
  const raw = localStorage.getItem(KEY(type))
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveHomebrew(type, entry) {
  const all = listHomebrew(type)
  const id = entry.id || `homebrew_${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
  const withId = { ...entry, id }
  const next = all.some((e) => e.id === id)
    ? all.map((e) => (e.id === id ? withId : e))
    : [...all, withId]
  localStorage.setItem(KEY(type), JSON.stringify(next))
  return withId
}

export function deleteHomebrew(type, id) {
  const all = listHomebrew(type).filter((e) => e.id !== id)
  localStorage.setItem(KEY(type), JSON.stringify(all))
}

// Normalizes a homebrew entry into the same shape used for Open5e options,
// so both can flow through the same list/detail UI.
export function normalizeHomebrew(entry, type) {
  return {
    key: `homebrew:${entry.id}`,
    slug: entry.id,
    name: entry.name,
    source: 'Homebrew',
    sourceSlug: 'homebrew',
    isOfficial: false,
    isHomebrew: true,
    desc: entry.desc || '',
    type,
    raw: entry,
  }
}
