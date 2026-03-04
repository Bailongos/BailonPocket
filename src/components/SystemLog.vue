<script setup lang="ts">
import { Database } from 'lucide-vue-next'
import type { ChatMessage } from '@/types'

const props = defineProps<{ messages: ChatMessage[] }>()
</script>

<template>
  <div class="cyber-border p-4 bg-slate-900/20 w-full">
    <h3 class="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-4 flex items-center gap-2">
      <Database :size="12" /> System_Log
    </h3>

    <div class="space-y-4">
      <div
        v-for="msg in props.messages"
        :key="msg.id"
        class="text-[11px] leading-relaxed border-l-2 pl-3 slide-in-from-left"
        :style="{ borderColor: msg.color }"
      >
        <span class="font-bold block uppercase" :style="{ color: msg.color }">{{ msg.name }}:</span>
        <span class="text-slate-400 italic">"{{ msg.text }}"</span>
      </div>

      <p v-if="props.messages.length === 0" class="text-[10px] text-slate-700 italic">
        Waiting for neural link signals...
      </p>
    </div>
  </div>
</template>
