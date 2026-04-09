<template>
  <div class="home-page page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ greeting }}</h1>
        <p class="page-subtitle">{{ t('app.tagline') }}</p>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click="switchLang">
          {{ locale === 'zh' ? 'EN' : '中' }}
        </button>
        <router-link to="/settings" class="icon-btn">⚙️</router-link>
      </div>
    </div>

    <!-- 霸榜专区 -->
    <div class="spotlight-section" style="margin-bottom: 20px;">
      <div class="section-header">
        <h2 class="section-title">🌟 炫宠霸榜</h2>
        <button v-if="userStore.isLoggedIn" class="btn btn-ghost btn-sm" @click="showSpotlightForm = !showSpotlightForm">
          我也要上
        </button>
      </div>

      <div v-if="spotlightList.length" class="spotlight-scroll">
        <div v-for="s in spotlightList" :key="s.id" class="spotlight-card" @click="goProfile(s.user_id)">
          <img v-if="s.image" :src="s.image" class="spotlight-img" />
          <div class="spotlight-info">
            <span class="spotlight-caption">{{ s.caption || '炫耀一下~' }}</span>
            <span class="spotlight-user">{{ s.nickname || s.username }}</span>
          </div>
        </div>
      </div>

      <div v-else class="spotlight-empty poke-card">
        <span class="empty-emoji">📸</span>
        <p>还没有人霸榜，快来第一个！</p>
      </div>

      <!-- 霸榜申请 -->
      <div v-if="showSpotlightForm" class="spotlight-form poke-card">
        <input type="text" v-model="spotlightForm.caption" class="input-field" placeholder="写一句炫耀的话..." />
        <label class="btn btn-secondary btn-sm" style="margin-top: 8px;">
          📷 上传写真
          <input type="file" accept="image/*" hidden @change="handleSpotlightImg" />
        </label>
        <div v-if="spotlightForm.image" class="spotlight-preview">
          <img :src="spotlightForm.image" />
        </div>
        <button class="btn btn-primary btn-sm" style="margin-top: 8px;" @click="applySpotlight" :disabled="!spotlightForm.image">
          申请霸榜
        </button>
      </div>
    </div>

    <!-- 宠物分类（保留） -->
    <div class="section" style="margin-bottom: 24px;">
      <h2 class="section-title">🌍 {{ t('home.categories') }}</h2>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-card"
          :style="{ '--cat-color': cat.color, '--cat-bg': cat.bgColor }"
          @click="$router.push(`/pets/${cat.id}`)"
        >
          <span class="category-emoji">{{ cat.emoji }}</span>
          <span class="category-name">{{ cat.name[locale] }}</span>
        </div>
      </div>
    </div>

    <!-- 热门品种（保留） -->
    <div class="section" style="margin-bottom: 24px;">
      <div class="section-header">
        <h2 class="section-title">⭐ {{ t('home.popular') }}</h2>
        <button class="btn btn-ghost btn-sm" @click="$router.push('/pets')">
          {{ t('home.viewAll') }} →
        </button>
      </div>
      <div class="pet-grid">
        <div
          v-for="breed in popularBreeds"
          :key="breed.id"
          class="breed-card poke-card"
          @click="$router.push(`/pet/${breed.id}`)"
          :style="{ '--cat-color': getCategoryColor(breed.category) }"
        >
          <div class="breed-emoji-wrap">
            <img v-if="breed.image" :src="breed.image" :alt="breed.name[locale]" class="breed-thumb" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='block'" />
            <span v-else class="breed-emoji">{{ breed.emoji }}</span>
            <span v-if="breed.image" class="breed-emoji breed-emoji-fb" style="display:none">{{ breed.emoji }}</span>
          </div>
          <div class="breed-name">{{ breed.name[locale] }}</div>
          <div class="breed-cat">{{ getCategoryName(breed.category) }}</div>
        </div>
      </div>
    </div>

    <BottomNav active="home" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as api from '@/utils/api'
