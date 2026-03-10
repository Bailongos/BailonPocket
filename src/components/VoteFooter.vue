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
  <footer class="h-32 bg-[#0a0b14] border-t border-slate-800 p-4 relative z-[70] transition-colors duration-1000"
    :class="props.theme.border">
    <!-- Estimation Input Label -->
    <div
      class="absolute -top-3 left-6 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] font-bold text-slate-400 tracking-widest uppercase">
      Estimation_Input
    </div>

    <div
      class="max-w-7xl mx-auto h-full flex items-center justify-center gap-2 md:gap-3 overflow-y-auto md:overflow-visible hide-scrollbar pt-2">
      <button v-for="val in props.fibonacci" :key="val" :disabled="props.isRevealed" @click="emit('pick', val)"
        class="group relative h-16 w-12 md:h-20 md:w-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-300 transform shrink-0"
        :class="[
          props.myVote === val
            ? 'bg-cyan-500 border-cyan-300 -translate-y-4 shadow-[0_15px_30px_rgba(6,182,212,0.4)]'
            : 'bg-slate-900/50 border-slate-800 hover:border-cyan-500/50 hover:-translate-y-2',
          props.isRevealed ? 'opacity-20 cursor-not-allowed translate-y-0 grayscale' : 'cursor-pointer'
        ]">
        <span class="text-lg md:text-xl font-black font-mono transition-colors"
          :class="props.myVote === val ? 'text-black' : 'text-slate-400 group-hover:text-cyan-400'">
          {{ val }}
        </span>
        <div v-if="props.myVote === val" class="absolute -bottom-1 w-6 h-1 bg-white rounded-full" />
      </button>
    </div>
  </footer>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
