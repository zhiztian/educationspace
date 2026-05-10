<script setup lang="ts">
import type { Card } from '@/types'
import CardComponent from './Card.vue'

defineProps<{
  cards: Card[]
  focusedIdx?: number
  showFocus?: boolean
}>()

const emit = defineEmits<{
  (e: 'focus', idx: number): void
}>()
</script>

<template>
  <div v-if="cards.length === 0" class="text-center text-slate-400 py-20">
    没有匹配的卡片
  </div>
  <div
    v-else
    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
  >
    <div
      v-for="(card, i) in cards"
      :key="card.id"
      :data-card-idx="i"
    >
      <CardComponent
        :card="card"
        :focused="showFocus && i === focusedIdx"
        @mouseenter="emit('focus', i)"
      />
    </div>
  </div>
</template>
