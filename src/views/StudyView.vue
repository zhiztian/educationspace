<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCardsByTopic } from '@/lib/cardLoader'
import { getTopic } from '@/data/topics'

const route = useRoute()
const router = useRouter()

const topicId = computed(() => route.params.topicId as string)
const topic = computed(() => getTopic(topicId.value))
const cards = computed(() => getCardsByTopic(topicId.value))

const idx = ref(Math.max(0, parseInt((route.params.idx as string) || '0', 10)))
const pageIdx = ref(0)
// 切到上一张时，希望落在最后一页
const wantLastPage = ref(false)

const card = computed(() => cards.value[idx.value])
const total = computed(() => cards.value.length)

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

// === 分页 ===
const measureRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const pageHtmls = ref<string[]>([])
const pageTitles = ref<string[]>([])  // 每页对应的 H2 文本（首页 = 卡片标题）

function elHeight(el: HTMLElement): number {
  const style = window.getComputedStyle(el)
  const mt = parseFloat(style.marginTop) || 0
  const mb = parseFloat(style.marginBottom) || 0
  return el.offsetHeight + mt + mb
}

function paginate() {
  if (!card.value || !measureRef.value || !stageRef.value) return
  const html =
    `<h1 class="study-title">${card.value.title}</h1>` + card.value.bodyHtml
  const m = measureRef.value
  const stageH = stageRef.value.clientHeight
  m.innerHTML = html

  const children = Array.from(m.children) as HTMLElement[]

  // 阶段 1：按 H2 切成 section（第一个 section 是 H1 + 引言；后续每个 section 从 H2 起）
  const sections: HTMLElement[][] = [[]]
  for (const el of children) {
    if (el.tagName === 'H2' && sections[sections.length - 1].length > 0) {
      sections.push([el])
    } else {
      sections[sections.length - 1].push(el)
    }
  }

  // 阶段 2：给每个 H2 加 "N." 序号（H1 引言段不计）
  let n = 1
  for (const sec of sections) {
    const h2 = sec.find(el => el.tagName === 'H2') as HTMLElement | undefined
    if (h2 && !/^\d+\.\s/.test(h2.textContent || '')) {
      h2.textContent = `${n}. ${h2.textContent}`
      n++
    } else if (h2) {
      n++
    }
  }

  // 阶段 3：每个 section = 一页；section 超高时内部再按高度切（兜底）
  const pages: { html: string; title: string }[] = []
  for (const sec of sections) {
    if (sec.length === 0) continue
    const heights = sec.map(elHeight)
    const totalH = heights.reduce((a, b) => a + b, 0)

    // section 标题：首个 H2 文本；若无 H2，则取 H1 文本
    const h2 = sec.find(el => el.tagName === 'H2') as HTMLElement | undefined
    const h1 = sec.find(el => el.tagName === 'H1') as HTMLElement | undefined
    const secTitle = (h2?.textContent || h1?.textContent || '').trim()

    if (totalH <= stageH) {
      pages.push({ html: sec.map(e => e.outerHTML).join(''), title: secTitle })
    } else {
      // 内部按高度切
      let bucket: HTMLElement[] = []
      let cur = 0
      let isFirstChunk = true
      for (let i = 0; i < sec.length; i++) {
        const h = heights[i]
        if (cur + h > stageH && bucket.length > 0) {
          const chunkTitle = isFirstChunk ? secTitle : `${secTitle}（续）`
          pages.push({ html: bucket.map(e => e.outerHTML).join(''), title: chunkTitle })
          bucket = []
          cur = 0
          isFirstChunk = false
        }
        bucket.push(sec[i])
        cur += h
      }
      if (bucket.length > 0) {
        const chunkTitle = isFirstChunk ? secTitle : `${secTitle}（续）`
        pages.push({ html: bucket.map(e => e.outerHTML).join(''), title: chunkTitle })
      }
    }
  }

  pageHtmls.value = pages.map(p => p.html)
  pageTitles.value = pages.map(p => p.title)

  // 边界保护
  if (wantLastPage.value) {
    pageIdx.value = pageHtmls.value.length - 1
    wantLastPage.value = false
  } else if (pageIdx.value >= pageHtmls.value.length) {
    pageIdx.value = pageHtmls.value.length - 1
  } else if (pageIdx.value < 0) {
    pageIdx.value = 0
  }
}

