<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FilterBar from '@/components/FilterBar.vue'
import CardGrid from '@/components/CardGrid.vue'
import { filterCards } from '@/lib/cardLoader'
import { getTopic } from '@/data/topics'

const route = useRoute()

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
</script>

<template>
  <div>
    <div v-if="currentTopic" class="mb-4">
      <h1 class="text-2xl font-bold text-slate-800">{{ currentTopic.name }}</h1>
      <p class="text-sm text-slate-500">{{ currentTopic.description }}</p>
    </div>
    <h1 v-else class="text-2xl font-bold text-slate-800 mb-4">全部卡片</h1>

    <FilterBar
      v-model:selectedTopic="selectedTopic"
      v-model:selectedDifficulties="selectedDifficulties"
      v-model:searchText="searchText"
    />

    <div class="text-xs text-slate-500 mb-3">共 {{ cards.length }} 张卡片</div>

    <CardGrid :cards="cards" />
  </div>
</template>
