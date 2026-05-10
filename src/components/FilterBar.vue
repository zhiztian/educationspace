<script setup lang="ts">
import { computed } from 'vue'
import { TOPICS } from '@/data/topics'

const props = defineProps<{
  selectedTopic: string
  selectedDifficulties: number[]
  searchText: string
}>()

const emit = defineEmits<{
  (e: 'update:selectedTopic', v: string): void
  (e: 'update:selectedDifficulties', v: number[]): void
  (e: 'update:searchText', v: string): void
}>()

const difficulties = [
  { v: 1, label: '⭐ 泽泽' },
  { v: 2, label: '⭐⭐ 双方' },
  { v: 3, label: '⭐⭐⭐ 笑笑' },
  { v: 4, label: '⭐⭐⭐⭐ 挑战' },
]

function toggleDifficulty(v: number) {
  const set = new Set(props.selectedDifficulties)
  if (set.has(v)) set.delete(v)
  else set.add(v)
  emit('update:selectedDifficulties', Array.from(set).sort())
}

const isActive = (v: number) => props.selectedDifficulties.includes(v)

const topicValue = computed({
  get: () => props.selectedTopic,
  set: (v: string) => emit('update:selectedTopic', v),
})

const searchValue = computed({
  get: () => props.searchText,
  set: (v: string) => emit('update:searchText', v),
})
</script>

<template>
  <div class="mb-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <!-- 主题 -->
      <select
        v-model="topicValue"
        class="border-0 border-b border-slate-300 focus:border-slate-700 focus:ring-0 px-0 py-1 text-sm bg-transparent text-slate-700"
      >
        <option value="">全部主题</option>
        <option v-for="t in TOPICS" :key="t.id" :value="t.id">
          {{ t.order }}. {{ t.name }}
        </option>
      </select>

      <!-- 搜索 -->
      <input
        v-model="searchValue"
        type="text"
        placeholder="搜索 标题 / 标签 / 正文…"
        class="flex-1 border-0 border-b border-slate-300 focus:border-slate-700 focus:ring-0 px-0 py-1 text-sm bg-transparent text-slate-700 placeholder-slate-400"
      />

      <!-- 难度 -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="d in difficulties"
          :key="d.v"
          type="button"
          class="text-xs px-3 py-1 rounded-full border transition"
          :class="isActive(d.v)
            ? 'bg-slate-800 text-white border-slate-800'
            : 'bg-white text-slate-500 border-slate-300 hover:border-slate-500'"
          @click="toggleDifficulty(d.v)"
        >
          {{ d.label }}
        </button>
      </div>
    </div>
  </div>
</template>
