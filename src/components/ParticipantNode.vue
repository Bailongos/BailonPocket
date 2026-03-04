<script setup lang="ts">
import { computed } from 'vue'
import type { Participant, Stats } from '@/types'
import { Loader2, Zap } from 'lucide-vue-next'

const props = defineProps<{
  participant: Participant
  index: number
  total: number
  isDestroyed: boolean
  isRevealed: boolean
  stats: Stats
}>()

const emit = defineEmits<{ (e: 'fire', id: number): void }>()

const transform = computed(() => {
  const angle = (props.index * (360 / props.total)) * (Math.PI / 180)
  const tx = Math.cos(angle) * 460
  const ty = Math.sin(angle) * 200
  return `translate(${tx}px, ${ty}px)`
})

const borderClass = computed(() => {
  const v = props.participant.vote
  if (v == null) return 'border-white/10'
  const numeric = Number(v)
  if (Number.isFinite(numeric) && (numeric === props.stats.min || numeric === props.stats.max)) return 'border-sky-400'
  return 'border-white/10'
})

function onFire() {
  if (props.participant.isMe) return
  if (props.isDestroyed) return
  emit('fire', props.participant.id)
}
</script>

<template>
  <div
    :id="`participant-${props.participant.id}`"
    class="absolute transition-all duration-1000 z-20"
    :class="props.isDestroyed ? 'disintegrating' : ''"
    :style="{ transform: transform }"
  >
    <div class="flex flex-col items-center gap-5">
      <div class="perspective-1000 w-16 h-24 md:w-20 md:h-28">
        <div
          class="relative w-full h-full transition-all duration-700 preserve-3d"
          :class="props.isRevealed && props.participant.hasVoted ? '' : 'rotate-y-180'"
        >
          <!-- Hidden state -->
          <div
            class="absolute inset-0 backface-hidden rounded-2xl border-2 flex items-center justify-center rotate-y-180 shadow-2xl transition-all"
            :class="
              props.participant.hasVoted
                ? 'bg-sky-600 border-white/60 shadow-sky-500/20'
                : 'bg-slate-900 border-white/5 border-dashed opacity-40'
            "
          >
            <Loader2
              v-if="props.participant.thinking && !props.participant.hasVoted"
              class="animate-spin text-white/20"
              :size="32"
            />
            <Zap
              v-else-if="props.participant.hasVoted"
              class="text-white/40 animate-pulse"
              :size="36"
            />
          </div>

          <!-- Revealed state -->
          <div
            class="absolute inset-0 backface-hidden bg-slate-900 rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl"
            :class="borderClass"
          >
            <span class="text-4xl font-black text-white glow-text">{{ props.participant.vote }}</span>
          </div>
        </div>
      </div>

      <!-- Name / Fire button -->
      <button
        class="group relative flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md transition-all"
        :class="props.participant.isMe ? 'bg-white text-black' : 'bg-black/80 hover:border-rose-500'"
        @click="onFire"
      >
        <div
          class="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
          :style="{ backgroundColor: props.participant.color, color: props.participant.color }"
        />
        <span class="text-[10px] font-black uppercase tracking-widest">
          {{ props.participant.name.split(' ')[0] }}
        </span>
        <Zap
          v-if="!props.participant.isMe && !props.isDestroyed"
          class="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
          :size="10"
        />
      </button>
    </div>
  </div>
</template>
