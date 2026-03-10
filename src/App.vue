<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { MessageSquare, Send, X, ChevronLeft, ChevronRight, LayoutGrid, Users, RefreshCw, Info } from 'lucide-vue-next'
import { FIBONACCI } from '@/constants/game'
import { THEMES } from '@/constants/themes'
import { useCyberArena } from '@/composables/useCyberArena'

import SystemLog from '@/components/SystemLog.vue'
import VoteFooter from '@/components/VoteFooter.vue'
import RoomLobby from '@/components/RoomLobby.vue'
import FloatingReactions from '@/components/FloatingReactions.vue'
import LightningStrike from '@/components/LightningStrike.vue'
import MondayBoardSelector from '@/components/MondayBoardSelector.vue'
import TeamVotesList from '@/components/TeamVotesList.vue'

const {
  participants,
  myVote,
  isRevealed,
  chatMessages,
  reactions,
  strikes,
  destroyedIds,
  isShaking,
  stats,
  activeCount,
  newCycle,
  fireLightning,
  fireTarget,
  fireReaction,
  removeStrike,
  pickVote,
  reveal,
  changeTheme,
  sendChatMessage,
  initSupabaseSession,
  initMockSession,
  currentRoomId,
  currentTheme
} = useCyberArena()

const activeTheme = computed(() => THEMES[currentTheme.value])

const isLobby = ref(true)
const showChat = ref(false)
const chatText = ref('')

function handleChatSubmit() {
  if (chatText.value.trim()) {
    sendChatMessage(chatText.value)
    chatText.value = ''
  }
}

function handleJoin(roomId: string, participantName: string, participantRole: string) {
  // Guardar sesion en localStorage para que sobreviva el redirect de OAuth
  localStorage.setItem('cyber_room_id', roomId)
  localStorage.setItem('cyber_participant_name', participantName)
  localStorage.setItem('cyber_participant_role', participantRole)

  import('@/lib/supabase').then(({ supabase }) => {
    if (roomId && supabase) {
      const participantId = localStorage.getItem('cyber_participant_id') || crypto.randomUUID()
      localStorage.setItem('cyber_participant_id', participantId)
      initSupabaseSession(roomId, participantId, participantName, participantRole)
    } else {
      if (roomId && !supabase) {
        alert('Supabase no está configurado en este entorno. Iniciando simulación local (offline).')
      }
      initMockSession()
    }
    isLobby.value = false
  })
}

// Lógica de Integración Segura con Monday.com
const isSyncingMonday = ref(false)
const mondayToken = ref<string | null>(null)
const showBoardSelector = ref(false)

interface MondayTicket {
  id: string;
  name: string;
  group?: { title: string };
  description?: string;
  updates?: any[];
}
const mondayTickets = ref<MondayTicket[]>([])
const currentTicketIndex = ref(0)
const mondayBoardName = ref('')

const currentTicket = computed(() => mondayTickets.value[currentTicketIndex.value] || null)

// Funciones de sincronización con Monday
const isSyncingWithMonday = ref(false)
const showSyncPrompt = ref(false)

async function syncTicketAndNext() {
  if (!currentTicket.value || !mondayToken.value) return

  // Convertir el score average a string (ej: "3.5" o "8.0")
  const agreedScore = stats.value.avg

  if (agreedScore === '0.0') {
    alert("No hay votos válidos para sincronizar.")
    return
  }

  isSyncingWithMonday.value = true

  import('@/lib/supabase').then(async ({ supabase }) => {
    if (!supabase) return

    const { data, error } = await supabase.functions.invoke('monday-boards', {
      body: {
        access_token: mondayToken.value,
        action: 'update_item',
        board_id: currentTicket.value?.id, // Necesitamos el board_id (lo sacaremos de mondayTickets o se lo pasamos)
        item_id: currentTicket.value?.id,
        column_title: "ESP",
        value: agreedScore
      }
    })

    isSyncingWithMonday.value = false

    if (error || data?.error) {
      console.error('Error sincronizando', error || data?.error)
      alert(`Error sincronizando: ${error || data?.error}`)
    } else {
      console.log('Sincronización exitosa', data)
      // Avanzar ticket y resetear ciclo (quitamos modal porque esta directo en Dashboard)
      nextTicket()
      newCycle()
    }
  })
}

function nextTicket() {
  if (mondayTickets.value.length === 0) return
  currentTicketIndex.value = (currentTicketIndex.value + 1) % mondayTickets.value.length
}
function prevTicket() {
  if (mondayTickets.value.length === 0) return
  currentTicketIndex.value = (currentTicketIndex.value - 1 + mondayTickets.value.length) % mondayTickets.value.length
}

