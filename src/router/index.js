import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Welcome', component: () => import('@/views/WelcomeView.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/AuthView.vue') },
  { path: '/home', name: 'Home', component: () => import('@/views/HomeView.vue') },
  // 社区
  { path: '/community', name: 'Community', component: () => import('@/views/CommunityView.vue') },
  { path: '/questions', name: 'Questions', component: () => import('@/views/QuestionsView.vue') },
  { path: '/questions/:id', name: 'QuestionDetail', component: () => import('@/views/QuestionDetailView.vue') },
  // 百科（保留）
  { path: '/pets', name: 'PetList', component: () => import('@/views/PetListView.vue') },
  { path: '/pets/:category', name: 'CategoryView', component: () => import('@/views/CategoryView.vue') },
  { path: '/pet/:id', name: 'PetDetail', component: () => import('@/views/PetDetailView.vue') },
  { path: '/search', name: 'Search', component: () => import('@/views/SearchView.vue') },
  // 用户
  { path: '/profile/:userId', name: 'Profile', component: () => import('@/views/ProfileView.vue') },
  { path: '/me', name: 'Me', component: () => import('@/views/MeView.vue') },
  // 宠物档案（保留）
  { path: '/my-pets', name: 'MyPets', component: () => import('@/views/MyPetsView.vue') },
  { path: '/my-pets/new', name: 'AddPet', component: () => import('@/views/AddPetView.vue') },
  { path: '/my-pets/:id', name: 'PetProfile', component: () => import('@/views/PetProfileView.vue') },
  { path: '/my-pets/:id/diary', name: 'PetDiary', component: () => import('@/views/PetDiaryView.vue') },
  { path: '/identify', name: 'Identify', component: () => import('@/views/IdentifyView.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/views/SettingsView.vue') },
  // 物种图片管理
  { path: '/admin/species-images', name: 'SpeciesImagesAdmin', component: () => import('@/views/SpeciesImagesAdminView.vue') }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
