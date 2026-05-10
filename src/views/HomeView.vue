<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { TOPICS } from '@/data/topics'
import { loadAllCards } from '@/lib/cardLoader'

const router = useRouter()
const allCards = loadAllCards()

const topicStats = computed(() =>
  TOPICS.map(t => {
    const cards = allCards.filter(c => c.topic === t.id)
    return {
      ...t,
      count: cards.length,
      d1: cards.filter(c => c.difficulty === 1).length,
      d2: cards.filter(c => c.difficulty === 2).length,
      d3: cards.filter(c => c.difficulty === 3).length,
      d4: cards.filter(c => c.difficulty === 4).length,
    }
  })
)

const totalCount = computed(() => allCards.length)

function browse(topicId: string) {
  router.push({ name: 'topic', params: { id: topicId } })
}

function study(topicId: string, e: Event) {
  e.stopPropagation()
  router.push({ name: 'study', params: { topicId, idx: '0' } })
}
</script>

<template>
  <div>
    <!-- Hero：克制版 -->
    <header class="mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-slate-800 mb-3">
        小学数学概念地图
      </h1>
      <p class="text-slate-500">
        12 个主题 · 当前 {{ totalCount }} 张卡片
      </p>
      <div class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-slate-400">
        <span>⭐ 泽泽专属</span>
        <span>⭐⭐ 双方可抢</span>
        <span>⭐⭐⭐ 笑笑专属</span>
        <span>⭐⭐⭐⭐ 挑战题</span>
      </div>
    </header>

    <!-- 主题列表：单/双列大块，去彩色 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
      <div
        v-for="t in topicStats"
        :key="t.id"
        class="group bg-white border border-slate-200 rounded-xl px-6 py-5 transition-all hover:border-slate-400 hover:shadow-sm cursor-pointer"
        :class="{ 'opacity-50': t.count === 0 }"
        @click="browse(t.id)"
      >
        <div class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-3 mb-1">
              <span class="text-xs text-slate-400 font-mono w-6">{{ String(t.order).padStart(2, '0') }}</span>
              <h2 class="text-xl font-semibold text-slate-800 truncate">{{ t.name }}</h2>
            </div>
            <p class="text-sm text-slate-500 ml-9 truncate">{{ t.description }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <span class="text-xs text-slate-400 font-mono">
              {{ t.count > 0 ? `${t.count} 张` : '尚未录入' }}
            </span>
            <button
              v-if="t.count > 0"
              type="button"
              class="opacity-0 group-hover:opacity-100 transition px-3 py-1.5 text-xs bg-slate-800 text-white rounded hover:bg-slate-900"
              @click="study(t.id, $event)"
            >
              🎯 专注
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
