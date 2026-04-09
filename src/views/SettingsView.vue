<template>
  <div class="settings-page page">
    <div class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">⚙️ {{ t('settings.title') }}</h1>
      <div style="width:40px"></div>
    </div>

    <div class="settings-list">
      <!-- 头像和昵称 -->
      <div class="settings-profile-card poke-card">
        <div class="profile-avatar-upload">
          <div class="avatar-preview">
            <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar-img" />
            <span v-else class="avatar-emoji">{{ (userStore.currentUser?.nickname || 'U')[0] }}</span>
          </div>
          <label class="avatar-upload-btn">
            📷 {{ t('settings.changeAvatar') }}
            <input type="file" accept="image/*" hidden @change="handleAvatarUpload" />
          </label>
        </div>
        <div class="profile-info-edit">
          <div class="form-group">
            <label class="form-label">{{ t('settings.nickname') }}</label>
            <input v-model="profileForm.nickname" class="input-field" :placeholder="t('settings.nicknamePlaceholder')" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ t('settings.bio') }}</label>
            <textarea v-model="profileForm.bio" class="input-field textarea" :placeholder="t('settings.bioPlaceholder')" rows="2"></textarea>
          </div>
          <button class="btn btn-primary btn-sm" @click="saveProfile" :disabled="!profileFormChanged || savingProfile">
            {{ savingProfile ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="settings-item poke-card">
        <div class="settings-left">
          <span class="settings-icon">🌐</span>
          <span class="settings-label">{{ t('settings.language') }}</span>
        </div>
        <div class="settings-right">
          <button :class="['lang-btn', { active: locale === 'zh' }]" @click="switchLang('zh')">中文</button>
          <button :class="['lang-btn', { active: locale === 'en' }]" @click="switchLang('en')">EN</button>
        </div>
      </div>

      <!-- Mode -->
      <div class="settings-item poke-card">
        <div class="settings-left">
          <span class="settings-icon">🎭</span>
          <span class="settings-label">{{ t('settings.mode') }}</span>
        </div>
        <div class="settings-right">
          <button :class="['mode-btn', { active: userStore.mode === 'child' }]" @click="userStore.setMode('child')">
            🧒 {{ t('welcome.child') }}
          </button>
          <button :class="['mode-btn', { active: userStore.mode === 'parent' }]" @click="userStore.setMode('parent')">
            👩 {{ t('welcome.parent') }}
          </button>
        </div>
      </div>

      <!-- Version -->
      <div class="settings-item poke-card">
        <div class="settings-left">
          <span class="settings-icon">ℹ️</span>
          <span class="settings-label">{{ t('settings.about') }}</span>
        </div>
        <div class="settings-right">
          <span class="version-text">PetWorld v1.0.0</span>
        </div>
      </div>

      <!-- Reset -->
      <div class="settings-item poke-card" @click="showResetConfirm = true" style="cursor: pointer;">
        <div class="settings-left">
          <span class="settings-icon" style="color: var(--red);">⚠️</span>
          <span class="settings-label" style="color: var(--red);">{{ t('settings.resetData') }}</span>
        </div>
        <div class="settings-right">
          <span style="color: var(--red); font-size: 0.85rem;">→</span>
        </div>
      </div>
    </div>

    <!-- Reset Confirm Modal -->
    <div v-if="showResetConfirm" class="modal-overlay" @click.self="showResetConfirm = false">
      <div class="modal-content">
        <h3 style="font-size: 1.05rem; margin-bottom: 8px;">⚠️ {{ t('settings.resetConfirm') }}</h3>
        <div style="display:flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-ghost" style="flex:1" @click="showResetConfirm = false">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger" style="flex:1" @click="resetAllData">{{ t('common.confirm') }}</button>
        </div>
      </div>
    </div>

    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item">
        <span class="nav-icon">🏠</span><span>{{ t('nav.home') }}</span>
      </router-link>
      <router-link to="/pets" class="nav-item">
        <span class="nav-icon">🌍</span><span>{{ t('nav.explore') }}</span>
      </router-link>
      <router-link to="/search" class="nav-item">
        <span class="nav-icon">🔍</span><span>{{ t('nav.search') }}</span>
      </router-link>
      <router-link to="/my-pets" class="nav-item">
        <span class="nav-icon">🐾</span><span>{{ t('nav.myPets') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useMyPetsStore } from '@/stores/myPets'
import * as api from '@/utils/api'

const router = useRouter()
const { t, locale } = useI18n()
const userStore = useUserStore()
const myPetsStore = useMyPetsStore()

const editName = ref(userStore.username)
const showResetConfirm = ref(false)

// 个人资料编辑
const profileForm = ref({
  nickname: '',
  bio: '',
  avatar: ''
})
const savingProfile = ref(false)
const originalProfile = ref({})

onMounted(async () => {
  // 加载当前用户资料
  await loadCurrentUser()
})

async function loadCurrentUser() {
  if (userStore.currentUser) {
    profileForm.value = {
      nickname: userStore.currentUser.nickname || '',
      bio: userStore.currentUser.bio || '',
      avatar: userStore.currentUser.avatar || ''
    }
    originalProfile.value = { ...profileForm.value }
  }
}

const profileFormChanged = computed(() => {
  return profileForm.value.nickname !== originalProfile.value.nickname ||
         profileForm.value.bio !== originalProfile.value.bio ||
         profileForm.value.avatar !== originalProfile.value.avatar
})

async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  
  try {
    const res = await api.uploadImage(file)
    profileForm.value.avatar = res.url
    e.target.value = ''
  } catch (error) {
    alert(t('settings.uploadFailed'))
  }
}

async function saveProfile() {
  if (!profileFormChanged.value || savingProfile.value) return
  
  savingProfile.value = true
  try {
    await api.user.updateProfile({
      nickname: profileForm.value.nickname,
      bio: profileForm.value.bio,
      avatar: profileForm.value.avatar
    })
    
    // 更新本地用户信息
    await userStore.refreshUser()
    originalProfile.value = { ...profileForm.value }
    alert(t('settings.profileSaved'))
  } catch (error) {
    alert(error.message || t('settings.saveFailed'))
  } finally {
    savingProfile.value = false
  }
}

function switchLang(lang) {
  locale.value = lang
  userStore.setLanguage(lang)
}

function resetAllData() {
  localStorage.clear()
  router.go(0)
}
</script>

<style scoped>
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 个人资料卡片 */
.settings-profile-card {
  padding: 20px;
}

.profile-avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-emoji {
  font-size: 2rem;
  color: white;
  font-weight: 800;
}

.avatar-upload-btn {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 2px solid var(--border);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.avatar-upload-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.profile-info-edit {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
}

.textarea {
  resize: vertical;
  min-height: 60px;
}

/* 设置项样式 */
.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}

.settings-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.settings-icon { font-size: 1.3rem; }
.settings-label { font-weight: 700; font-size: 0.95rem; }

.settings-right { display: flex; align-items: center; gap: 6px; }

.lang-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  transition: var(--transition);
}
.lang-btn.active { border-color: var(--primary); color: var(--primary); background: var(--purple-light); }

.mode-btn {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  transition: var(--transition);
}
.mode-btn.active { border-color: var(--primary); color: var(--primary); background: var(--purple-light); }

.version-text { font-size: 0.8rem; color: var(--text-light); }
</style>
