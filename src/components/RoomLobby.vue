<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'join', roomId: string, userName: string): void
}>()

const roomId = ref('')
const userName = ref('')

function handleJoin() {
  if (roomId.value.trim() && userName.value.trim()) {
    emit('join', roomId.value.trim(), userName.value.trim())
  }
}

function handleMock() {
    // Señal para ignorar supabase y correr modo local
    emit('join', '', '')
}
</script>

<template>
  <div class="min-h-screen bg-[#020408] text-slate-100 flex items-center justify-center font-mono">
    <div class="w-full max-w-md p-8 bg-black/40 border border-emerald-500/20 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.1)]">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">CYBER ARENA</h1>
        <p class="text-slate-400 mt-2 text-sm">PLANNING POKER NEXUS</p>
      </div>

      <form @submit.prevent="handleJoin" class="space-y-6">
        <div>
          <label class="block text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Alias (Tu Nombre)</label>
          <input 
            v-model="userName" 
            type="text" 
            required
            class="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            placeholder="Ej. Cyber Master"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">ID de la Sala</label>
          <input 
            v-model="roomId" 
            type="text" 
            required
            class="w-full bg-black/50 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-600"
            placeholder="UUID de Supabase"
          />
        </div>

        <button 
          type="submit"
          class="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 px-4 rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
        >
          INICIAR ENLACE
        </button>
      </form>
      
      <div class="mt-8 pt-6 border-t border-white/5 text-center">
          <button @click="handleMock" class="text-xs text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4">
              Iniciar simulación local (Offline)
          </button>
      </div>
    </div>
  </div>
</template>
