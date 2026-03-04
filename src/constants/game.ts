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

export type MondayItem = { id: string; name: string; text: string }

export const MOCK_MONDAY_ITEMS: MondayItem[] = [
  {
    id: '12345678',
    name: 'Refactorizar Componente de Login',
    text: 'Mejorar la seguridad del flujo de autenticación y añadir soporte para biometría.'
  },
  {
    id: '87654321',
    name: 'Integración API de Pagos',
    text: 'Conectar el checkout con el nuevo provider de Stripe para suscripciones recurrentes.'
  }
]
