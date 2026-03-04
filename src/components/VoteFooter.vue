<script setup lang="ts">
const props = defineProps<{
  fibonacci: readonly string[]
  myVote: string | null
  isRevealed: boolean
}>()

const emit = defineEmits<{ (e: 'pick', val: string): void }>()
</script>

<template>
  <footer class="bg-slate-950/90 border-t border-sky-500/20 p-10 z-[70] relative">
    <div class="max-w-6xl mx-auto flex flex-col gap-8">
      <div class="flex justify-between items-center px-4">
        <div class="flex items-center gap-3">
          <div class="w-1 h-4 bg-sky-500" />
          <h3 class="text-[11px] font-black text-sky-500 uppercase tracking-[0.4em]">Estimación_Fibonacci_Input</h3>
        </div>

        <div
          v-if="props.myVote"
          class="flex items-center gap-2 bg-sky-500/10 px-4 py-1 rounded-full border border-sky-400/30"
        >
          <div class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
          <span class="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">
            Sequence_{{ props.myVote }}_Locked
          </span>
        </div>
      </div>

      <div class="flex flex-wrap justify-center gap-4 md:gap-6">
        <button
          v-for="val in props.fibonacci"
          :key="val"
          :disabled="props.isRevealed"
          class="relative w-16 h-24 md:w-20 md:h-28 rounded-2xl font-black text-2xl md:text-3xl transition-all duration-300 transform"
          :class="[
            props.myVote === val
              ? 'bg-sky-500 text-white -translate-y-8 shadow-[0_30px_70px_-10px_rgba(14,165,233,0.7)] border-2 border-white scale-110'
              : 'bg-slate-900/50 text-slate-500 border border-white/5 hover:border-sky-500 hover:text-white hover:-translate-y-2',
            props.isRevealed ? 'opacity-20 cursor-not-allowed translate-y-0 grayscale' : 'cursor-pointer'
          ]"
          @click="emit('pick', val)"
        >
          <span class="relative z-10">{{ val }}</span>
          <div class="absolute top-2 left-2 text-[10px] opacity-10 font-mono tracking-tighter">HEX_{{ val }}</div>
          <div class="absolute bottom-2 right-2 text-[10px] opacity-10 font-mono rotate-180 tracking-tighter">FIB_{{ val }}</div>
          <div v-if="props.myVote === val" class="absolute inset-0 bg-white/20 animate-pulse rounded-2xl" />
        </button>
      </div>
    </div>
  </footer>
</template>
