<script setup lang="ts">
import type { Reaction } from '@/types'

defineProps<{
    reactions: Reaction[]
}>()

const EMOTES = ['🔥', '👍', '❤️', '🤡', '🚀', '👀']

const emit = defineEmits<{
    (e: 'fire', emoji: string): void
}>()
</script>

<template>
    <div class="absolute inset-0 pointer-events-none z-[100] overflow-hidden">
        <!-- Emojis flotantes -->
        <div v-for="r in reactions" :key="r.id" class="absolute bottom-20 text-4xl animate-float-up opacity-0"
            :style="{ left: `${r.x}%` }">
            {{ r.emoji }}
        </div>

        <!-- Barra de interacción (pointer-events-auto para que sí reciba clics) -->
        <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex gap-2 bg-black/60 p-2 rounded-full border border-white/10 backdrop-blur-md">
            <button v-for="e in EMOTES" :key="e" @click="emit('fire', e)"
                class="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center text-xl transition-transform active:scale-75">
                {{ e }}
            </button>
        </div>
    </div>
</template>

<style>
@keyframes float-up {
    0% {
        transform: translateY(0) scale(0.5);
        opacity: 0;
    }

    20% {
        opacity: 1;
        transform: translateY(-20px) scale(1.2);
    }

    100% {
        transform: translateY(-150px) scale(1);
        opacity: 0;
    }
}

.animate-float-up {
    animation: float-up 2.5s ease-out forwards;
}
</style>