import BottomNav from '@/components/BottomNav.vue'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const greeting = computed(() => t('home.greeting', { name: userStore.username || '🎉' }))

const popularBreeds = computed(() =>
  [...breeds].sort((a, b) => b.stats.popularity - a.stats.popularity).slice(0, 6)
)

function getCategoryColor(catId) {
  return categories.find(c => c.id === catId)?.color || '#6C5CE7'
}

function getCategoryName(catId) {
  const cat = categories.find(c => c.id === catId)
  return cat ? cat.name[locale.value] : catId
}

function switchLang() {
  const newLang = locale.value === 'zh' ? 'en' : 'zh'
  locale.value = newLang
  userStore.setLanguage(newLang)
}

// 霸榜
const spotlightList = ref([])
const showSpotlightForm = ref(false)
const spotlightForm = ref({ caption: '', image: '' })

onMounted(loadSpotlights)

async function loadSpotlights() {
  try {
    const res = await api.spotlights.list()
    spotlightList.value = res.spotlights
  } catch {}
}

async function handleSpotlightImg(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const res = await api.uploadImage(file)
    spotlightForm.value.image = res.url
  } catch {}
  e.target.value = ''
}

async function applySpotlight() {
  if (!spotlightForm.value.image) return
  try {
    await api.spotlights.create(spotlightForm.value.image, spotlightForm.value.caption, null, 1)
    spotlightForm.value = { caption: '', image: '' }
    showSpotlightForm.value = false
    await loadSpotlights()
  } catch (e) {
    alert(e.message)
  }
}

function goProfile(userId) {
  router.push(`/profile/${userId}`)
}
</script>

<style scoped>
.page-subtitle { font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
.header-actions { display: flex; gap: 8px; }

.icon-btn {
  width: 38px; height: 38px; border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; background: var(--bg-card); box-shadow: var(--shadow-sm);
  transition: var(--transition); color: var(--text); font-weight: 700;
}
.icon-btn:hover { box-shadow: var(--shadow-md); }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-header .section-title { margin-bottom: 0; }

/* Spotlight */
.spotlight-scroll { display: flex; gap: 12px; overflow-x: auto; padding: 4px 0; -webkit-overflow-scrolling: touch; }

.spotlight-card {
  flex-shrink: 0;
  width: 200px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  border: 2px solid var(--primary-light);
  cursor: pointer;
  transition: var(--transition);
}

.spotlight-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }

.spotlight-img { width: 100%; height: 150px; object-fit: cover; }

.spotlight-info { padding: 10px; }

.spotlight-caption {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 4px;
}

.spotlight-user {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.spotlight-empty {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
}

.spotlight-form { padding: 16px; margin-top: 12px; }

.spotlight-preview { margin-top: 8px; }
.spotlight-preview img { width: 100%; max-height: 200px; object-fit: cover; border-radius: var(--radius-sm); }

/* Category */
.category-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }

.category-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px; border-radius: var(--radius-lg);
  background: var(--cat-bg); cursor: pointer; transition: var(--transition);
  border: 2px solid transparent;
}
.category-card:hover { transform: translateY(-3px); border-color: var(--cat-color); }
.category-card:active { transform: scale(0.95); }
.category-emoji { font-size: 1.8rem; }
.category-name { font-size: 0.7rem; font-weight: 700; color: var(--cat-color); text-align: center; }

/* Breed */
.breed-card { cursor: pointer; text-align: center; padding: 16px 10px; }

.breed-emoji-wrap {
  width: 56px; height: 56px; border-radius: var(--radius-lg);
  background: var(--cat-bg, #f0f0ff); display: flex;
  align-items: center; justify-content: center;
  margin: 0 auto 10px; overflow: hidden; position: relative;
}
.breed-thumb { width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-lg); }
.breed-emoji-fb { position: absolute; }
.breed-emoji { font-size: 1.8rem; }
.breed-name { font-size: 0.85rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.breed-cat { font-size: 0.7rem; color: var(--text-secondary); }
</style>
