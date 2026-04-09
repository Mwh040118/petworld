<template>
  <nav class="bottom-nav">
    <router-link to="/home" class="nav-item" :class="{ active: active === 'home' }">
      <span class="nav-icon">🏠</span>
      <span>首页</span>
    </router-link>
    <router-link to="/pets" class="nav-item" :class="{ active: active === 'explore' }">
      <span class="nav-icon">🌍</span>
      <span>百科</span>
    </router-link>
    <router-link to="/community" class="nav-item publish-btn" :class="{ active: active === 'community' }">
      <span class="nav-icon publish-icon">✏️</span>
    </router-link>
    <router-link to="/questions" class="nav-item" :class="{ active: active === 'questions' }">
      <span class="nav-icon">❓</span>
      <span>问答</span>
    </router-link>
    <router-link to="/me" class="nav-item" :class="{ active: active === 'me' }">
      <span class="nav-icon">👤</span>
      <span>我的</span>
    </router-link>
  </nav>
</template>

<script setup>
defineProps({
  active: { type: String, default: 'home' }
})
</script>

<style scoped>
.publish-btn {
  margin-top: -20px;
}

.publish-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);
}
</style>
