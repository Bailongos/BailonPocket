<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { X, Loader2, ChevronRight, LayoutGrid, Search } from 'lucide-vue-next'
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
    column_values?: any[]
    updates?: any[]
}

const props = defineProps<{ accessToken: string }>()
const emit = defineEmits<{
    (e: 'close'): void
    (e: 'select-items', items: MondayItem[], boardName: string): void
}>()

const allBoards = ref<MondayBoard[]>([])
const items = ref<MondayItem[]>([])
const selectedBoardName = ref('')
const isLoadingBoards = ref(false)
const isLoadingItems = ref(false)
const step = ref<'boards' | 'items'>('boards')
const searchQuery = ref('')

const boards = computed(() => {
    let filtered = allBoards.value.filter(b =>
        !b.name.startsWith('Subelementos de') && !b.name.startsWith('Subitems of')
    )
    if (searchQuery.value.trim()) {
        const term = searchQuery.value.trim().toLowerCase()
        filtered = filtered.filter(b => b.name.toLowerCase().includes(term))
    }
    return filtered
})

const groupedItems = computed(() => {
    const groups: Record<string, MondayItem[]> = {}
    for (const item of items.value) {
        const groupName = item.group?.title || 'Sin grupo'
        if (!groups[groupName]) groups[groupName] = []
        groups[groupName].push(item)
    }
    return Object.keys(groups).map(name => ({
        name,
        items: groups[name]
    }))
})

onMounted(async () => {
    if (!supabase) return
    isLoadingBoards.value = true
    try {
        const { data, error } = await supabase.functions.invoke('monday-boards', {
            body: { access_token: props.accessToken, action: 'list_boards' }
        })
        if (!error && data?.boards) {
            allBoards.value = data.boards
        }
    } catch (err) {
        console.error('Error loading boards', err)
    }
    isLoadingBoards.value = false
})

async function selectBoard(board: MondayBoard) {
    if (!supabase) return
    isLoadingItems.value = true
    selectedBoardName.value = board.name
    step.value = 'items'
    try {
        const { data, error } = await supabase.functions.invoke('monday-boards', {
            body: { access_token: props.accessToken, action: 'get_items', board_id: board.id }
        })
        console.log('Monday items response:', data)
        if (!error && data?.items) {
            // Procesar descripción y actualizaciones
            items.value = data.items.map((item: any) => {
                let description = ''

                // Mapeo: buscar en column_values la descripción
                if (item.column_values) {
                    const descColumn = item.column_values.find((c: any) =>
                        c.column.title.toLowerCase().includes('description') ||
                        c.column.title.toLowerCase().includes('descripción')
                    )
                    if (descColumn && descColumn.text) {
                        description = descColumn.text
                    }
                }

                // Si no hay descripción en las columnas, usar el último update
                if (!description && item.updates && item.updates.length > 0) {
                    // Remover tags HTML del update body
                    description = item.updates[0].text_body.replace(/<[^>]*>?/gm, '')
                }

                return {
                    ...item,
                    description: description.slice(0, 300) + (description.length > 300 ? '...' : '')
                }
            })
        }
    } catch (err) {
        console.error('Error fetching items', err)
    }
    isLoadingItems.value = false
}

function confirmSelection(groupItems?: MondayItem[], groupName?: string) {
    if (groupItems && groupItems.length > 0) {
        emit('select-items', groupItems, `${selectedBoardName.value} - ${groupName}`)
    } else {
        emit('select-items', items.value, selectedBoardName.value)
    }
}

function goBack() {
    step.value = 'boards'
    items.value = []
    selectedBoardName.value = ''
}

</script>

<template>
    <div class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div
            class="w-[560px] max-w-[95vw] max-h-[80vh] bg-slate-950 border border-sky-500/30 rounded-3xl shadow-[0_0_80px_rgba(14,165,233,0.15)] flex flex-col overflow-hidden">

            <!-- Header -->
            <div class="px-6 py-4 border-b border-white/10">
                <div class="flex items-center justify-between mb-3">
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

                <!-- Search — filtra localmente, cero peticiones -->
                <div v-if="step === 'boards'" class="relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" :size="16" />
                    <input v-model="searchQuery" type="text" placeholder="Buscar tablero..."
                        class="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-sky-500/50 transition-colors placeholder:text-slate-600 font-mono" />
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">

                <div v-if="(step === 'boards' && isLoadingBoards) || (step === 'items' && isLoadingItems)"
                    class="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 class="text-sky-400 animate-spin" :size="32" />
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        {{ step === 'boards' ? 'Cargando tableros de Monday...' : 'Cargando items...' }}
                    </p>
                </div>

                <!-- Board List -->
                <template v-if="step === 'boards' && !isLoadingBoards">
                    <button v-for="board in boards" :key="board.id" @click="selectBoard(board)"
                        class="w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all group text-left">
                        <div class="min-w-0 flex-1">
                            <p class="text-white font-bold text-sm group-hover:text-sky-300 transition-colors truncate">
                                {{
                                    board.name }}</p>
                            <p class="text-slate-500 text-[10px] mt-1">{{ board.items_count }} items</p>
                        </div>
                        <ChevronRight
                            class="text-slate-600 group-hover:text-sky-400 transition-colors flex-shrink-0 ml-2"
                            :size="18" />
                    </button>

                    <p v-if="boards.length === 0 && searchQuery" class="text-slate-500 text-center text-xs py-8">
                        No hay tableros que coincidan con "<span class="text-sky-400">{{ searchQuery }}</span>"
                    </p>
                </template>

                <!-- Item List -->
                <template v-if="step === 'items' && !isLoadingItems">
                    <div v-for="group in groupedItems" :key="group.name" class="mb-4">
                        <div
                            class="sticky top-0 bg-slate-950/90 backdrop-blur-md z-10 py-2 mb-2 border-b border-white/5 flex items-center justify-between">
                            <h3 class="text-indigo-400 font-bold text-xs uppercase tracking-widest pl-2">
                                {{ group.name }} <span class="text-slate-500 normal-case font-normal ml-1">({{
                                    group.items.length }})</span>
                            </h3>
                            <button @click="confirmSelection(group.items, group.name)"
                                class="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500 hover:text-slate-900 border border-sky-500/30 text-sky-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                                Importar {{ group.items.length }}
                            </button>
                        </div>
                        <div class="space-y-2">
                            <div v-for="item in group.items" :key="item.id"
                                class="p-3 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/60 transition-colors">
                                <p class="text-white text-sm font-semibold">{{ item.name }}</p>
                            </div>
                        </div>
                    </div>

                    <p v-if="items.length === 0" class="text-slate-600 text-center text-xs py-8">
                        Este tablero no tiene items
                    </p>
                </template>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 border-t border-white/10 flex justify-between items-center">
                <button v-if="step === 'items'" @click="goBack"
                    class="text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                    ← Regresar
                </button>
                <div v-else class="text-slate-600 text-[10px]">{{ boards.length }} tableros encontrados</div>

                <button v-if="step === 'items' && items.length > 0" @click="confirmSelection()"
                    class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                    Importar Todo el Tablero ({{ items.length }})
                </button>
            </div>
        </div>
    </div>
</template>
