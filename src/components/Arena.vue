<script setup lang="ts">
import type { Participant, Stats } from '@/types'
import ParticipantNode from '@/components/ParticipantNode.vue'
import { Zap } from 'lucide-vue-next'

const props = defineProps<{
  participants: Participant[]
  destroyedIds: Set<number>
  isRevealed: boolean
  myVote: string | null
  stats: Stats
}>()

const emit = defineEmits<{ (e: 'fire', id: number): void; (e: 'reveal'): void }>()
</script>

<template>
  <div
    class="relative w-full max-w-5xl aspect-[21/9] rounded-[300px] border border-sky-500/10 bg-slate-900/5 flex items-center justify-center shadow-[inset_0_0_100px_rgba(14,165,233,0.05)]"
  >
    <!-- Action Center HUD -->
    <div class="z-30">
      <div v-if="!props.isRevealed" class="flex flex-col items-center gap-8">
        <div class="flex -space-x-3">
          <div
            v-for="p in props.participants.filter((x) => x.hasVoted && !props.destroyedIds.has(x.id))"
            :key="p.id"
            class="w-12 h-12 rounded-xl border-2 border-[#020408] flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] transform rotate-12"
            :style="{ backgroundColor: p.color }"
          >
            <Zap class="text-black" :size="16" />
          </div>
        </div>

        <button
          :disabled="!props.myVote"
          class="px-14 py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] transition-all shadow-2xl relative group"
          :class="
            props.myVote
              ? 'bg-white text-slate-900 hover:scale-110 active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          "
          @click="emit('reveal')"
        >
          <div
            v-if="props.myVote"
            class="absolute inset-0 bg-sky-400 rounded-2xl group-hover:animate-ping opacity-20"
          />
          REVEAL_MATRIX
        </button>
      </div>

      <div v-else class="zoom-in bg-slate-950/90 p-10 rounded-[50px] border border-sky-500/30 shadow-[0_0_60px_rgba(14,165,233,0.2)] backdrop-blur-xl">
        <div class="grid grid-cols-2 gap-12">
          <div class="text-center">
            <p class="text-[10px] text-sky-500 font-black uppercase mb-2 tracking-widest">Average_Score</p>
            <p class="text-5xl font-black text-white glow-text">{{ props.stats.avg }}</p>
          </div>
          <div class="text-center border-l border-white/10 pl-12">
            <p class="text-[10px] text-rose-500 font-black uppercase mb-2 tracking-widest">Active_Nodes</p>
            <p class="text-5xl font-black text-white">{{ props.participants.length - props.destroyedIds.size }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Orbit participants -->
    <ParticipantNode
      v-for="(p, i) in props.participants"
      :key="p.id"
      :participant="p"
      :index="i"
      :total="props.participants.length"
      :is-destroyed="props.destroyedIds.has(p.id)"
      :is-revealed="props.isRevealed"
      :stats="props.stats"
      @fire="(id) => emit('fire', id)"
    />
  </div>
</template>
