<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FilterBar from '@/components/FilterBar.vue'
import CardGrid from '@/components/CardGrid.vue'
import { filterCards } from '@/lib/cardLoader'
import { getTopic } from '@/data/topics'
import { useGamepad } from '@/lib/useGamepad'

const route = useRoute()
const router = useRouter()

const selectedTopic = ref<string>(typeof route.params.id === 'string' ? route.params.id : '')
const selectedDifficulties = ref<number[]>([])
const searchText = ref('')

watch(
  () => route.params.id,
  (id) => {
    selectedTopic.value = typeof id === 'string' ? id : ''
    focusedIdx.value = 0
  }
)

const cards = computed(() =>
  filterCards({
    topic: selectedTopic.value || undefined,
    difficulty: selectedDifficulties.value.length ? selectedDifficulties.value : undefined,
    searchText: searchText.value || undefined,
  })
)

const currentTopic = computed(() =>
  selectedTopic.value ? getTopic(selectedTopic.value) : null
)

function startStudy(startIdx = 0) {
  if (!selectedTopic.value) return
  router.push({ name: 'study', params: { topicId: selectedTopic.value, idx: String(startIdx) } })
}

// === 手柄导航 ===
const focusedIdx = ref(0)
const showFocus = ref(false)

function colsNow(): number {
  if (typeof window === 'undefined') return 1
  // 与 CardGrid 保持一致：grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 640) return 2
  return 1
}

function move(delta: number) {
  showFocus.value = true
  const len = cards.value.length
  if (len === 0) return
  focusedIdx.value = Math.max(0, Math.min(len - 1, focusedIdx.value + delta))
  scrollFocusIntoView()
}
function scrollFocusIntoView() {
  nextTick(() => {
    const el = document.querySelector(
      `[data-card-idx="${focusedIdx.value}"]`
    ) as HTMLElement | null
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}
function openCard(idx: number) {
  const c = cards.value[idx]
  if (!c) return
  router.push({ name: 'card', params: { id: c.id } })
}

const { connected: padConnected } = useGamepad({
  onAction: a => {
    const len = cards.value.length
    if (len === 0) {
      if (a === 'exit') router.push({ name: 'home' })
      return
    }
    if (a === 'left') move(-1)
    else if (a === 'right') move(1)
    else if (a === 'up') move(-colsNow())
    else if (a === 'down') move(colsNow())
    else if (a === 'page_up') move(-colsNow() * 3)
    else if (a === 'page_down') move(colsNow() * 3)
    else if (a === 'confirm') {
      showFocus.value = true
      openCard(focusedIdx.value)
    } else if (a === 'menu' || a === 'aux') {
      // Y / X 直接进入专注模式，从当前 focused 卡开始
      showFocus.value = true
      startStudy(focusedIdx.value)
    } else if (a === 'cancel' || a === 'exit') {
      router.push({ name: 'home' })
    }
  },
})

// 切换难度/搜索时若 focusedIdx 越界则归零
watch(cards, list => {
  if (focusedIdx.value >= list.length) focusedIdx.value = 0
})
</script>

<template>
  <div>
    <!-- 标题 -->
    <header class="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 v-if="currentTopic" class="text-3xl font-bold text-slate-800">{{ currentTopic.name }}</h1>
        <h1 v-else class="text-3xl font-bold text-slate-800">全部卡片</h1>
        <p v-if="currentTopic" class="text-sm text-slate-500 mt-1">{{ currentTopic.description }}</p>
        <p class="text-xs text-slate-400 mt-1">
          {{ cards.length }} 张
          <span v-if="padConnected" class="ml-2 text-emerald-500" title="手柄已连接 — D-pad 选卡 · A 详情 · Y 进入专注">
            🎮
          </span>
        </p>
      </div>
      <button
        v-if="currentTopic && cards.length > 0"
        type="button"
        class="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-900 transition shrink-0"
        @click="startStudy(0)"
      >
        🎯 进入专注模式
      </button>
    </header>

    <FilterBar
      v-model:selectedTopic="selectedTopic"
      v-model:selectedDifficulties="selectedDifficulties"
      v-model:searchText="searchText"
    />

    <CardGrid
      :cards="cards"
      :focused-idx="focusedIdx"
      :show-focus="showFocus"
      @focus="i => { focusedIdx = i; showFocus = false }"
    />
  </div>
</template>
