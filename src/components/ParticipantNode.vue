<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Participant, Stats } from '@/types'
import type { ThemeConfig } from '@/constants/themes'
import { Loader2, Zap } from 'lucide-vue-next'

const props = defineProps<{
  participant: Participant
  index: number
  total: number
  isDestroyed: boolean
  isRevealed: boolean
  stats: Stats
  theme: ThemeConfig
}>()

const emit = defineEmits<{ (e: 'fire', id: number): void }>()

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

function onResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const transform = computed(() => {
  const isMobile = windowWidth.value < 768

  const maxRadiusX = (windowWidth.value / 2) - 45
  const availableHeight = windowHeight.value - (isMobile ? 220 : 180)
  const maxRadiusY = (availableHeight / 2) - 50

  const targetRadiusX = isMobile ? 180 : 480
  const targetRadiusY = isMobile ? 160 : 250

  const radiusX = Math.max(0, Math.min(targetRadiusX, maxRadiusX))
  const radiusY = Math.max(0, Math.min(targetRadiusY, maxRadiusY))

  const scale = isMobile ? 0.7 : Math.min(windowWidth.value / 1440, 1)

  const angle = (props.index * (360 / props.total)) * (Math.PI / 180)
  const tx = Math.cos(angle) * radiusX
  const ty = Math.sin(angle) * radiusY
  return `translate(${tx}px, ${ty}px) scale(${scale})`
})

const borderClass = computed(() => {
  const v = props.participant.vote
  if (v == null) return props.theme.cardIdle
  const numeric = Number(v)
  if (Number.isFinite(numeric) && (numeric === props.stats.min || numeric === props.stats.max)) return props.theme.cardVoted
  return props.theme.cardIdle
})

function onFire() {
  if (props.participant.isMe) return
  if (props.isDestroyed) return
  emit('fire', props.participant.id)
}
</script>

<template>
  <div :id="`participant-${props.participant.id}`" class="absolute transition-all duration-1000 z-20"
    :class="props.isDestroyed ? 'disintegrating' : ''" :style="{ transform: transform }">
    <div class="flex flex-col items-center gap-5">
      <div class="perspective-1000 w-16 h-24 md:w-20 md:h-28">
        <div class="relative w-full h-full transition-all duration-700 preserve-3d"
          :class="props.isRevealed && props.participant.hasVoted ? '' : 'rotate-y-180'">
          <!-- Hidden state -->
          <div
            class="absolute inset-0 backface-hidden rounded-2xl border-2 flex items-center justify-center rotate-y-180 shadow-2xl transition-all duration-1000"
            :class="props.participant.hasVoted ? props.theme.cardVoted : props.theme.cardIdle + ' opacity-40 border-dashed'">
            <Loader2 v-if="props.participant.thinking && !props.participant.hasVoted" class="animate-spin text-white/20"
              :size="32" />
            <Zap v-else-if="props.participant.hasVoted" class="text-white/40 animate-pulse" :size="36" />
          </div>

          <!-- Revealed state -->
          <div
            class="absolute inset-0 backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-1000"
            :class="borderClass">
            <span class="text-3xl md:text-4xl font-black glow-text transition-colors duration-1000"
              :class="props.theme.textPrimary">{{ props.participant.vote }}</span>
          </div>
        </div>
      </div>

      <!-- Name / Fire button -->
      <button
        class="group relative flex items-center gap-3 px-4 py-2 rounded-xl border border-white/5 backdrop-blur-md transition-all"
        :class="props.participant.isMe ? 'bg-white text-black' : 'bg-black/80 hover:border-rose-500'" @click="onFire">
        <div class="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
          :style="{ backgroundColor: props.participant.color, color: props.participant.color }" />
        <span class="text-[10px] font-black uppercase tracking-widest">
          {{ props.participant.name.split(' ')[0] }}
        </span>
        <Zap v-if="!props.participant.isMe && !props.isDestroyed"
          class="text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" :size="10" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
