const STORAGE_KEY = 'wikidata_labels'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

interface CachedLabel {
  label: string
  description: string | null
  cachedAt: number
}

interface LabelCache {
  [qid: string]: CachedLabel
}

/**
 * Get cached labels from localStorage
 */
function getCache(): LabelCache {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

/**
 * Save cache to localStorage
 */
function setCache(cache: LabelCache): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (e) {
    console.warn('Failed to cache Wikidata labels:', e)
  }
}

/**
 * Get labels from cache, filtering out expired entries
 */
export function getCachedLabels(qids: string[]): Record<string, CachedLabel> {
  const cache = getCache()
  const now = Date.now()
  const result: Record<string, CachedLabel> = {}

  for (const qid of qids) {
    const cached = cache[qid]
    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      result[qid] = cached
    }
  }

  return result
}

/**
 * Save labels to cache
 */
export function cacheLabels(
  labels: Record<string, { label: string; description: string | null }>
): void {
  const cache = getCache()
  const now = Date.now()

  for (const [qid, data] of Object.entries(labels)) {
    cache[qid] = {
      label: data.label,
      description: data.description,
      cachedAt: now,
    }
  }

  setCache(cache)
}

/**
 * Fetch labels from Wikidata API
 */
export async function fetchWikidataLabels(
  qids: string[],
  language = 'en'
): Promise<Record<string, { label: string; description: string | null }>> {
  if (qids.length === 0) return {}

  // Check cache first
  const cached = getCachedLabels(qids)
  const cachedQids = new Set(Object.keys(cached))
  const uncachedQids = qids.filter((qid) => !cachedQids.has(qid))

  // All cached
  if (uncachedQids.length === 0) {
    return Object.fromEntries(
      Object.entries(cached).map(([qid, data]) => [
        qid,
        { label: data.label, description: data.description },
      ])
    )
  }

  // Fetch uncached labels from Wikidata API
  // Split into batches of 50 (API limit)
  const batches: string[][] = []
  for (let i = 0; i < uncachedQids.length; i += 50) {
    batches.push(uncachedQids.slice(i, i + 50))
  }

  const fetchedLabels: Record<string, { label: string; description: string | null }> =
    {}

  for (const batch of batches) {
    const ids = batch.join('|')
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids}&props=labels|descriptions&languages=${language}&format=json&origin=*`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.entities) {
        for (const [qid, entity] of Object.entries(data.entities)) {
          const entityData = entity as {
            labels?: Record<string, { value: string }>
            descriptions?: Record<string, { value: string }>
          }
          fetchedLabels[qid] = {
            label: entityData.labels?.[language]?.value ?? qid,
            description: entityData.descriptions?.[language]?.value ?? null,
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch Wikidata labels:', e)
    }
  }

  // Cache the fetched labels
  cacheLabels(fetchedLabels)

  // Merge cached and fetched
  return {
    ...Object.fromEntries(
      Object.entries(cached).map(([qid, data]) => [
        qid,
        { label: data.label, description: data.description },
      ])
    ),
    ...fetchedLabels,
  }
}
