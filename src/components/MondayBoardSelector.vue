<script setup lang="ts">
import { ref } from 'vue'
import { X, Loader2, ChevronRight, LayoutGrid } from 'lucide-vue-next'
import { supabase } from '@/lib/supabase'

interface MondayBoard {
    id: string
    name: string
    description: string | null
    items_count: number
}

interface MondayItem {
    id: string
    name: string
    group?: { title: string }
}

const props = defineProps<{ accessToken: string }>()
const emit = defineEmits<{
    (e: 'close'): void
    (e: 'select-items', items: MondayItem[], boardName: string): void
}>()

const boards = ref<MondayBoard[]>([])
const items = ref<MondayItem[]>([])
const selectedBoardName = ref('')
const isLoadingBoards = ref(false)
const isLoadingItems = ref(false)
const step = ref<'boards' | 'items'>('boards')

async function fetchBoards() {
    if (!supabase) return
    isLoadingBoards.value = true
    try {
        const { data, error } = await supabase.functions.invoke('monday-boards', {
            body: { access_token: props.accessToken, action: 'list_boards' }
        })
        if (!error && data?.boards) {
            boards.value = data.boards
        }
    } catch (err) {
        console.error('Error fetching boards', err)
    }
    isLoadingBoards.value = false
}

async function selectBoard(board: MondayBoard) {
    if (!supabase) return
    isLoadingItems.value = true
    selectedBoardName.value = board.name
    step.value = 'items'
    try {
        const { data, error } = await supabase.functions.invoke('monday-boards', {
            body: { access_token: props.accessToken, action: 'get_items', board_id: board.id }
        })
        if (!error && data?.items) {
            items.value = data.items
        }
    } catch (err) {
        console.error('Error fetching items', err)
    }
    isLoadingItems.value = false
}

function confirmSelection() {
    emit('select-items', items.value, selectedBoardName.value)
}

function goBack() {
    step.value = 'boards'
    items.value = []
    selectedBoardName.value = ''
}

// Cargar tableros al montar
fetchBoards()
</script>

<template>
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div
            class="w-[560px] max-w-[95vw] max-h-[80vh] bg-slate-950 border border-sky-500/30 rounded-3xl shadow-[0_0_80px_rgba(14,165,233,0.15)] flex flex-col overflow-hidden">

            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div class="flex items-center gap-3">
                    <LayoutGrid class="text-indigo-400" :size="20" />
                    <h2 class="text-white font-black text-sm uppercase tracking-widest">
                        {{ step === 'boards' ? 'Seleccionar Tablero' : selectedBoardName }}
                    </h2>
                </div>
                <button @click="emit('close')" class="text-slate-500 hover:text-white transition-colors">
                    <X :size="20" />
                </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">

                <!-- Loading -->
                <div v-if="(step === 'boards' && isLoadingBoards) || (step === 'items' && isLoadingItems)"
                    class="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 class="text-sky-400 animate-spin" :size="32" />
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {{ step === 'boards' ? 'Cargando tableros de Monday...' : 'Importando items...' }}
                    </p>
                </div>

                <!-- Board List -->
                <template v-if="step === 'boards' && !isLoadingBoards">
                    <button v-for="board in boards" :key="board.id" @click="selectBoard(board)"
                        class="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group text-left">
                        <div>
                            <p class="text-white font-bold text-sm group-hover:text-sky-300 transition-colors">{{
                                board.name }}</p>
                            <p class="text-slate-500 text-[10px] mt-1">{{ board.items_count }} items</p>
                        </div>
                        <ChevronRight class="text-slate-600 group-hover:text-sky-400 transition-colors" :size="18" />
                    </button>

                    <p v-if="boards.length === 0" class="text-slate-600 text-center text-xs py-8">
                        No se encontraron tableros en tu cuenta de Monday.com
                    </p>
                </template>

                <!-- Item List -->
                <template v-if="step === 'items' && !isLoadingItems">
                    <div v-for="item in items" :key="item.id"
                        class="p-3 rounded-xl border border-white/5 bg-slate-900/40">
                        <p class="text-white text-sm font-semibold">{{ item.name }}</p>
                        <p v-if="item.group" class="text-indigo-400/60 text-[10px] mt-1 font-bold uppercase">{{
                            item.group.title }}</p>
                    </div>

                    <p v-if="items.length === 0" class="text-slate-600 text-center text-xs py-8">
                        Este tablero no tiene items
                    </p>
                </template>
            </div>

            <!-- Footer Actions -->
            <div class="px-6 py-4 border-t border-white/10 flex justify-between items-center">
                <button v-if="step === 'items'" @click="goBack"
                    class="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                    ← Regresar
                </button>
                <span v-else></span>

                <button v-if="step === 'items' && items.length > 0" @click="confirmSelection"
                    class="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    Importar {{ items.length }} Items
                </button>
            </div>
        </div>
    </div>
</template>
