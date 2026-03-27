import { createRouter, createWebHashHistory } from 'vue-router'
import courseRoutes from '@/modules/course/routes/Routes.ts'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    ...courseRoutes,
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
