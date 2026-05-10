<script setup lang="ts">
import { ref } from 'vue'
import type { Card } from '@/types'
import { getTopic } from '@/data/topics'

const props = defineProps<{
  card: Card
  flippable?: boolean
}>()

const flipped = ref(false)
const topic = getTopic(props.card.topic)

function toggleFlip() {
  if (props.flippable !== false) flipped.value = !flipped.value
}

const difficultyClass: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  2: 'bg-blue-100 text-blue-700 border-blue-300',
  3: 'bg-amber-100 text-amber-700 border-amber-300',
  4: 'bg-red-100 text-red-700 border-red-300',
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
  <div class="card-flip h-72 cursor-pointer" @click="toggleFlip">
    <div class="card-inner h-full" :class="{ flipped }">
      <!-- 正面 -->
      <div class="card-face absolute inset-0 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-slate-200 p-5 flex flex-col">
        <div class="flex items-start justify-between mb-3">
          <span class="text-xs font-medium text-slate-500">{{ topic?.name ?? card.topic }}</span>
          <span
            class="text-xs px-2 py-0.5 rounded-full border"
            :class="difficultyClass[card.difficulty]"
            :title="difficultyAudience[card.difficulty]"
          >
            {{ difficultyLabel[card.difficulty] }}
          </span>
        </div>

        <h3 class="text-2xl font-bold text-slate-800 mb-2">{{ card.title }}</h3>

        <div class="flex-1 overflow-hidden text-sm text-slate-600 line-clamp-5">
          {{ card.body.replace(/[#*`>\[\]()]/g, '').slice(0, 200) }}
        </div>

        <div class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="tag in card.tags.slice(0, 4)"
            :key="tag"
            class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
          >
            {{ tag }}
          </span>
        </div>

        <div class="mt-2 text-xs text-slate-400 flex justify-between items-center">
          <span>{{ card.grade_min }}-{{ card.grade_max }} 年级</span>
          <span class="text-slate-400">点击翻面 →</span>
        </div>
      </div>

      <!-- 背面（详细） -->
      <div class="card-back card-face absolute inset-0 bg-slate-800 text-slate-100 rounded-xl shadow-md p-5 flex flex-col overflow-y-auto">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-xl font-bold">{{ card.title }}</h3>
          <span class="text-xs px-2 py-0.5 rounded-full bg-slate-700">
            {{ difficultyLabel[card.difficulty] }}
          </span>
        </div>

        <div
          class="prose prose-sm prose-invert max-w-none flex-1"
          v-html="card.bodyHtml"
        ></div>

        <div v-if="card.quiz && card.quiz.length" class="mt-3 pt-3 border-t border-slate-700">
          <div class="text-xs text-slate-400 mb-1">📝 内嵌例题 {{ card.quiz.length }} 道</div>
        </div>

        <div class="mt-2 text-xs text-slate-400 text-right">点击翻回 ←</div>
      </div>
    </div>
  </div>
</template>