const currentPageTitle = computed(() => pageTitles.value[pageIdx.value] || '')

// === 例题（Quiz）===
const inQuiz = ref(false)
const quizIdx = ref(0)
const showAnswer = ref(false)
const quizDone = ref(false)  // 完成页：最后一题答完后展示，按 Enter 重来 / → 下一卡 / Esc 回讲解
const quizList = computed(() => card.value?.quiz || [])
const currentQuiz = computed(() => quizList.value[quizIdx.value])

function startQuiz() {
  if (!quizList.value.length) return
  inQuiz.value = true
  quizIdx.value = 0
  showAnswer.value = false
  quizDone.value = false
}
function exitQuiz() {
  inQuiz.value = false
  quizDone.value = false
}
function quizNext() {
  if (quizDone.value) {
    // 完成页：→ = 进入下一卡（若有）
    if (idx.value < total.value - 1) {
      exitQuiz()
      router.replace({
        name: 'study',
        params: { topicId: topicId.value, idx: String(idx.value + 1) },
      })
    } else {
      exitQuiz()
    }
    return
  }
  if (!showAnswer.value) {
    showAnswer.value = true
    return
  }
  if (quizIdx.value < quizList.value.length - 1) {
    quizIdx.value++
    showAnswer.value = false
  } else {
    quizDone.value = true
  }
}
function quizPrev() {
  if (quizDone.value) {
    // 完成页 → 退回最后一题答案
    quizDone.value = false
    showAnswer.value = true
    return
  }
  if (showAnswer.value) {
    showAnswer.value = false
    return
  }
  if (quizIdx.value > 0) {
    quizIdx.value--
    showAnswer.value = false
  }
}
function quizRestart() {
  quizIdx.value = 0
  showAnswer.value = false
  quizDone.value = false
}

// 切卡时退出 quiz（避免索引越界）
watch(card, () => { inQuiz.value = false; quizDone.value = false })

// 当前底部提示（随状态切换）
const bottomHint = computed(() => {
  if (!inQuiz.value) return null
  if (quizDone.value) return '完成 ✓  Enter 再来一遍 · → 下一卡 · Esc 回讲解'
  if (!showAnswer.value) return '空格 / → 看答案'
  if (quizIdx.value < quizList.value.length - 1) return '→ 下一题 · ← 重看题面'
  return '→ 完成 · ← 重看题面'
})

async function repaginateNow() {
  await nextTick()
  paginate()
}

// 切卡 → 重新分页
watch(
  card,
  () => {
    repaginateNow()
  },
  { flush: 'post' }
)

watch(
  () => route.params.idx,
  v => {
    const newIdx = Math.max(0, parseInt((v as string) || '0', 10))
    if (newIdx !== idx.value) {
      idx.value = newIdx
      // 不在这里重置 pageIdx，让 paginate() 根据 wantLastPage 决定
    }
  }
)

// === 键位 / 翻页 ===
function next() {
  if (!pageHtmls.value.length) return
  if (pageIdx.value < pageHtmls.value.length - 1) {
    pageIdx.value++
  } else if (idx.value < total.value - 1) {
    pageIdx.value = 0
    wantLastPage.value = false
    router.replace({
      name: 'study',
      params: { topicId: topicId.value, idx: String(idx.value + 1) },
    })
  }
}

function prev() {
  if (!pageHtmls.value.length) return
  if (pageIdx.value > 0) {
    pageIdx.value--
  } else if (idx.value > 0) {
    wantLastPage.value = true
    router.replace({
      name: 'study',
      params: { topicId: topicId.value, idx: String(idx.value - 1) },
    })
  }
}

