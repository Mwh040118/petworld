<template>
  <div id="app" :class="{ 'child-mode': userMode === 'child', 'parent-mode': userMode === 'parent' }">
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userMode = computed(() => userStore.mode)

onMounted(async () => {
  // 初始化 Capacitor 原生插件（App 环境）
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { SplashScreen } = await import('@capacitor/splash-screen')

    if (StatusBar) {
      try {
        await StatusBar.setStyle({ style: Style.Light })
        await StatusBar.setBackgroundColor({ color: '#FF6B9D' })
      } catch (e) {
        console.warn('StatusBar not available:', e.message)
      }
    }

    if (SplashScreen) {
      try {
        await SplashScreen.hide({ fadeOutDuration: 300 })
      } catch (e) {
        console.warn('SplashScreen not available:', e.message)
      }
    }
  } catch {
    // Web 环境，不需要 Capacitor
  }

  // 恢复登录态
  await userStore.init()
})
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
