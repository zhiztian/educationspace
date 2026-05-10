<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FilterBar from '@/components/FilterBar.vue'
import CardGrid from '@/components/CardGrid.vue'
import { filterCards } from '@/lib/cardLoader'
import { getTopic } from '@/data/topics'

const route = useRoute()
const router = useRouter()

const selectedTopic = ref<string>(typeof route.params.id === 'string' ? route.params.id : '')
const selectedDifficulties = ref<number[]>([])
const searchText = ref('')

watch(
  () => route.params.id,
  (id) => {
    selectedTopic.value = typeof id === 'string' ? id : ''
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

function startStudy() {
  if (!selectedTopic.value) return
  router.push({ name: 'study', params: { topicId: selectedTopic.value, idx: '0' } })
}
</script>

<template>
  <div>
    <!-- 标题 -->
    <header class="mb-8 flex items-end justify-between gap-4">
      <div>
        <h1 v-if="currentTopic" class="text-3xl font-bold text-slate-800">{{ currentTopic.name }}</h1>
        <h1 v-else class="text-3xl font-bold text-slate-800">全部卡片</h1>
        <p v-if="currentTopic" class="text-sm text-slate-500 mt-1">{{ currentTopic.description }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ cards.length }} 张</p>
      </div>
      <button
        v-if="currentTopic && cards.length > 0"
        type="button"
        class="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-900 transition shrink-0"
        @click="startStudy"
      >
        🎯 进入专注模式
      </button>
    </header>

    <FilterBar
      v-model:selectedTopic="selectedTopic"
      v-model:selectedDifficulties="selectedDifficulties"
      v-model:searchText="searchText"
    />

    <CardGrid :cards="cards" />
  </div>
</template>
