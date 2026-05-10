<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Card } from '@/types'
import { getTopic } from '@/data/topics'

const props = defineProps<{
  card: Card
}>()

const router = useRouter()
const topic = getTopic(props.card.topic)

function openDetail() {
  router.push({ name: 'card', params: { id: props.card.id } })
}

const difficultyLabel: Record<number, string> = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
}

const difficultyAudience: Record<number, string> = {
  1: '泽泽专属',
  2: '双方可抢',
  3: '笑笑专属',
  4: '挑战题',
}
</script>

<template>
  <div
    class="group cursor-pointer bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-sm transition-all p-6 flex flex-col"
    @click="openDetail"
  >
    <!-- 主题 + 难度 -->
    <div class="flex items-start justify-between mb-4 text-xs text-slate-400">
      <span>{{ topic?.name ?? card.topic }}</span>
      <span :title="difficultyAudience[card.difficulty]">
        {{ difficultyLabel[card.difficulty] }}
      </span>
    </div>

    <!-- 标题（大） -->
    <h3 class="text-2xl font-semibold text-slate-800 mb-3">{{ card.title }}</h3>

    <!-- 预览（克制） -->
    <p class="flex-1 text-sm text-slate-500 leading-relaxed line-clamp-4 mb-4">
      {{ card.body.replace(/[#*`>\[\]()|\-]/g, '').replace(/\s+/g, ' ').slice(0, 140) }}
    </p>

    <!-- 底部 -->
    <div class="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-100">
      <span>{{ card.grade_min }}-{{ card.grade_max }} 年级</span>
      <span class="text-slate-400 group-hover:text-slate-700 transition">
        阅读 →
      </span>
    </div>
  </div>
</template>
