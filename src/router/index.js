import { createRouter, createWebHistory } from 'vue-router'
import Guide from '@/guide/GuideManager'

import Home from '@/views/Home.vue'
import ActivityList from '@/views/ActivityList.vue'
import ActivityDetail from '@/views/ActivityDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/activities', name: 'activities', component: ActivityList },
    { path: '/activities/:id', name: 'activity-detail', component: ActivityDetail },
  ],
})

router.afterEach((to) => {
  const g = to.query.guide
  if (g) {
    const debug = to.query.debug === '1'
    const resume = to.query.resume === '1'
    Guide.start(typeof g === 'string' && g !== '1' ? g : to.name, { debug, persist: true, resume })
  }
})

export default router
