export interface QuizItem {
  q: string
  a: string
  explanation?: string
  difficulty: 1 | 2 | 3 | 4
}

export interface CardMeta {
  id: string
  title: string
  subject: string
  topic: string
  topic_order?: number
  grade_min: number
  grade_max: number
  difficulty: 1 | 2 | 3 | 4
  tags: string[]
  related?: string[]
  quiz?: QuizItem[]
}

export interface Card extends CardMeta {
  body: string  // markdown body (without frontmatter)
  bodyHtml: string  // rendered HTML
  filePath: string
}

export interface Topic {
  id: string
  name: string
  order: number
  description?: string
}
