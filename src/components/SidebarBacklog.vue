<script setup lang="ts">
import { computed } from 'vue'
import { LayoutList, CheckCircle2, Circle } from 'lucide-vue-next'

interface MondayTicket {
    id: string
    name: string
    group?: { title: string }
}

const props = defineProps<{
    tickets: MondayTicket[]
    currentIndex: number
    themeClass?: string
}>()

const emit = defineEmits<{
    (e: 'select', index: number): void
}>()

// Agrupar tickets por su 'group.title' de Monday
const groupedTickets = computed(() => {
    const groups: Record<string, { ticket: MondayTicket, index: number }[]> = {}

    props.tickets.forEach((ticket, index) => {
        const groupName = ticket.group?.title || 'Backlog General'
        if (!groups[groupName]) {
            groups[groupName] = []
        }
        groups[groupName].push({ ticket, index })
    })

    return groups
})
</script>

<template>
    <aside
        class="w-80 h-full flex flex-col bg-slate-950/80 backdrop-blur-3xl border-r border-white/5 shadow-2xl transition-all duration-300 z-40 hidden md:flex font-sans isolate"
        :class="themeClass">

        <!-- Header del Sidebar -->
        <div class="px-6 py-6 border-b border-white/5 bg-slate-900/40 relative overflow-hidden">
            <!-- Glow effect -->
            <div
                class="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4">
            </div>

            <div class="flex items-center gap-3 relative z-10">
                <div
                    class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <LayoutList :size="20" />
                </div>
                <div>
                    <h2 class="text-white font-black tracking-tight text-lg">Sprint Backlog</h2>
                    <p class="text-xs text-slate-400 font-medium">{{ tickets.length }} Items Listos</p>
                </div>
            </div>
        </div>

        <!-- Lista de Tickets Agrupados -->
        <div class="flex-1 overflow-y-auto w-full p-4 hide-scrollbar">
            <div v-for="(items, groupName) in groupedTickets" :key="groupName" class="mb-8 last:mb-0">

                <!-- Group Header -->
                <h3
                    class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 px-2 flex items-center gap-2">
                    {{ groupName }}
                    <span class="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[9px]">{{ items.length }}</span>
                </h3>

                <!-- Items in Group -->
                <div class="flex flex-col gap-2">
                    <button v-for="item in items" :key="item.ticket.id" @click="emit('select', item.index)"
                        class="group text-left p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden"
                        :class="[
                            item.index === currentIndex
                                ? 'bg-sky-500/10 border-sky-500/30 shadow-[0_4px_20px_rgba(14,165,233,0.15)]'
                                : 'bg-slate-900/40 border-transparent hover:bg-slate-800/60 hover:border-white/5'
                        ]">
                        <!-- Active Indicator Glow -->
                        <div v-if="item.index === currentIndex"
                            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sky-400 rounded-r-full shadow-[0_0_10px_#38bdf8]">
                        </div>

                        <div class="flex max-w-full items-start gap-3 pl-1">
                            <div class="mt-0.5 shrink-0 text-slate-600 transition-colors"
                                :class="item.index === currentIndex ? 'text-sky-400' : 'group-hover:text-slate-400'">
                                <CheckCircle2 v-if="item.index < currentIndex" :size="16" class="text-emerald-500/50" />
                                <Circle v-else :size="16" class="opacity-50" />
                            </div>

                            <div class="flex-1 min-w-0 pr-2">
                                <p class="text-sm font-semibold truncate transition-colors leading-tight"
                                    :class="item.index === currentIndex ? 'text-white' : 'text-slate-300 group-hover:text-white'">
                                    {{ item.ticket.name }}
                                </p>
                                <div class="flex gap-2 mt-1.5 opacity-60">
                                    <span class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">#{{
                                        item.ticket.id.slice(-6) }}</span>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>

    </aside>
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
