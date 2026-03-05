<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { MessageSquare, Send, X } from 'lucide-vue-next'
import { FIBONACCI } from '@/constants/game'
import { THEMES } from '@/constants/themes'
import { useCyberArena } from '@/composables/useCyberArena'

import HudHeader from '@/components/HudHeader.vue'
import SystemLog from '@/components/SystemLog.vue'
import Arena from '@/components/Arena.vue'
import VoteFooter from '@/components/VoteFooter.vue'
import RoomLobby from '@/components/RoomLobby.vue'
import FloatingReactions from '@/components/FloatingReactions.vue'
import LightningStrike from '@/components/LightningStrike.vue'

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

function handleJoin(roomId: string, participantName: string) {
  import('@/lib/supabase').then(({ supabase }) => {
    if (roomId && supabase) {
      const randomId = crypto.randomUUID()
      initSupabaseSession(roomId, randomId, participantName)
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

function handleMondayLogin() {
  const clientID = 'b017b4b6f6ca8ec8b1c6d16e5f2c45f0'
  // Monday.com requiere HTTPS en las redirect URIs, así que SIEMPRE usamos la URL de producción.
  // Después del login, el usuario deberá copiar el ?code= de Netlify y pegarlo manualmente en localhost,
  // O idealmente, probar el flujo completo desde Netlify directamente.
  const redirectUri = 'https://bailonpokect.netlify.app/'

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

        if (!error && data?.status === 'success') {
          console.log("Auth Exitosa con Monday!", data)
          alert("¡Conexión con Monday completada! Los tickets serán cargados.")
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
    class="w-full h-[100dvh] flex flex-col overflow-hidden font-mono selection:bg-sky-500/30 transition-colors duration-1000"
    :class="[isShaking ? 'shake-active' : '', activeTheme.background, activeTheme.textPrimary]">
    <!-- Lightning overlays -->
    <LightningStrike v-for="s in strikes" :key="s.id" :target-x="s.x" :target-y="s.y" @complete="removeStrike(s.id)" />

    <HudHeader :destroyed="destroyedIds.size" :active="activeCount" :theme="currentTheme" @new-cycle="newCycle"
      @change-theme="changeTheme" @monday-login="handleMondayLogin" />

    <div class="flex-1 min-h-0 flex relative w-full">

      <main class="flex-1 min-w-0 relative flex items-center justify-center p-2 md:p-8 overflow-visible">
        <Arena :participants="participants" :destroyed-ids="destroyedIds" :is-revealed="isRevealed" :my-vote="myVote"
          :stats="stats" :theme="activeTheme" @fire="fireLightning" @fireTarget="fireTarget" @reveal="reveal" />
      </main>
    </div>

    <!-- Floating Chat Toggle -->
    <button @click="showChat = !showChat"
      class="fixed bottom-32 right-6 z-[80] bg-slate-800/80 backdrop-blur border p-4 rounded-full text-sky-400 hover:text-white hover:bg-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.3)] transition-all"
      :class="activeTheme.border">
      <MessageSquare :size="28" />
    </button>

    <!-- Chat Drawer -->
    <div
      class="fixed top-0 right-0 bottom-0 w-80 md:w-96 bg-slate-950/95 backdrop-blur-3xl border-l z-[100] transition-transform duration-500 shadow-2xl flex flex-col pt-16"
      :class="[activeTheme.border, showChat ? 'translate-x-0' : 'translate-x-full']">
      <button @click="showChat = false" class="absolute top-6 left-6 text-slate-400 hover:text-white transition-colors">
        <X :size="28" />
      </button>

      <div class="flex-1 overflow-y-auto w-full p-4 mb-2 mt-4 hide-scrollbar">
        <SystemLog :messages="chatMessages" class="w-full h-full border-none bg-transparent shadow-none p-0" />
      </div>

      <form @submit.prevent="handleChatSubmit" class="p-6 border-t flex gap-3 w-full bg-slate-900/50"
        :class="activeTheme.border">
        <input v-model="chatText" type="text" placeholder="Incoming transmission..."
          class="flex-1 bg-black/60 border rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-1 focus:ring-sky-500 transition-all font-mono placeholder:text-slate-600"
          :class="[activeTheme.border, activeTheme.textPrimary]" />
        <button type="submit"
          class="bg-sky-500 hover:bg-sky-400 text-slate-900 rounded-xl px-4 py-3 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.4)]">
          <Send :size="18" />
        </button>
      </form>
    </div>

    <VoteFooter :fibonacci="FIBONACCI" :my-vote="myVote" :is-revealed="isRevealed" :theme="activeTheme"
      @pick="pickVote" />

    <FloatingReactions :reactions="reactions" @fire="fireReaction" />
  </div>
</template>
