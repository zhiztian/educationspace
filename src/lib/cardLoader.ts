import matter from 'gray-matter'
import MarkdownIt from 'markdown-it'
import type { Card, CardMeta } from '@/types'
import { Buffer } from 'buffer'

// gray-matter needs Buffer in browser
;(globalThis as any).Buffer = Buffer

const md = new MarkdownIt({ html: true, linkify: true, breaks: true })

// Vite glob import: load all card markdown files as raw text
const rawCards = import.meta.glob('/src/data/cards/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

let cachedCards: Card[] | null = null

export function loadAllCards(): Card[] {
  if (cachedCards) return cachedCards

  const cards: Card[] = []
  for (const [filePath, raw] of Object.entries(rawCards)) {
    try {
      const parsed = matter(raw)
      const meta = parsed.data as CardMeta
      const body = parsed.content
      const bodyHtml = md.render(body)
      cards.push({
        ...meta,
        body,
        bodyHtml,
        filePath,
      })
    } catch (e) {
      console.error(`Failed to parse card: ${filePath}`, e)
    }
  }

  // Sort by topic order, then topic_order within topic
  cachedCards = cards.sort((a, b) => {
    if (a.topic !== b.topic) return a.topic.localeCompare(b.topic)
    return (a.topic_order ?? 0) - (b.topic_order ?? 0)
  })

  return cachedCards
}

export function getCardById(id: string): Card | undefined {
  return loadAllCards().find(c => c.id === id)
}

export function getCardsByTopic(topicId: string): Card[] {
  return loadAllCards().filter(c => c.topic === topicId)
}

export function filterCards(opts: {
  topic?: string
  difficulty?: number[]
  searchText?: string
}): Card[] {
  let cards = loadAllCards()
  if (opts.topic) cards = cards.filter(c => c.topic === opts.topic)
  if (opts.difficulty && opts.difficulty.length > 0) {
    cards = cards.filter(c => opts.difficulty!.includes(c.difficulty))
  }
  if (opts.searchText) {
    const q = opts.searchText.toLowerCase()
    cards = cards.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q)) ||
      c.body.toLowerCase().includes(q)
    )
  }
  return cards
}
