<script setup lang="ts">
import { Play, Save, RefreshCw, CheckCircle2, Lock, Eye, Loader2 } from 'lucide-vue-next'
import { computed } from 'vue'
import type { Participant, Stats } from '@/types'

const props = defineProps<{
    participants: Participant[]
    isRevealed: boolean
    isSyncing: boolean
    stats: Stats
}>()

const emit = defineEmits<{
    (e: 'reveal-toggle'): void
    (e: 'sync-monday'): void
}>()

// Heuristica para inferir el género basado en el nombre (útil para nombres en Español/Inglés)
function guessGender(name: string): 'female' | 'male' | 'unknown' {
    const firstName = name.trim().split(' ')[0].toLowerCase()

    // Nombres específicamente listados por el usuario
    const waifuFemale = ['miku', 'sakura', 'hinata', 'rin', 'yuki']
    const waifuMale = ['jack', 'kaito', 'hiro', 'zoro', 'kenji']

    const femaleNames = [...waifuFemale, 'maria', 'ana', 'sofia', 'lucia', 'carmen', 'elena', 'laura', 'marta', 'andrea', 'diana', 'patricia', 'claudia', 'beatriz', 'sandra', 'natalia', 'paula', 'rosa', 'raquel', 'silvia', 'alejandra', 'lorena', 'monica', 'juana', 'margarita', 'teresa', 'liz', 'mary', 'sarah', 'jessica']
    const maleNames = [...waifuMale, 'jose', 'luis', 'carlos', 'juan', 'manuel', 'pedro', 'jesus', 'miguel', 'antonio', 'javier', 'david', 'alejandro', 'daniel', 'jorge', 'victor', 'diego', 'sergio', 'pablo', 'raul', 'hector', 'fernando', 'ricardo', 'roberto']

    if (femaleNames.includes(firstName)) return 'female'
    if (maleNames.includes(firstName)) return 'male'

    const lastChar = firstName.slice(-1)
    if (['a', 'y', 'i'].includes(lastChar)) return 'female'
    if (['o', 'os', 'or', 'n', 'd', 's', 'r', 'l'].some(end => firstName.endsWith(end))) return 'male'

    return 'unknown' // fallback
}

// Helper to get initials
function getInitials(name: string) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}

// Generate Avatar using Dicebear with forced properties based on inferred gender
function getAvatarUrl(seed: string) {
    const gender = guessGender(seed)
    const encodedSeed = encodeURIComponent(seed)

    if (gender === 'female') {
        // Femenino (Avataaars)
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodedSeed}`
    } else if (gender === 'male') {
        // Masculino (Adventurer)
        return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodedSeed}`
    } else {
        // Fallback a Robohash
        let hash = 0
        for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i)
        const setNum = (hash % 3) + 1
        return `https://robohash.org/${encodedSeed}?set=set${setNum}`
    }
}

// El usuario solicitó cambiar a vista compacta si son muchos participantes (ej: > 5)
const isCompact = computed(() => props.participants.length > 5)
</script>

<template>
    <div class="bg-[#0f111a] border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col h-full font-sans max-h-full">
        <h3 class="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 mb-6 flex items-center gap-2 shrink-0">
            <Eye class="w-4 h-4 text-cyan-400" /> Current_Votes
        </h3>

        <!-- Lista principal de votos -->
        <div class="flex-1 overflow-y-auto pr-2 hide-scrollbar"
            :class="isCompact ? 'flex flex-wrap gap-2 content-start' : 'space-y-3'">

            <div v-for="member in props.participants" :key="member.id"
                class="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 rounded-xl transition-all duration-300 relative"
                :class="isCompact ? 'p-2 flex flex-col items-center justify-center w-[72px] h-[100px] shrink-0 cursor-help' : 'p-3 flex items-center justify-between'">

                <!-- Compact Hover Name Tooltip -->
                <div v-if="isCompact"
                    class="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex z-50 pointer-events-none flex-col items-center gap-1">
                    <div
                        class="bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/10 text-center">
                        <div>{{ member.name }}</div>
                        <div class="text-[9px] text-cyan-400 font-mono mt-0.5">{{ member.role }}</div>
                    </div>
                </div>

                <!-- Info Box (Avatar + Name/Initials) -->
                <div :class="isCompact ? 'flex flex-col items-center gap-1.5 w-full' : 'flex items-center gap-3'">
                    <div class="relative group-hover:z-10 transition-transform group-hover:scale-105">
                        <img :src="getAvatarUrl(member.name)" :alt="member.name"
                            class="rounded-lg bg-slate-800 transition-colors"
                            :class="isCompact ? 'w-10 h-10' : 'w-10 h-10'" />
                        <div v-if="member.hasVoted"
                            class="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full border-2 border-[#0f111a] p-0.5"
                            :class="isCompact ? 'border-[1px]' : 'border-2'">
                            <CheckCircle2 class="text-white" :class="isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5'" />
                        </div>
                    </div>

                    <div v-if="!isCompact">
                        <div class="text-sm font-bold text-slate-200">{{ member.name }}</div>
                        <div class="text-[10px] text-cyan-500/80 font-mono tracking-wider font-semibold mb-0.5">{{
                            member.role }}</div>
                        <div class="text-[9px] text-slate-500 font-mono tracking-wider">
                            {{ member.hasVoted ? 'VOTE_SUBMITTED' : 'IDLE' }}
                        </div>
                    </div>
                    <div v-else class="text-center w-full">
                        <div
                            class="text-[9px] font-bold text-slate-400 block truncate group-hover:text-white transition-colors">
                            {{ getInitials(member.name) }}
                        </div>
                    </div>
                </div>

                <!-- Display Vote Value or Status Icon -->
                <div class="rounded-lg border flex items-center justify-center font-mono font-bold transition-all"
                    :class="[
                        isCompact ? 'w-full h-5 mt-1 text-[10px]' : 'w-10 h-10',
                        member.hasVoted
                            ? (props.isRevealed
                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400')
                            : 'bg-slate-900 border-slate-700 text-slate-600'
                    ]">
                    <RefreshCw v-if="!member.hasVoted" class="animate-spin-slow opacity-20"
                        :class="isCompact ? 'w-3 h-3' : 'w-4 h-4'" />
                    <span v-else-if="props.isRevealed" :class="isCompact ? 'text-[11px]' : ''">{{ member.vote }}</span>
                    <Lock v-else :class="isCompact ? 'w-3 h-3' : 'w-4 h-4'" />
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 space-y-3 shrink-0">
            <button @click="emit('reveal-toggle')"
                class="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-[0_10px_30px_rgba(8,145,178,0.2)]">
                <RefreshCw v-if="props.isRevealed" class="w-4 h-4" />
                <Play v-else class="w-4 h-4" />
                {{ props.isRevealed ? 'Reset Votes' : 'Reveal All Cards' }}
            </button>

            <button v-if="props.isRevealed" @click="emit('sync-monday')" :disabled="props.isSyncing"
                class="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl transition-all disabled:opacity-50">
                <Loader2 v-if="props.isSyncing" class="w-4 h-4 animate-spin" />
                <Save v-else class="w-4 h-4" />
                {{ props.isSyncing ? 'Sincronizando...' : 'Save Avg to Monday.com' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
@keyframes spin-slow {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.animate-spin-slow {
    animation: spin-slow 8s linear infinite;
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
