import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import BrowseView from '@/views/BrowseView.vue'
import CardDetailView from '@/views/CardDetailView.vue'
import StudyView from '@/views/StudyView.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/browse', name: 'browse', component: BrowseView },
    {
      path: '/topic/:id',
      name: 'topic',
      component: BrowseView,
      props: true,
    },
    {
      path: '/card/:id',
      name: 'card',
      component: CardDetailView,
      props: true,
    },
    {
      path: '/study/:topicId/:idx?',
      name: 'study',
      component: StudyView,
      props: true,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})
