import type { RouteRecordRaw } from 'vue-router'
import { CourseRoute } from '@/modules/course/enums/CourseRoute.ts'
import MainLayout from '@/layouts/main-layout/MainLayout.vue'
import HomeView from '@/modules/course/views/HomeView.vue'
import LessonView from '@/modules/course/views/LessonView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: CourseRoute.Home,
        component: HomeView,
      },
      {
        path: 'lesson/:lessonId',
        name: CourseRoute.Lesson,
        component: LessonView,
      },
    ],
  },
]

export default routes
