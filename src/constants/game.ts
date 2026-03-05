export const FIBONACCI = ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'] as const

export const NAMES = [
  'Ana (Dev)',
  'Carlos (QA)',
  'Sonia (PO)',
  'Roberto (Dev)',
  'Elena (UX)',
  'Marc (Dev)',
  'Julia (Arch)',
  'Hugo (Dev)',
  'Lía (Dev)',
  'Pau (Scrum)'
] as const

export const COLORS = [
  '#f43f5e',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#6366f1',
  '#d946ef',
  '#f97316',
  '#84cc16',
  '#0ea5e9',
  '#8b5cf6'
] as const

export const BOT_PHRASES = [
  '¡Sistemas comprometidos! ⚡',
  'Error 404: Mi carta ha desaparecido.',
  '¿Quién es el dueño de los rayos?',
  'Calculando daños colaterales...',
  'Votando antes de la desintegración total.',
  '¡Ese rayo estuvo cerca! 😂',
  'Reiniciando protocolos de estimación...',
  '¡Modo Caos detectado!'
] as const

export type SystemTip = { id: string; name: string; text: string }

export const MOCK_SYSTEM_TIPS: SystemTip[] = [
  {
    id: 'TIP-001',
    name: 'Scrum Tip: Daily Standup',
    text: 'El Daily no es un reporte de estatus. Su objetivo es sincronizar al equipo y detectar bloqueos tempranamente. ¡Mantenlo breve!'
  },
  {
    id: 'TIP-002',
    name: 'Dev Tip: Code Reviews',
    text: 'Revisa el código pensando en la mantenibilidad. Deja comentarios constructivos y enfocate en la lógica, no en el estilo (para eso hay linters).'
  },
  {
    id: 'TIP-003',
    name: 'Scrum Tip: Retrospectivas',
    text: 'Las retrospectivas son el corazón de la mejora continua. Enfóquense en procesos ejecutables, no en buscar un culpable.'
  },
  {
    id: 'TIP-004',
    name: 'Dev Tip: Deuda Técnica',
    text: 'Documentar la deuda técnica es vital. Escribe comentarios claros con "TODO:" o crea tickets en el backlog para poder abordarla cuando haya tiempo.'
  }
]
