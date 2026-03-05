export type ThemeName = 'original' | 'cyberpunk' | 'matrix' | 'synthwave'

export interface ThemeConfig {
  id: ThemeName
  name: string
  background: string
  textPrimary: string
  textSecondary: string
  accent: string
  border: string
  cardIdle: string
  cardVoted: string
  cardBg: string
}

export const THEMES: Record<ThemeName, ThemeConfig> = {
  original: {
    id: 'original',
    name: 'Cyber Original',
    background: 'bg-[#020408]',
    textPrimary: 'text-white',
    textSecondary: 'text-sky-500',
    accent: 'text-rose-500',
    border: 'border-sky-500/30',
    cardIdle: 'bg-slate-900 border-white/5',
    cardVoted: 'bg-sky-600 border-white/60 shadow-sky-500/20',
    cardBg: 'bg-slate-900',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon City',
    background: 'bg-[#0f0c29]',
    textPrimary: 'text-yellow-400',
    textSecondary: 'text-pink-500',
    accent: 'text-cyan-400',
    border: 'border-pink-500/50',
    cardIdle: 'bg-[#24243e] border-pink-500/20',
    cardVoted: 'bg-pink-600 border-yellow-400 shadow-pink-500/40',
    cardBg: 'bg-[#302b63]',
  },
  matrix: {
    id: 'matrix',
    name: 'The Construct',
    background: 'bg-black',
    textPrimary: 'text-green-500',
    textSecondary: 'text-green-700',
    accent: 'text-white',
    border: 'border-green-500/40',
    cardIdle: 'bg-black border-green-900',
    cardVoted: 'bg-green-900 border-green-400 shadow-green-500/20',
    cardBg: 'bg-black',
  },
  synthwave: {
    id: 'synthwave',
    name: 'Outrun 1984',
    background: 'bg-[#2b1055]',
    textPrimary: 'text-cyan-400',
    textSecondary: 'text-fuchsia-500',
    accent: 'text-yellow-400',
    border: 'border-cyan-400/40',
    cardIdle: 'bg-[#1b0a33] border-cyan-900',
    cardVoted: 'bg-fuchsia-600 border-cyan-400 shadow-fuchsia-500/50',
    cardBg: 'bg-[#1b0a33]',
  }
}