function exit() {
  router.push({ name: 'topic', params: { id: topicId.value } })
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
  if (e.ctrlKey || e.metaKey || e.altKey) return

  if (inQuiz.value) {
    // 完成页特殊处理：Enter 重来；→ / Space 进入下一卡
    if (quizDone.value && e.key === 'Enter') {
      e.preventDefault()
      quizRestart()
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter' || e.key === 'j' || e.key === 'l') {
      e.preventDefault()
      quizNext()
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k' || e.key === 'h') {
      e.preventDefault()
      quizPrev()
    } else if (e.key === 'Escape' || e.key === 'q') {
      e.preventDefault()
      exitQuiz()
    }
    return
  }

  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter' || e.key === 'j' || e.key === 'l') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'k' || e.key === 'h') {
    e.preventDefault()
    prev()
  } else if (e.key === 'Escape' || e.key === 'q') {
    e.preventDefault()
    exit()
  }
}

// 节流：rAF + 高度差阈值，避免 ResizeObserver 抖动重排死循环
let rafId = 0
let lastStageH = 0
function schedulePaginate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    paginate()
  })
}

let ro: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  // 等中文字体加载完成再首次分页（字体未就绪时高度测算偏小，会导致首屏少切一页）
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready } catch { /* noop */ }
  }
  paginate()
  if (stageRef.value) {
    lastStageH = stageRef.value.clientHeight
    ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const h = (e.target as HTMLElement).clientHeight
        if (Math.abs(h - lastStageH) >= 4) {
          lastStageH = h
          schedulePaginate()
          break
        }
      }
    })
    ro.observe(stageRef.value)
  }
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (ro) { ro.disconnect(); ro = null }
  if (rafId) { cancelAnimationFrame(rafId); rafId = 0 }
})
</script>

