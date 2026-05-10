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

function go(topicId: string) {
  router.push({ name: 'topic', params: { id: topicId } })
}
</script>

<template>
  <div>
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow">
      <h1 class="text-3xl font-bold mb-2">小学数学概念地图</h1>
      <p class="text-blue-100 text-sm">
        共 12 个主题 · 当前 {{ totalCount }} 张卡片 · 投屏到电视抢答用
      </p>
      <div class="mt-3 flex flex-wrap gap-3 text-xs">
        <span class="bg-white/20 px-2 py-1 rounded">⭐ 泽泽专属</span>
        <span class="bg-white/20 px-2 py-1 rounded">⭐⭐ 双方可抢</span>
        <span class="bg-white/20 px-2 py-1 rounded">⭐⭐⭐ 笑笑专属</span>
        <span class="bg-white/20 px-2 py-1 rounded">⭐⭐⭐⭐ 挑战题</span>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="t in topicStats"
        :key="t.id"
        type="button"
        class="text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow"
        :class="{ 'opacity-60': t.count === 0 }"
        @click="go(t.id)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-slate-400">主题 {{ t.order }}</span>
          <span class="text-xs text-slate-500">{{ t.count }} 张卡片</span>
        </div>
        <h2 class="text-lg font-bold text-slate-800 mb-1">{{ t.name }}</h2>
        <p class="text-sm text-slate-500 mb-3">{{ t.description }}</p>
        <div class="flex gap-2 text-xs">
          <span v-if="t.d1" class="text-emerald-600">⭐×{{ t.d1 }}</span>
          <span v-if="t.d2" class="text-blue-600">⭐⭐×{{ t.d2 }}</span>
          <span v-if="t.d3" class="text-amber-600">⭐⭐⭐×{{ t.d3 }}</span>
          <span v-if="t.d4" class="text-red-600">⭐⭐⭐⭐×{{ t.d4 }}</span>
          <span v-if="t.count === 0" class="text-slate-400">（尚未录入）</span>
        </div>
      </button>
    </div>
  </div>
</template>
