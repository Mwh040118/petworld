<template>
  <div class="welcome-page">
    <div class="welcome-bg">
      <div class="floating-pets">
        <span class="float-item" style="--delay:0s;--x:10%;--y:20%">🐱</span>
        <span class="float-item" style="--delay:1s;--x:80%;--y:15%">🐶</span>
        <span class="float-item" style="--delay:2s;--x:25%;--y:70%">🐢</span>
        <span class="float-item" style="--delay:0.5s;--x:75%;--y:65%">🐰</span>
        <span class="float-item" style="--delay:1.5s;--x:50%;--y:30%">🦜</span>
        <span class="float-item" style="--delay:3s;--x:15%;--y:50%">🐹</span>
        <span class="float-item" style="--delay:2.5s;--x:85%;--y:45%">🐍</span>
        <span class="float-item" style="--delay:1.8s;--x:40%;--y:80%">🕷️</span>
        <span class="float-item" style="--delay:0.8s;--x:60%;--y:10%">🐸</span>
        <span class="float-item" style="--delay:2.2s;--x:90%;--y:80%">🦎</span>
      </div>
    </div>

    <div class="welcome-content">
      <div class="logo-area animate-bounce-in">
        <div class="logo-circle">🐾</div>
        <h1 class="app-name">{{ t('app.name') }}</h1>
        <p class="app-tagline">{{ t('app.tagline') }}</p>
      </div>

      <div class="name-section" v-if="!showModes">
        <p class="prompt-text">{{ t('welcome.setName') }}</p>
        <div class="name-input-wrap">
          <input
            v-model="username"
            class="input-field"
            :placeholder="t('welcome.namePlaceholder')"
            @keyup.enter="confirmName"
            maxlength="12"
          />
          <button class="btn btn-primary" @click="confirmName" :disabled="!username.trim()">
            {{ t('common.ok') }} ✓
          </button>
        </div>
      </div>

      <transition name="slide-up">
        <div v-if="showModes" class="mode-section">
          <p class="prompt-text">{{ t('welcome.subtitle') }}</p>
          <div class="mode-cards">
            <div class="mode-card child-card" @click="selectMode('child')">
              <div class="mode-emoji animate-float">🧒</div>
              <div class="mode-label">{{ t('welcome.child') }}</div>
              <div class="mode-desc">{{ t('app.tagline') }}</div>
            </div>
            <div class="mode-card parent-card" @click="selectMode('parent')">
              <div class="mode-emoji animate-float" style="--delay:0.5s">👩</div>
              <div class="mode-label">{{ t('welcome.parent') }}</div>
              <div class="mode-desc">{{ t('app.tagline') }}</div>
            </div>
          </div>
        </div>
      </transition>

      <div class="lang-switch">
        <button class="lang-btn danger-text" @click="resetAll" style="margin-right: 8px; font-size: 0.75rem; opacity: 0.7;">
          🔄 重置
        </button>
        <button :class="['lang-btn', { active: locale === 'zh' }]" @click="switchLang('zh')">中文</button>
        <span class="lang-divider">|</span>
        <button :class="['lang-btn', { active: locale === 'en' }]" @click="switchLang('en')">English</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()

const username = ref('')
const showModes = ref(false)

function confirmName() {
  if (username.value.trim()) {
    userStore.setUsername(username.value.trim())
    showModes.value = true
  }
}

function selectMode(mode) {
  try {
    userStore.setMode(mode)
    window.location.hash = '#/home'
    window.location.reload()
  } catch(e) {
    console.error('Navigation error:', e)
  }
}

function switchLang(lang) {
  locale.value = lang
  userStore.setLanguage(lang)
}

function resetAll() {
  localStorage.clear()
  username.value = ''
  showModes.value = false
  window.location.reload()
}
</script>

<style scoped>
.welcome-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.welcome-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-pets .float-item {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: 2.5rem;
  animation: float-around 6s ease-in-out infinite;
  animation-delay: var(--delay);
  opacity: 0.3;
}

@keyframes float-around {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(5deg); }
  75% { transform: translateY(10px) rotate(-5deg); }
}

.welcome-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 40px 24px;
  max-width: 400px;
  width: 100%;
}

.logo-area {
  margin-bottom: 40px;
}

.logo-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  margin: 0 auto 16px;
  border: 3px solid rgba(255,255,255,0.3);
}

.app-name {
  font-size: 2rem;
  font-weight: 900;
  color: white;
  margin-bottom: 6px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.app-tagline {
  font-size: 1rem;
  color: rgba(255,255,255,0.85);
  font-weight: 600;
}

.prompt-text {
  color: rgba(255,255,255,0.9);
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 16px;
}

.name-input-wrap {
  display: flex;
  gap: 10px;
}

.name-input-wrap .input-field {
  background: rgba(255,255,255,0.95);
  color: var(--text);
}

.mode-section {
  margin-top: 8px;
}

.mode-cards {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.mode-card {
  flex: 1;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: var(--radius-xl);
  padding: 24px 16px;
  cursor: pointer;
  transition: var(--transition);
}

.mode-card:hover {
  background: rgba(255,255,255,0.35);
  transform: translateY(-4px);
  border-color: rgba(255,255,255,0.6);
}

.mode-card:active {
  transform: scale(0.96);
}

.mode-emoji {
  font-size: 3rem;
  margin-bottom: 10px;
}

.mode-label {
  font-size: 1rem;
  font-weight: 800;
  color: white;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.75);
}

.lang-switch {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(10px);
  padding: 8px 20px;
  border-radius: var(--radius-full);
}

.lang-btn {
  color: rgba(255,255,255,0.7);
  font-weight: 700;
  font-size: 0.9rem;
  transition: var(--transition);
  background: none;
  border: none;
}

.lang-btn.active {
  color: white;
}

.lang-btn.danger-text {
  color: #ffd700;
}

.lang-divider {
  color: rgba(255,255,255,0.4);
}

.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.3s ease-in;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