<template>
  <div v-if="!card" class="text-center text-slate-400 py-32 text-2xl">
    本主题暂无卡片
  </div>

  <div v-else class="study-mode">
    <!-- 顶部状态条：层级化
         主：当前 section 标题（最显眼）
         次：topic / 卡序 / 页序（uppercase mono 弱化）
         辅：难度（小） -->
    <header class="flex items-start justify-between mb-6 gap-4">
      <button
        type="button"
        class="text-slate-400 hover:text-slate-700 transition text-sm pt-1"
        @click="exit"
      >
        ← 退出（Esc）
      </button>
      <div class="flex-1 text-center min-w-0">
        <div
          v-if="currentPageTitle"
          class="text-slate-800 font-semibold text-xl leading-tight truncate"
        >
          {{ currentPageTitle }}
        </div>
        <div class="text-slate-400 text-xs font-mono tracking-wider mt-0.5">
          <span>{{ topic?.name }}</span>
          <span class="mx-2 text-slate-300">·</span>
          <span>{{ idx + 1 }}/{{ total }}</span>
          <template v-if="pageHtmls.length > 1">
            <span class="mx-2 text-slate-300">·</span>
            <span>P{{ pageIdx + 1 }}/{{ pageHtmls.length }}</span>
          </template>
        </div>
      </div>
      <span
        class="text-slate-300 text-sm pt-1"
        :title="difficultyAudience[card.difficulty]"
      >
        {{ difficultyLabel[card.difficulty] }}
      </span>
    </header>

    <!-- 进度条 -->
    <div class="h-1 bg-slate-200 rounded-full overflow-hidden mb-6">
      <div
        class="h-full bg-slate-700 transition-all duration-300"
        :style="{ width: `${((idx + 1) / total) * 100}%` }"
      />
    </div>

    <!-- 舞台：固定高度，永不滚动 -->
    <div ref="stageRef" class="study-stage">
      <article
        v-if="!inQuiz"
        class="study-content prose prose-2xl max-w-none"
        v-html="pageHtmls[pageIdx] || ''"
      ></article>

      <div v-else-if="!quizDone" class="quiz-content">
        <div class="quiz-meta">
          题 {{ quizIdx + 1 }} / {{ quizList.length }}
          <span class="ml-3" :title="difficultyAudience[currentQuiz?.difficulty || 2]">
            {{ difficultyLabel[currentQuiz?.difficulty || 2] }}
          </span>
        </div>
        <div class="quiz-q">{{ currentQuiz?.q }}</div>
        <div v-if="showAnswer" class="quiz-a">
          <div class="quiz-a-label">答案</div>
          <div class="quiz-a-text">{{ currentQuiz?.a }}</div>
          <div v-if="currentQuiz?.explanation" class="quiz-a-explain">
            {{ currentQuiz.explanation }}
          </div>
        </div>
      </div>

      <!-- 完成页 -->
      <div v-else class="quiz-done">
        <div class="quiz-done-icon">🎉</div>
        <div class="quiz-done-title">完成 {{ quizList.length }} / {{ quizList.length }}</div>
        <div class="quiz-done-sub">{{ card.title }}</div>
        <div class="quiz-done-actions">
          <button type="button" class="quiz-done-btn" @click="quizRestart">
            ↻ 再来一遍 <span class="kbd-inline">Enter</span>
          </button>
          <button
            v-if="idx < total - 1"
            type="button"
            class="quiz-done-btn"
            @click="quizNext"
          >
            下一卡 <span class="kbd-inline">→</span>
          </button>
          <button type="button" class="quiz-done-btn" @click="exitQuiz">
            回讲解 <span class="kbd-inline">Esc</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 隐藏的测量容器：与 stage 同宽同 prose 风格 -->
    <div class="study-measure" aria-hidden="true">
      <div ref="measureRef" class="study-content prose prose-2xl max-w-none"></div>
    </div>

    <!-- 底部导航：仅左右 -->
    <footer class="mt-6 flex items-center justify-between text-slate-400">
      <button
        type="button"
        class="px-4 py-2 hover:text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed text-base"
        :disabled="inQuiz ? (!quizDone && quizIdx === 0 && !showAnswer) : (idx === 0 && pageIdx === 0)"
        @click="inQuiz ? quizPrev() : prev()"
      >
        ← 上一{{ inQuiz ? (quizDone ? '页' : '题') : '页' }}
      </button>
      <div class="flex items-center gap-3 text-xs text-slate-400">
        <button
          v-if="!inQuiz && quizList.length > 0"
          type="button"
          class="px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-900 transition text-xs"
          @click="startQuiz"
        >
          📝 例题 ({{ quizList.length }})
        </button>
        <button
          v-if="inQuiz"
          type="button"
          class="px-3 py-1 border border-slate-300 text-slate-600 rounded hover:bg-slate-100 transition text-xs"
          @click="exitQuiz"
        >
          ← 回到讲解
        </button>
        <span v-if="bottomHint" class="text-slate-500 italic">
          {{ bottomHint }}
        </span>
        <template v-else>
          <kbd class="px-2 py-0.5 border border-slate-200 rounded font-mono text-slate-400">←</kbd>
          <kbd class="px-2 py-0.5 border border-slate-200 rounded font-mono text-slate-400">→</kbd>
          <span class="text-slate-300">/</span>
          <kbd class="px-2 py-0.5 border border-slate-200 rounded font-mono text-slate-400">Esc</kbd>
        </template>
      </div>
      <button
        type="button"
        class="px-4 py-2 hover:text-slate-700 transition disabled:opacity-30 disabled:cursor-not-allowed text-base"
        :disabled="inQuiz ? (quizDone && idx >= total - 1) : (idx >= total - 1 && pageIdx >= pageHtmls.length - 1)"
        @click="inQuiz ? quizNext() : next()"
      >
        下一{{ inQuiz ? (quizDone ? '卡' : '题') : '页' }} →
      </button>
    </footer>
  </div>
</template>

