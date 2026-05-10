<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardById, loadAllCards } from '@/lib/cardLoader'
import { getTopic } from '@/data/topics'

const route = useRoute()
const router = useRouter()

const cardId = computed(() => route.params.id as string)
const card = computed(() => getCardById(cardId.value))
const topic = computed(() => (card.value ? getTopic(card.value.topic) : undefined))

// 同主题内的兄弟卡（用于上一张/下一张）
const siblings = computed(() => {
  if (!card.value) return []
  return loadAllCards().filter(c => c.topic === card.value!.topic)
})
const currentIdx = computed(() => siblings.value.findIndex(c => c.id === cardId.value))
const prev = computed(() => (currentIdx.value > 0 ? siblings.value[currentIdx.value - 1] : null))
const next = computed(() =>
  currentIdx.value >= 0 && currentIdx.value < siblings.value.length - 1
    ? siblings.value[currentIdx.value + 1]
    : null
)

const difficultyLabel: Record<number, string> = {
  1: '⭐ 泽泽专属',
  2: '⭐⭐ 双方可抢',
  3: '⭐⭐⭐ 笑笑专属',
  4: '⭐⭐⭐⭐ 挑战题',
}

function goCard(id: string) {
  router.push({ name: 'card', params: { id } })
}

function startStudy() {
  if (!card.value) return
  const topicCards = siblings.value
  const startIdx = topicCards.findIndex(c => c.id === card.value!.id)
  router.push({
    name: 'study',
    params: { topicId: card.value.topic, idx: String(Math.max(0, startIdx)) },
  })
}

function onKey(e: KeyboardEvent) {
  // 不拦截输入框 / 可编辑元素
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  // 修饰键不处理（避免冲突浏览器快捷键）
  if (e.ctrlKey || e.metaKey || e.altKey) return

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'j') {
    if (next.value) {
      e.preventDefault()
      goCard(next.value.id)
    }
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k') {
    if (prev.value) {
      e.preventDefault()
      goCard(prev.value.id)
    }
  } else if (e.key === 'Escape' || e.key === 'Backspace') {
    // 返回主题浏览页
    if (card.value) {
      e.preventDefault()
      router.push({ name: 'topic', params: { id: card.value.topic } })
    }
  }
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div v-if="!card" class="text-center text-slate-400 py-20">
    找不到这张卡片：{{ cardId }}
  </div>

  <div v-else>
    <!-- 顶部面包屑 -->
    <div class="flex items-center gap-2 text-sm text-slate-500 mb-4">
      <RouterLink to="/" class="hover:text-slate-700">主题地图</RouterLink>
      <span>/</span>
      <RouterLink
        :to="{ name: 'topic', params: { id: card.topic } }"
        class="hover:text-slate-700"
      >
        {{ topic?.name ?? card.topic }}
      </RouterLink>
      <span>/</span>
      <span class="text-slate-700">{{ card.title }}</span>
    </div>

    <!-- 主体卡片：克制、宽屏 -->
    <article class="bg-white rounded-xl border border-slate-200 p-8 md:p-12">
      <header class="flex flex-wrap items-start justify-between gap-3 mb-8 pb-6 border-b border-slate-100">
        <div>
          <div class="text-xs text-slate-400 mb-2">
            {{ topic?.name ?? card.topic }} · {{ card.grade_min }}-{{ card.grade_max }} 年级
          </div>
          <h1 class="text-4xl font-bold text-slate-800">{{ card.title }}</h1>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-slate-500 whitespace-nowrap">
            {{ difficultyLabel[card.difficulty] }}
          </span>
          <button
            type="button"
            class="px-3 py-1.5 text-xs bg-slate-800 text-white rounded hover:bg-slate-900 transition shrink-0"
            @click="startStudy"
          >
            🎯 专注模式
          </button>
        </div>
      </header>

      <!-- 正文：放大字号 -->
      <div
        class="prose prose-lg max-w-none prose-headings:text-slate-800 prose-table:text-base"
        v-html="card.bodyHtml"
      ></div>

      <!-- 标签 -->
      <div v-if="card.tags?.length" class="mt-10 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
        <span
          v-for="tag in card.tags"
          :key="tag"
          class="text-xs text-slate-400"
        >
          # {{ tag }}
        </span>
      </div>

      <!-- 例题数量提示 -->
      <div v-if="card.quiz?.length" class="mt-4 text-sm text-slate-500">
        📝 内嵌例题 {{ card.quiz.length }} 道
      </div>
    </article>

    <!-- 上一张 / 下一张 -->
    <nav class="flex items-center justify-between mt-6 gap-3">
      <button
        type="button"
        class="flex-1 text-left bg-white border border-slate-200 rounded-xl p-3 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!prev"
        @click="prev && goCard(prev.id)"
      >
        <div class="text-xs text-slate-400">← 上一张（← / PgUp / k）</div>
        <div class="text-sm font-medium text-slate-700 truncate">
          {{ prev?.title ?? '没有了' }}
        </div>
      </button>
      <button
        type="button"
        class="flex-1 text-right bg-white border border-slate-200 rounded-xl p-3 hover:shadow disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="!next"
        @click="next && goCard(next.id)"
      >
        <div class="text-xs text-slate-400">下一张 → （→ / Space / PgDn / j）</div>
        <div class="text-sm font-medium text-slate-700 truncate">
          {{ next?.title ?? '没有了' }}
        </div>
      </button>
    </nav>

    <!-- 同主题其他卡片 -->
    <section v-if="siblings.length > 1" class="mt-8">
      <h2 class="text-sm text-slate-500 mb-2">本主题全部 {{ siblings.length }} 张</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="s in siblings"
          :key="s.id"
          type="button"
          class="text-xs px-3 py-1 rounded-full border transition"
          :class="s.id === cardId
            ? 'bg-slate-800 text-white border-slate-800'
            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'"
          @click="goCard(s.id)"
        >
          {{ s.topic_order ?? '' }}. {{ s.title }}
        </button>
      </div>
    </section>
  </div>
</template>
