<script setup lang="ts">
import type { Card } from '@/types'
import CardComponent from './Card.vue'

defineProps<{
  cards: Card[]
}>()
</script>

<template>
  <div v-if="cards.length === 0" class="text-center text-slate-400 py-20">
    没有匹配的卡片
  </div>
  <div
    v-else
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
  >
    <CardComponent
      v-for="card in cards"
      :key="card.id"
      :card="card"
    />
  </div>
</template>