function handleMondayLogin() {
  const clientID = import.meta.env.VITE_MONDAY_CLIENT_ID
  // Usamos el origin actual para que funcione tanto en local como en producción
  const redirectUri = window.location.origin + '/'

  const authUrl = `https://auth.monday.com/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}`
  console.log("Monday OAuth: Redirigiendo a Monday. Después del login serás enviado a:", redirectUri)
  window.location.href = authUrl
}

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')

  if (code) {
    isSyncingMonday.value = true
    isLobby.value = false // Auto-bypass lobby to avoid UX interrupts
    console.log("Código de autorización recibido. Intercambiando por token en Edge Functions...")

    import('@/lib/supabase').then(async ({ supabase }) => {
      if (supabase) {
        // Obtenemos el origin exacto con el que nos redireccionó Monday
        const redirect_uri = window.location.origin + '/'

        const { data, error } = await supabase.functions.invoke('monday-oauth', {
          body: { code, redirect_uri }
        })

        if (!error && data?.data?.access_token) {
          console.log("Auth Exitosa con Monday!", data)
          mondayToken.value = data.data.access_token
          showBoardSelector.value = true

          const savedRoom = localStorage.getItem('cyber_room_id')
          const savedName = localStorage.getItem('cyber_participant_name')
          const savedId = localStorage.getItem('cyber_participant_id')
          const savedRole = localStorage.getItem('cyber_participant_role') || 'Developer'

          if (savedRoom && savedName && supabase) {
            initSupabaseSession(savedRoom, savedId || crypto.randomUUID(), savedName, savedRole)
          } else {
            initMockSession()
          }
        } else {
          console.error("Error intercambiando OAuth token", error || data)
          alert("Error al conectar con Monday. " + (error?.message || "Revisa la consola."))
        }
      }

      // Limpiar URL para no fugar el "code"
      window.history.replaceState({}, document.title, window.location.pathname)
      isSyncingMonday.value = false
    })
  }
})
</script>

