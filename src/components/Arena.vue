<script setup lang="ts">
import type { Participant, Stats } from '@/types'
import type { ThemeConfig } from '@/constants/themes'
import ParticipantNode from '@/components/ParticipantNode.vue'
import { Zap } from 'lucide-vue-next'

const props = defineProps<{
  participants: Participant[]
  destroyedIds: Set<number>
  isRevealed: boolean
  myVote: string | null
  stats: Stats
  theme: ThemeConfig
}>()

const emit = defineEmits<{
  (e: 'fire', id: number): void
  (e: 'fireTarget', x: number, y: number): void
  (e: 'reveal'): void
}>()

function handleArenaClick(e: MouseEvent) {
  emit('fireTarget', e.clientX, e.clientY)
}
</script>

<template>
  <div
    class="relative w-[75%] md:w-full max-w-3xl aspect-square md:aspect-[21/9] rounded-[100px] md:rounded-[300px] border bg-slate-900/5 flex items-center justify-center shadow-[inset_0_0_100px_rgba(14,165,233,0.05)] cursor-crosshair overflow-visible transition-colors duration-1000"
    :class="props.theme.border" @click.self="handleArenaClick">
    <!-- Action Center HUD -->
    <div class="z-30">
      <div v-if="!props.isRevealed" class="flex flex-col items-center gap-8">

        <button :disabled="!props.myVote"
          class="px-8 py-4 md:px-14 md:py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-[0.2em] transition-all shadow-2xl relative group"
          :class="props.myVote
            ? 'bg-white text-slate-900 hover:scale-110 active:scale-95'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            " @click="emit('reveal')">
          <div v-if="props.myVote"
            class="absolute inset-0 bg-sky-400 rounded-2xl group-hover:animate-ping opacity-20" />
          REVEAL_MATRIX
        </button>
      </div>

      <div v-else
        class="zoom-in bg-slate-950/90 p-6 md:p-10 rounded-[30px] md:rounded-[50px] border shadow-[0_0_60px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-colors duration-1000"
        :class="props.theme.border">
        <div class="grid grid-cols-2 gap-6 md:gap-12">
          <div class="text-center">
            <p class="text-[10px] font-black uppercase mb-2 tracking-widest transition-colors duration-1000"
              :class="props.theme.textSecondary">Average_Score</p>
            <p class="text-5xl font-black text-white glow-text">{{ props.stats.avg }}</p>
          </div>
          <div class="text-center border-l border-white/10 pl-6 md:pl-12 transition-colors duration-1000">
            <p class="text-[10px] font-black uppercase mb-2 tracking-widest transition-colors duration-1000"
              :class="props.theme.accent">Active_Nodes</p>
            <p class="text-3xl md:text-5xl font-black text-white">{{ props.participants.length - props.destroyedIds.size
            }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Orbit participants -->
    <!-- Mini Cards Indicators (Left Side) -->
    <div v-if="!props.isRevealed"
      class="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 flex flex-col -space-y-4 z-40">
      <div v-for="p in props.participants.filter((x) => x.hasVoted && !props.destroyedIds.has(x.id))" :key="p.id"
        class="w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 border-[#020408] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transform -rotate-12 transition-all duration-500 hover:scale-110 hover:z-10"
        :style="{ backgroundColor: p.color }">
        <Zap class="text-black" :size="16" />
      </div>
    </div>

    <!-- Orbit participants -->
    <TransitionGroup name="participant-list">
      <ParticipantNode v-for="(p, i) in props.participants" :key="p.id" :participant="p" :index="i"
        :total="props.participants.length" :is-destroyed="props.destroyedIds.has(p.id)" :is-revealed="props.isRevealed"
        :stats="props.stats" :theme="props.theme" @fire="(id) => emit('fire', id)" />
    </TransitionGroup>
  </div>
</template>

<style scoped>
.participant-list-enter-active,
.participant-list-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.participant-list-enter-from,
.participant-list-leave-to {
  opacity: 0;
  transform: scale(0.1) translateY(50px) !important;
}
</style>
