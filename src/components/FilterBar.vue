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
  { v: 1, label: '⭐ 泽泽专属', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { v: 2, label: '⭐⭐ 双方可抢', cls: 'bg-blue-100 text-blue-700 border-blue-300' },
  { v: 3, label: '⭐⭐⭐ 笑笑专属', cls: 'bg-amber-100 text-amber-700 border-amber-300' },
  { v: 4, label: '⭐⭐⭐⭐ 挑战题', cls: 'bg-red-100 text-red-700 border-red-300' },
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
  <div class="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <!-- 主题 -->
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600 whitespace-nowrap">主题：</label>
        <select
          v-model="topicValue"
          class="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="">全部</option>
          <option v-for="t in TOPICS" :key="t.id" :value="t.id">
            {{ t.order }}. {{ t.name }}
          </option>
        </select>
      </div>

      <!-- 搜索 -->
      <div class="flex items-center gap-2 flex-1">
        <label class="text-sm text-slate-600 whitespace-nowrap">搜索：</label>
        <input
          v-model="searchValue"
          type="text"
          placeholder="标题 / 标签 / 正文..."
          class="border border-slate-300 rounded px-2 py-1 text-sm flex-1"
        />
      </div>
    </div>

    <!-- 难度 -->
    <div class="flex flex-wrap items-center gap-2 mt-3">
      <span class="text-sm text-slate-600">难度：</span>
      <button
        v-for="d in difficulties"
        :key="d.v"
        type="button"
        class="text-xs px-2 py-1 rounded-full border transition"
        :class="isActive(d.v) ? d.cls : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'"
        @click="toggleDifficulty(d.v)"
      >
        {{ d.label }}
      </button>
      <button
        v-if="selectedDifficulties.length > 0"
        type="button"
        class="text-xs text-slate-500 hover:text-slate-700 underline ml-2"
        @click="emit('update:selectedDifficulties', [])"
      >
        清空
      </button>
    </div>
  </div>
</template>