<template>
  <RoomLobby v-if="isLobby" @join="handleJoin" />

  <div v-else
    class="h-[100dvh] bg-[#05060a] text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden flex flex-col transition-colors duration-1000"
    :class="[isShaking ? 'shake-active' : '']">

    <!-- Lightning overlays -->
    <LightningStrike v-for="s in strikes" :key="s.id" :target-x="s.x" :target-y="s.y" @complete="removeStrike(s.id)" />

    <!-- Top Navigation Bar -->
    <header
      class="h-16 border-b border-cyan-500/20 bg-[#0a0b14]/80 backdrop-blur-md flex items-center justify-between px-6 z-50 shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <LayoutGrid class="text-black w-5 h-5" />
        </div>
        <h1 class="text-lg font-bold tracking-tighter uppercase italic">
          Cyber<span class="text-cyan-400">_Arena</span> <span class="text-xs opacity-50 font-mono">v5.0</span>
        </h1>
      </div>

      <div class="flex items-center gap-6">
        <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/30">
          <Users class="w-4 h-4 text-cyan-400" />
          <span class="text-xs font-mono font-bold">{{ activeCount }} ACTIVE_NODES</span>
        </div>
        <div class="hidden md:block h-4 w-[1px] bg-slate-700" />
        <div class="flex gap-2">
          <button @click="newCycle"
            class="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-all">
            <RefreshCw class="w-4 h-4" /> New Cycle
          </button>

          <button v-if="!mondayToken" @click="handleMondayLogin"
            class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all">
            Monday Login
          </button>
          <button v-else @click="showBoardSelector = true"
            class="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
            Select Board
          </button>
        </div>
      </div>
    </header>

    <main
      class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 min-h-0 overflow-y-auto lg:overflow-hidden hide-scrollbar relative">
      <!-- Left Column: User Story Info -->
      <div v-if="currentTicket" class="col-span-1 lg:col-span-8 flex flex-col gap-6 lg:overflow-hidden">
        <!-- Story Card -->
        <div
          class="flex-1 bg-[#0f111a] border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden flex flex-col min-h-[400px] lg:min-h-0">
          <!-- Background Accent -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] -z-10" />

          <div class="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div class="flex items-center gap-4">
              <span
                class="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded uppercase tracking-widest border border-cyan-500/30">
                #{{ currentTicket.id.slice(-6) }}
              </span>
              <span class="text-slate-500 text-xs font-medium uppercase tracking-wider">{{ mondayBoardName ||
                'SPRINT_BACKLOG' }}</span>
            </div>
            <div class="flex gap-2">
              <button @click="prevTicket"
                class="p-2 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
                title="Previous Ticket">
                <ChevronLeft class="w-5 h-5" />
              </button>
              <button @click="nextTicket"
                class="p-2 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors" title="Next Ticket">
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto pr-2 hide-scrollbar">
            <h2
              class="text-2xl md:text-3xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              {{ currentTicket.name }}
            </h2>
            <div v-if="currentTicket.description"
              class="flex items-center gap-2 text-cyan-500/70 mb-4 font-mono text-sm uppercase">
              <Info class="w-4 h-4" />
              <span>Story Description</span>
            </div>
            <p v-if="currentTicket.description"
              class="text-slate-400 text-base md:text-lg leading-relaxed max-w-3xl whitespace-pre-wrap">
              {{ currentTicket.description }}
            </p>
          </div>

          <!-- Bottom Info Bar -->
          <div
            class="mt-8 pt-6 md:pt-8 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-6 shrink-0">
            <div class="flex gap-8 md:gap-12">
              <div>
                <div class="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Status</div>
                <div class="text-emerald-400 font-bold flex items-center gap-2 text-xs md:text-sm">
                  <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  IN_PROGRESS
                </div>
              </div>
              <div>
                <div class="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Sprint</div>
                <div class="text-white font-mono text-xs md:text-sm">{{ currentTicket.group?.title || 'Backlog General'
                }}</div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <div class="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Avg. Score</div>
                <div class="text-3xl font-black font-mono text-white tracking-tighter shadow-cyan-500/50 drop-shadow-xl"
                  :class="{ 'glow-text': isRevealed }">
                  {{ isRevealed ? stats.avg : "??" }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder if no tickets -->
      <div v-else
        class="col-span-1 lg:col-span-8 flex flex-col items-center justify-center border border-slate-800 border-dashed rounded-2xl bg-[#0f111a]/50 min-h-[400px]">
        <Info class="w-12 h-12 text-slate-700 mb-4" />
        <p class="text-slate-500 font-bold uppercase tracking-widest text-sm">Select a Monday Board to start</p>
        <button v-if="mondayToken" @click="showBoardSelector = true"
          class="mt-4 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_rgba(8,145,178,0.2)]">
          Explore Boards
        </button>
        <button v-else @click="handleMondayLogin"
          class="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.2)]">
          Login to Monday
        </button>
      </div>

      <!-- Right Column: Team Votes -->
      <div class="col-span-1 lg:col-span-4 flex flex-col gap-4">
        <TeamVotesList :participants="participants" :is-revealed="isRevealed" :is-syncing="isSyncingWithMonday"
          :stats="stats" @reveal-toggle="isRevealed ? newCycle() : reveal()" @sync-monday="syncTicketAndNext" />
      </div>
    </main>

    <!-- Floating Chat Toggle -->
    <button @click="showChat = !showChat"
      class="fixed bottom-36 right-6 z-[80] bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-full text-cyan-400 hover:text-white hover:bg-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all">
      <MessageSquare :size="28" />
    </button>

    <!-- Chat Drawer -->
    <div
      class="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-slate-950/95 backdrop-blur-3xl border-l border-slate-800 z-[100] transition-transform duration-500 shadow-2xl flex flex-col pt-16"
      :class="[showChat ? 'translate-x-0' : 'translate-x-full']">
      <button @click="showChat = false" class="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
        <X :size="28" />
      </button>

      <div class="flex-1 overflow-y-auto w-full p-4 mb-2 mt-4 hide-scrollbar">
        <SystemLog :messages="chatMessages" class="w-full h-full border-none bg-transparent shadow-none p-0" />
      </div>

      <form @submit.prevent="handleChatSubmit" class="p-6 border-t border-slate-800 flex gap-3 w-full bg-slate-900/50">
        <input v-model="chatText" type="text" placeholder="Incoming transmission..."
          class="flex-1 bg-black/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans placeholder:text-slate-600" />
        <button type="submit"
          class="bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl px-4 py-3 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Send :size="18" />
        </button>
      </form>
    </div>

    <!-- Footer: Input Bar -->
    <VoteFooter :fibonacci="FIBONACCI" :my-vote="myVote" :is-revealed="isRevealed" :theme="activeTheme"
      @pick="pickVote" />

    <!-- Emojis flotantes desactivados por petición del usuario -->
    <!-- <FloatingReactions :reactions="reactions" @fire="fireReaction" /> -->

    <!-- Monday Board Selector Modal -->
    <MondayBoardSelector v-if="showBoardSelector" :access-token="mondayToken || ''" @close="showBoardSelector = false"
      @select-items="(items, boardName) => { mondayTickets = items; mondayBoardName = boardName; currentTicketIndex = 0; showBoardSelector = false }" />
  </div>
</template>

<style>
/* Any global style overrides for the new React layout */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
