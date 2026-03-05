<script setup lang="ts">
import { computed, ref } from 'vue'
import { FIBONACCI } from '@/constants/game'
import { useCyberArena } from '@/composables/useCyberArena'

import HudHeader from '@/components/HudHeader.vue'
import HologramMonday from '@/components/HologramMonday.vue'
import SystemLog from '@/components/SystemLog.vue'
import Arena from '@/components/Arena.vue'
import VoteFooter from '@/components/VoteFooter.vue'
import RoomLobby from '@/components/RoomLobby.vue'

const {
  participants,
  myVote,
  isRevealed,
  chatMessages,
  strikes,
  destroyedIds,
  isShaking,
  showHologram,
  mondayItems,
  currentIndex,
  stats,
  activeCount,
  newCycle,
  fireLightning,
  removeStrike,
  pickVote,
  reveal,
  nextMonday,
  prevMonday,
  initSupabaseSession,
  initMockSession,
  currentRoomId
} = useCyberArena()

const isLobby = ref(true)

function handleJoin(roomId: string, participantName: string) {
  import('@/lib/supabase').then(({ supabase }) => {
    if (roomId && supabase) {
      // Implementar lógica de creación de participante en BD aquí si el usuario no existe.
      // Por simplicidad en esta demo, pasamos el participantName como ID (o lo generamos).
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

const currentMonday = computed(() => mondayItems.value[currentIndex.value])

function toggleHologram() {
  showHologram.value = !showHologram.value
}
function collapseHologram() {
  showHologram.value = false
}
function expandHologram() {
  showHologram.value = true
}
</script>

<template>
  <RoomLobby v-if="isLobby" @join="handleJoin" />

  <div v-else
    class="min-h-screen bg-[#020408] text-slate-100 flex flex-col overflow-hidden font-mono selection:bg-sky-500/30"
    :class="isShaking ? 'shake-active' : ''">
    <!-- Lightning overlays -->
    <LightningStrike v-for="s in strikes" :key="s.id" :target-x="s.x" :target-y="s.y" @complete="removeStrike(s.id)" />

    <HudHeader :destroyed="destroyedIds.size" :active="activeCount" :show-hologram="showHologram"
      @toggle-hologram="toggleHologram" @new-cycle="newCycle" />

    <div class="flex-1 flex relative">
      <HologramMonday :show="showHologram" :item="currentMonday" @collapse="collapseHologram" @expand="expandHologram"
        @next="nextMonday" @prev="prevMonday" />

      <!-- Side console (visible on 2XL like your React version) -->
      <aside class="w-72 border-r border-white/5 bg-black/40 p-6 hidden 2xl:flex overflow-y-auto">
        <SystemLog :messages="chatMessages" />
      </aside>

      <main class="flex-1 relative flex items-center justify-center p-12 overflow-visible">
        <Arena :participants="participants" :destroyed-ids="destroyedIds" :is-revealed="isRevealed" :my-vote="myVote"
          :stats="stats" @fire="fireLightning" @reveal="reveal" />
      </main>
    </div>

    <VoteFooter :fibonacci="FIBONACCI" :my-vote="myVote" :is-revealed="isRevealed" @pick="pickVote" />
  </div>
</template>
