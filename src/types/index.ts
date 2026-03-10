export type FibonacciCard = string

export type Participant = {
  id: number
  name: string
  role?: string
  color: string
  vote: FibonacciCard | null
  hasVoted: boolean
  thinking: boolean
  isMe: boolean
}

export type ChatMessage = {
  id: number
  name: string
  text: string
  color: string
}

export type Strike = {
  id: number
  x: number
  y: number
}

export type Reaction = {
  id: number
  emoji: string
  x: number
}

export type Stats = {
  avg: string
  min: number
  max: number
}