<style scoped>
.study-mode {
  /* 占满主区域：viewport - 顶部 nav(~57px) - footer(~50px) - 外层 main padding(~48px) */
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.study-stage {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;        /* 关键：永不滚动 */
  background: white;
  border: 1px solid rgb(226 232 240);
  border-radius: 0.75rem;
  padding: 2.5rem 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.study-stage > .study-content {
  width: 100%;
  /* 默认左对齐：投屏 3 米外读长句，视线必须能稳定找到行首。
     仅"关键结论 / 标题 / 表头"这类短信息居中，强化层级。 */
  text-align: left;
}

/* 标题：居中（强信号，TV 远端先抓住） */
.study-content :deep(.study-title),
.study-content :deep(h1),
.study-content :deep(h2) {
  text-align: center;
}

/* 表格：宽度按内容、整体居中；表头居中（短词），单元格左对齐（句子可能较长） */
.study-content :deep(table) {
  margin-left: auto;
  margin-right: auto;
  width: auto;
  max-width: 100%;
}
.study-content :deep(table th) {
  text-align: center;
}
.study-content :deep(table td) {
  text-align: left;
}

/* 列表：恢复 marker 在外侧（左对齐布局），方便扫读 */
.study-content :deep(ul),
.study-content :deep(ol) {
  list-style-position: outside;
  padding-left: 1.5rem;
}

/* code block 左对齐（代码块天然左对齐） */
.study-content :deep(pre) {
  text-align: left;
}

/* blockquote = 关键结论 / 必背口诀，居中 */
.study-content :deep(blockquote) {
  border-left: none;
  border-top: 2px solid rgb(226 232 240);
  border-bottom: 2px solid rgb(226 232 240);
  padding: 0.5rem 1rem;
  margin-left: auto;
  margin-right: auto;
  display: block;
  text-align: center;
  max-width: 80%;
}

/* 测量容器：脱离视觉，但 layout 真实存在 */
.study-measure {
  position: absolute;
  visibility: hidden;
  pointer-events: none;
  left: -99999px;
  top: 0;
  /* 宽度跟随 stage—stage 是 max-w-7xl 内部，约 1024-1280px 之间。
     测量容器我们用一个具体宽度兜底；分页结果在不同宽度下会重算。*/
  width: min(72rem, calc(100vw - 4rem));
  padding: 2.5rem 3rem;
}

/* 放大字号 */
.study-content :deep(.study-title) {
  font-size: 2.75rem;
  font-weight: 700;
  color: rgb(30 41 59);
  margin: 0 0 1.5rem;
  line-height: 1.2;
}
.study-content :deep(h1),
.study-content :deep(h2) {
  font-size: 2rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: rgb(30 41 59);
}
.study-content :deep(h3) {
  font-size: 1.5rem;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: rgb(51 65 85);
}
.study-content :deep(p),
.study-content :deep(li) {
  font-size: 1.25rem;
  line-height: 1.8;
}
.study-content :deep(table) {
  font-size: 1.125rem;
}
.study-content :deep(table th),
.study-content :deep(table td) {
  padding: 0.5rem 0.75rem;
}
.study-content :deep(code) {
  font-size: 1.1rem;
}
.study-content :deep(blockquote) {
  font-size: 1.2rem;
}

/* === Quiz === */
.quiz-content {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}
.quiz-meta {
  font-size: 1rem;
  color: rgb(148 163 184);
  letter-spacing: 0.05em;
}
.quiz-q {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(30 41 59);
  line-height: 1.4;
  max-width: 56rem;
}
.quiz-a {
  border-top: 2px solid rgb(226 232 240);
  padding-top: 2rem;
  width: 100%;
  max-width: 56rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}
.quiz-a-label {
  font-size: 0.875rem;
  color: rgb(148 163 184);
  letter-spacing: 0.1em;
}
.quiz-a-text {
  font-size: 2rem;
  font-weight: 600;
  color: rgb(15 118 110);
  line-height: 1.5;
}
.quiz-a-explain {
  font-size: 1.125rem;
  color: rgb(100 116 139);
  line-height: 1.7;
}
.quiz-hint {
  font-size: 1rem;
  color: rgb(203 213 225);
  font-style: italic;
}

/* === Quiz 完成页 === */
.quiz-done {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.quiz-done-icon {
  font-size: 4rem;
  line-height: 1;
}
.quiz-done-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(15 118 110);
}
.quiz-done-sub {
  font-size: 1.25rem;
  color: rgb(100 116 139);
}
.quiz-done-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}
.quiz-done-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgb(203 213 225);
  border-radius: 0.5rem;
  background: white;
  color: rgb(51 65 85);
  font-size: 1.125rem;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.quiz-done-btn:hover {
  background: rgb(241 245 249);
  border-color: rgb(148 163 184);
}
.kbd-inline {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: rgb(241 245 249);
  border-radius: 0.25rem;
  color: rgb(100 116 139);
}
</style>
