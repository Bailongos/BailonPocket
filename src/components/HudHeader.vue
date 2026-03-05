<script setup lang="ts">
import { Layout, Monitor, RefreshCw, Skull, Users } from 'lucide-vue-next'
import { THEMES, type ThemeName } from '@/constants/themes'

const props = defineProps<{ destroyed: number; active: number; theme: ThemeName; mondayConnected: boolean }>()
const emit = defineEmits<{
  (e: 'new-cycle'): void
  (e: 'change-theme', theme: ThemeName): void
  (e: 'monday-login'): void
  (e: 'select-board'): void
}>()
</script>

<template>
  <header
    class="px-8 py-3 border-b border-sky-500/20 bg-slate-900/40 backdrop-blur-xl flex justify-between items-center z-50">
    <div class="flex items-center gap-6">
      <div class="relative group cursor-help">
        <div
          class="w-10 h-10 bg-sky-500/20 border border-sky-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
          <Monitor class="text-sky-400" :size="20" />
        </div>
      </div>

      <div>
        <h1 class="text-lg font-black tracking-[0.2em] text-white uppercase italic glow-text">
          Cyber_Arena <span class="text-sky-500">v4</span>
        </h1>
        <div class="flex gap-3 text-[10px] font-bold text-slate-500">
          <span class="flex items-center gap-1 text-rose-500">
            <Skull :size="10" /> LOST: {{ props.destroyed }}
          </span>
          <span class="flex items-center gap-1 text-sky-400">
            <Users :size="10" /> ACTIVE: {{ props.active }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex gap-3">

      <select :value="props.theme"
        @change="(e) => emit('change-theme', (e.target as HTMLSelectElement).value as ThemeName)"
        class="bg-slate-800 border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-lg px-3 outline-none cursor-pointer hover:border-sky-500 transition-colors">
        <option v-for="t in Object.values(THEMES)" :key="t.id" :value="t.id">
          {{ t.name }}
        </option>
      </select>

      <button v-if="!props.mondayConnected"
        class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black border border-indigo-400/30 uppercase tracking-widest transition-all"
        @click="emit('monday-login')">
        Monday Login
      </button>
      <button v-else
        class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black border border-emerald-400/30 uppercase tracking-widest transition-all"
        @click="emit('select-board')">
        Select Board
      </button>

      <button
        class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-black border border-white/5 uppercase tracking-widest transition-all"
        @click="emit('new-cycle')">
        <RefreshCw :size="14" class="inline mr-2" /> New Cycle
      </button>
    </div>
  </header>
</template>
