<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ targetX: number; targetY: number }>()
const emit = defineEmits<{ (e: 'complete'): void }>()

const startX = ref(0)
const midX = ref(0)
const timer = ref<number | null>(null)

onMounted(() => {
  const w = window.innerWidth
  startX.value = Math.max(20, Math.min(w - 20, props.targetX + (Math.random() * 400 - 200)))
  midX.value = props.targetX + (Math.random() * 200 - 100)

  timer.value = window.setTimeout(() => emit('complete'), 400)
})

onBeforeUnmount(() => {
  if (timer.value != null) window.clearTimeout(timer.value)
})
</script>

<template>
  <svg
    class="fixed inset-0 w-full h-full pointer-events-none z-[100]"
    preserveAspectRatio="none"
  >
    <!-- Flash layer -->
    <rect
      x="0"
      y="0"
      width="100%"
      height="100%"
      fill="white"
      opacity="0"
      style="animation: lightning-flicker 0.35s ease-out"
    />

    <path
      class="lightning-path"
      :d="`M ${startX} -60 L ${midX} ${props.targetY * 0.55} L ${props.targetX} ${props.targetY}`"
      fill="none"
      stroke="white"
      stroke-width="6"
      style="filter: drop-shadow(0 0 20px #615dfa)"
    />

    <circle
      :cx="props.targetX"
      :cy="props.targetY"
      r="30"
      fill="white"
      class="animate-ping opacity-40"
    />
  </svg>
</template>
