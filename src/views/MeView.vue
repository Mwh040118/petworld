<template>
  <div class="me-page page">
    <!-- 用户卡片 -->
    <div v-if="userStore.isLoggedIn" class="me-card poke-card" @click="goProfile">
      <div class="me-avatar">
        <img v-if="userStore.currentUser?.avatar" :src="userStore.currentUser.avatar" class="avatar-img" />
        <span v-else class="avatar-emoji">{{ (userStore.currentUser?.nickname || 'U')[0] }}</span>
      </div>
      <div class="me-info">
        <h2 class="me-name">{{ userStore.currentUser?.nickname || '用户' }}</h2>
        <p class="me-id">@{{ userStore.currentUser?.username }}</p>
      </div>
      <span class="me-arrow">→</span>
    </div>

    <div v-else class="me-card poke-card login-hint" @click="router.push('/login')">
      <div class="me-avatar">
        <span class="avatar-emoji">🐾</span>
      </div>
      <div class="me-info">
        <h2 class="me-name">登录 / 注册</h2>
        <p class="me-id">登录后享受更多功能</p>
      </div>
      <span class="me-arrow">→</span>
    </div>

    <!-- 功能入口 -->
    <div class="menu-section">
      <div class="menu-item" @click="$router.push('/my-pets')">
        <span class="menu-icon">🐾</span>
        <span class="menu-text">我的宠物</span>
        <span class="menu-arrow">→</span>
      </div>
      <div class="menu-item" @click="$router.push('/settings')">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">设置</span>
        <span class="menu-arrow">→</span>
      </div>
      <div v-if="userStore.isLoggedIn" class="menu-item logout" @click="handleLogout">
        <span class="menu-icon">🚪</span>
        <span class="menu-text">退出登录</span>
      </div>
    </div>

    <BottomNav active="me" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const userStore = useUserStore()

function goProfile() {
  if (userStore.userId) {
    router.push(`/profile/${userStore.userId}`)
  }
}

function handleLogout() {
  if (confirm('确定要退出登录吗？')) {
    userStore.logout()
    router.push('/home')
  }
}
</script>

<style scoped>
.me-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
}

.me-avatar {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-emoji { font-size: 1.8rem; color: white; font-weight: 800; }

.me-info { flex: 1; }
.me-name { font-size: 1.15rem; font-weight: 800; }
.me-id { font-size: 0.8rem; color: var(--text-light); }

.me-arrow {
  font-size: 1.2rem;
  color: var(--text-light);
}

.menu-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 2px solid var(--border);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  cursor: pointer;
  transition: var(--transition);
  border-bottom: 1px solid var(--border);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--bg-overlay);
}

.menu-icon {
  font-size: 1.3rem;
}

.menu-text {
  flex: 1;
  font-weight: 600;
  font-size: 0.95rem;
}

.menu-arrow {
  color: var(--text-light);
}

.menu-item.logout .menu-text {
  color: var(--red);
}
</style>
