import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { BOT_PHRASES, COLORS, FIBONACCI, MOCK_MONDAY_ITEMS, NAMES } from '@/constants/game'
import type { ChatMessage, Participant, Strike, Stats } from '@/types'
import { supabase } from '@/lib/supabase'

// Interfaz para el estado de presencia que enviaremos a Realtime
interface PresenceState {
  id: number | string
  name: string
  color: string
  vote: string | null
  hasVoted: boolean
  is_destroyed: boolean
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}

export function useCyberArena() {
  const participants = ref<Participant[]>([])
  const myVote = ref<string | null>(null)
  const isRevealed = ref(false)
  const sessionKey = ref(0)

  const chatMessages = ref<ChatMessage[]>([])
  const strikes = ref<Strike[]>([])
  const destroyedIds = ref<Set<number>>(new Set())
  const isShaking = ref(false)
  const showHologram = ref(true)

  const mondayItems = ref(MOCK_MONDAY_ITEMS)
  const currentIndex = ref(0)
  
  const currentRoomId = ref<string | null>(null)
  const myParticipantId = ref<string | null>(null)
  const myParticipantName = ref<string>('Cyber Master')
  const isMultiplayer = computed(() => !!supabase && !!currentRoomId.value)

  const timeouts: number[] = []
  
  // Supabase channels
  let roomChannel: any = null
  let participantsChannel: any = null

  function clearTimers() {
    while (timeouts.length) {
      const id = timeouts.pop()
      if (id != null) window.clearTimeout(id)
    }
  }

  function cleanupSupabase() {
    if (roomChannel) {
      supabase?.removeChannel(roomChannel)
      roomChannel = null
    }
  }

  function initMockSession() {
    clearTimers()

    const initial: Participant[] = NAMES.map((name, i) => ({
      id: i,
      name,
      color: COLORS[i] ?? '#ffffff',
      vote: null,
      hasVoted: false,
      thinking: true,
      isMe: false
    }))

    // ID improvisado para el mock local
    myParticipantId.value = '99'

    initial.push({
      id: 99,
      name: 'Tú (Cyber Master)',
      color: '#ffffff',
      vote: null,
      hasVoted: false,
      thinking: false,
      isMe: true
    })

    participants.value = initial
    destroyedIds.value = new Set()
    strikes.value = []
    chatMessages.value = []
    isRevealed.value = false
    myVote.value = null
    showHologram.value = true
    currentIndex.value = 0

    // Simula votos del equipo
    initial.forEach((p) => {
      if (p.isMe) return
      const delay = 1500 + Math.random() * 5000
      const t = window.setTimeout(() => {
        participants.value = participants.value.map((item) => {
          if (item.id !== p.id) return item
          const val = FIBONACCI[Math.floor(Math.random() * 8)]
          return { ...item, vote: val, hasVoted: true, thinking: false }
        })
      }, delay)
      timeouts.push(t)
    })
  }

  function syncPresence() {
    if (!roomChannel) return
    const state = roomChannel.presenceState()
    const activeParticipants: Participant[] = []
    
    // Iterar sobre todos los clientes conectados a Presence
    for (const [key, presences] of Object.entries(state)) {
      // Tomamos la presencia más reciente de ese clientId
      const p = (presences as any[])[0] as PresenceState
      activeParticipants.push({
        id: Number(p.id) || p.id as any,
        name: p.name,
        color: p.color,
        vote: p.vote,
        hasVoted: !!p.vote,
        thinking: !p.vote,
        isMe: String(p.id) === String(myParticipantId.value)
      })
      
      if (p.is_destroyed) {
        destroyedIds.value.add(Number(p.id) || p.id as any)
      }
    }
    
    // Asegurar que yo siempre estoy en mi lista de participantes (por demora de sync)
    // Pero lo ideal es confiar en events
    participants.value = activeParticipants
  }

  async function updateMyPresence(updates: Partial<PresenceState>) {
    if (!roomChannel || !myParticipantId.value) return
    
    const myCurrentP = participants.value.find(p => String(p.id) === String(myParticipantId.value))
    const newState: PresenceState = {
      id: myParticipantId.value,
      name: myCurrentP?.name || 'Cyber Master',
      color: myCurrentP?.color || '#ffffff',
      vote: myCurrentP?.vote || null,
      hasVoted: myCurrentP?.hasVoted || false,
      is_destroyed: destroyedIds.value.has(Number(myParticipantId.value) || myParticipantId.value as any),
      ...updates
    }
    await roomChannel.track(newState)
  }

  async function initSupabaseSession(roomId: string, participantId: string, participantName: string) {
    clearTimers()
    cleanupSupabase()
    
    currentRoomId.value = roomId
    myParticipantId.value = participantId
    myParticipantName.value = participantName
    
    destroyedIds.value = new Set()
    strikes.value = []
    chatMessages.value = []
    showHologram.value = true
    isRevealed.value = false
    currentIndex.value = 0
    
    roomChannel = supabase!.channel(`room:${roomId}`, {
      config: {
        presence: {
          key: participantId, // Clave única para mi sesión
        },
      },
    })
    
    // Escuchar sincronización de participantes
    roomChannel.on('presence', { event: 'sync' }, () => {
      syncPresence()
    })
    
    // Escuchar mensajes globales de estado de la sala (Ej: Revelar, Nuevo Ciclo, Cambio de Ticket)
    roomChannel.on('broadcast', { event: 'room_state' }, (payload: any) => {
      if (payload.payload.action === 'reveal') {
        isRevealed.value = true
      }
      if (payload.payload.action === 'new_cycle') {
        isRevealed.value = false
        myVote.value = null
        // Cuando hay nuevo ciclo, actualizo mi presencia para limpiar mi voto
        updateMyPresence({ vote: null, hasVoted: false })
      }
      if (payload.payload.action === 'change_issue') {
        currentIndex.value = payload.payload.index
      }
      if (payload.payload.action === 'lightning') {
        const targetId = payload.payload.targetId
        destroyedIds.value.add(targetId)
        // Disparar la animación visualmente en este cliente
        triggerLightningVisual(targetId, payload.payload.botMessage)
      }
    })
    
    roomChannel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // Me uno a Presence pasando el nombre que elegí en el Lobby
        await updateMyPresence({ vote: null, hasVoted: false, name: participantName })
      }
    })
  }

  function triggerLightningVisual(participantId: number, botMessage?: ChatMessage) {
    const element = document.getElementById(`participant-${participantId}`)
    if (!element) return

    const rect = element.getBoundingClientRect()
    const targetX = rect.left + rect.width / 2
    const targetY = rect.top + rect.height / 2

    addStrike(targetX, targetY)
    isShaking.value = true
    const tShake = window.setTimeout(() => (isShaking.value = false), 400)
    timeouts.push(tShake)

    if (botMessage) {
      chatMessages.value = [...chatMessages.value.slice(-4), botMessage]
    }
  }

  // Wrapper para mantener compatibilidad con el resto de App.vue
  function initSession() {
    if (isMultiplayer.value) {
      // Si ya hay roomId, recargamos (nuevo ciclo)
      if (currentRoomId.value && myParticipantId.value) {
        initSupabaseSession(currentRoomId.value, myParticipantId.value, myParticipantName.value)
      }
    } else {
      initMockSession()
    }
  }

  async function newCycle() {
    if (isMultiplayer.value && roomChannel) {
      isRevealed.value = false
      myVote.value = null
      
      // Update my own presence immediately
      await updateMyPresence({ vote: null, hasVoted: false })
      
      // Broadcast to everyone else to reset
      await roomChannel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: { action: 'new_cycle' },
      })
    } else {
      sessionKey.value += 1
    }
  }

  watch(sessionKey, () => initSession(), { immediate: true })

  function addStrike(x: number, y: number) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    strikes.value = [...strikes.value, { id, x, y }]
  }

  function removeStrike(id: number) {
    strikes.value = strikes.value.filter((s) => s.id !== id)
  }

  function fireLightning(participantId: number) {
    if (destroyedIds.value.has(participantId)) return

    destroyedIds.value.add(participantId)

    const p = participants.value.find((x) => x.id === participantId)
    let botMsg: ChatMessage | undefined = undefined
    
    if (p) {
      botMsg = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: p.name,
        text: pickRandom(BOT_PHRASES),
        color: p.color
      }
    }

    triggerLightningVisual(participantId, botMsg)

    if (isMultiplayer.value && roomChannel) {
      // Update my own presence if I fired lightning on myself
       if (String(participantId) === String(myParticipantId.value)) {
         updateMyPresence({ is_destroyed: true })
       }
       
      // Broadcast attack to others
      roomChannel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: { 
          action: 'lightning', 
          targetId: participantId,
          botMessage: botMsg 
        },
      })
    }
  }

  const stats = computed<Stats>(() => {
    const votes = participants.value
      .filter((p) => !destroyedIds.value.has(p.id))
      .map((p) => p.vote)
      .filter((v): v is string => !!v && !['?', '☕'].includes(v))
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n))

    if (votes.length === 0) return { avg: '0.0', min: 0, max: 0 }

    const avg = votes.reduce((a, b) => a + b, 0) / votes.length
    return {
      avg: avg.toFixed(1),
      min: Math.min(...votes),
      max: Math.max(...votes)
    }
  })

  const activeCount = computed(() => participants.value.length - destroyedIds.value.size)

  async function pickVote(val: string) {
    if (isRevealed.value) return
    myVote.value = val

    if (isMultiplayer.value && myParticipantId.value) {
      // Optmistic local state via syncPresence
      await updateMyPresence({ vote: val, hasVoted: true })
    }
  }

  async function reveal() {
    isRevealed.value = true
    
    if (isMultiplayer.value && roomChannel) {
      await roomChannel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: { action: 'reveal' },
      })
    }
  }

  async function nextMonday() {
    const nextIdx = (currentIndex.value + 1) % mondayItems.value.length
    currentIndex.value = nextIdx
    if (isMultiplayer.value && roomChannel) {
      await roomChannel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: { action: 'change_issue', index: nextIdx },
      })
    }
  }

  async function prevMonday() {
    const prevIdx = (currentIndex.value - 1 + mondayItems.value.length) % mondayItems.value.length
    currentIndex.value = prevIdx
    if (isMultiplayer.value && roomChannel) {
      await roomChannel.send({
        type: 'broadcast',
        event: 'room_state',
        payload: { action: 'change_issue', index: prevIdx },
      })
    }
  }

  onBeforeUnmount(() => {
    clearTimers()
    cleanupSupabase()
  })

  return {
    // state
    participants,
    myVote,
    isRevealed,
    sessionKey,
    chatMessages,
    strikes,
    destroyedIds,
    isShaking,
    showHologram,
    mondayItems,
    currentIndex,
    currentRoomId,
    myParticipantId,
    isMultiplayer,

    // derived
    stats,
    activeCount,

    // actions
    newCycle,
    fireLightning,
    removeStrike,
    pickVote,
    reveal,
    nextMonday,
    prevMonday,
    initSupabaseSession,
    initMockSession
  }
}
