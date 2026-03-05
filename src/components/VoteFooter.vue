<script setup lang="ts">
import type { ThemeConfig } from '@/constants/themes'

const props = defineProps<{
  fibonacci: readonly string[]
  myVote: string | null
  isRevealed: boolean
  theme: ThemeConfig
}>()

const emit = defineEmits<{ (e: 'pick', val: string): void }>()
</script>

<template>
  <footer
    class="bg-slate-950/90 border-t py-6 px-4 md:py-10 z-[70] relative w-full overflow-hidden transition-colors duration-1000"
    :class="props.theme.border">
    <div class="w-full max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
      <div class="flex justify-between items-center px-2 md:px-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-4 transition-colors duration-1000"
            :class="[props.theme.background.replace('bg-', 'bg-'), props.theme.border.replace('border-', 'bg-')]" />
          <h3 class="text-[11px] font-black uppercase tracking-[0.4em] transition-colors duration-1000"
            :class="props.theme.textSecondary">Estimación_Fibonacci_Input</h3>
        </div>

        <div v-if="props.myVote"
          class="flex items-center gap-2 px-4 py-1 rounded-full border transition-all duration-1000"
          :class="[props.theme.border, props.theme.textPrimary]">
          <div class="w-1.5 h-1.5 rounded-full animate-ping transition-colors duration-1000"
            :class="props.theme.border.replace('border-', 'bg-')" />
          <span class="text-[10px] font-black uppercase tracking-widest italic transition-colors duration-1000"
            :class="props.theme.textSecondary">
            Sequence_{{ props.myVote }}_Locked
          </span>
        </div>
      </div>

      <!-- Layout de wrapping universal para no depender de scroll -->
      <div class="flex flex-wrap items-center justify-center gap-2 md:gap-4 px-2 md:px-0 pb-6 md:pb-0 pt-2 shrink-0">
        <button v-for="val in props.fibonacci" :key="val" :disabled="props.isRevealed"
          class="relative w-12 h-16 md:w-16 md:h-24 rounded-2xl font-black text-lg md:text-2xl transition-all duration-300 transform"
          :class="[
            props.myVote === val
              ? `${props.theme.cardVoted} text-white -translate-y-8 scale-110`
              : `${props.theme.cardIdle} text-slate-500 hover:text-white hover:-translate-y-2 hover:${props.theme.border}`,
            props.isRevealed ? 'opacity-20 cursor-not-allowed translate-y-0 grayscale' : 'cursor-pointer'
          ]" @click="emit('pick', val)">
          <span class="relative z-10">{{ val }}</span>
          <div class="absolute top-2 left-2 text-[10px] opacity-10 font-mono tracking-tighter pointer-events-none">
            HEX_{{ val }}</div>
          <div
            class="absolute bottom-2 right-2 text-[10px] opacity-10 font-mono rotate-180 tracking-tighter pointer-events-none">
            FIB_{{ val }}</div>
          <div v-if="props.myVote === val"
            class="absolute inset-0 bg-white/20 animate-pulse rounded-2xl pointer-events-none" />
        </button>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Ocultar barra de scroll para WebKit */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Ocultar barra de scroll para Firefox e IE */
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
