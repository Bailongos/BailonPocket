<script setup lang="ts">
import type { MondayItem } from '@/constants/game'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-vue-next'

const props = defineProps<{ show: boolean; item: MondayItem }>()
const emit = defineEmits<{
  (e: 'collapse'): void
  (e: 'expand'): void
  (e: 'next'): void
  (e: 'prev'): void
}>()
</script>

<template>
  <!-- Expanded hologram -->
  <div
    class="absolute top-6 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform"
    :class="props.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-20 opacity-0 scale-95 pointer-events-none'"
  >
    <div class="hologram-effect w-[520px] max-w-[92vw] p-6 rounded-2xl relative overflow-hidden backdrop-blur-md">
      <div class="hologram-line" />

      <div class="flex justify-between items-center mb-3">
        <span
          class="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/30"
        >
          MONDAY_DATA_INPUT
        </span>

        <div class="flex items-center gap-1">
          <button
            class="text-indigo-300 hover:text-white p-1"
            title="Prev"
            @click="emit('prev')"
          >
            <ChevronLeft :size="16" />
          </button>
          <button
            class="text-indigo-300 hover:text-white p-1"
            title="Next"
            @click="emit('next')"
          >
            <ChevronRight :size="16" />
          </button>
          <button class="text-indigo-400 hover:text-white p-1" title="Collapse" @click="emit('collapse')">
            <ChevronUp :size="16" />
          </button>
        </div>
      </div>

      <h3 class="text-lg font-bold text-white mb-2 tracking-tight">
        {{ props.item.name }}
      </h3>
      <p class="text-xs text-indigo-300/70 leading-relaxed italic">
        {{ props.item.text }}
      </p>
      <div class="mt-4 flex justify-between text-[10px] text-indigo-300/60">
        <span>id: {{ props.item.id }}</span>
        <span class="uppercase tracking-widest">stream: active</span>
      </div>
    </div>
  </div>

  <!-- Collapsed pill -->
  <button
    v-if="!props.show"
    class="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest animate-bounce"
    @click="emit('expand')"
  >
    Expand Task Data <ChevronDown class="inline" :size="12" />
  </button>
</template>
