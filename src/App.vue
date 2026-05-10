<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="text-2xl">📚</span>
          <span class="text-lg font-bold text-slate-800">泽泽 & 笑笑 共学卡片</span>
        </RouterLink>
        <nav class="flex items-center gap-4 text-sm">
          <RouterLink
            to="/"
            class="text-slate-600 hover:text-slate-900"
            active-class="text-blue-600 font-medium"
          >
            主题地图
          </RouterLink>
          <RouterLink
            to="/browse"
            class="text-slate-600 hover:text-slate-900"
            active-class="text-blue-600 font-medium"
          >
            全部卡片
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <RouterView />
    </main>

    <footer class="text-center text-xs text-slate-400 py-6">
      共学伙伴：泽泽（三年级）· 笑笑（六年级） — 国家课标 2022
    </footer>
  </div>
</template>
