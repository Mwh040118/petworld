<template>
  <div class="search-page page">
    <div class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">{{ t('nav.search') }}</h1>
      <div style="width:40px"></div>
    </div>

    <div class="search-box" style="margin-bottom: 20px;">
      <span class="search-icon">🔍</span>
      <input
        v-model="query"
        class="input-field"
        :placeholder="t('search.placeholder')"
        @input="onSearch"
        autofocus
      />
    </div>

    <!-- Hot Searches -->
    <div v-if="!query.trim()" class="hot-section">
      <h3 class="section-title">🔥 {{ t('search.hotSearches') }}</h3>
      <div class="tag-list">
        <span
          v-for="tag in hotTags"
          :key="tag"
          class="hot-tag tag"
          @click="query = tag; onSearch()"
        >{{ tag }}</span>
      </div>
    </div>

    <!-- Results -->
    <div v-if="query.trim()">
      <p class="result-count" v-if="results.length > 0">
        {{ t('search.results') }} ({{ results.length }})
      </p>
      <div v-else class="empty-state">
        <span class="empty-icon">🤷</span>
        <p class="empty-text">{{ t('search.noResults') }}</p>
      </div>

      <div class="pet-list">
        <div
          v-for="breed in results"
          :key="breed.id"
          class="breed-list-item poke-card"
          @click="$router.push(`/pet/${breed.id}`)"
          :style="{ '--cat-color': getCatColor(breed.category) }"
        >
          <div class="breed-list-emoji" :style="{ background: getCatColor(breed.category) + '18' }">
            <img v-if="breed.image" :src="breed.image" :alt="breed.name[locale]" class="search-thumb" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='block'" />
            <span v-else class="pet-emoji-sm">{{ breed.emoji }}</span>
            <span v-if="breed.image" class="pet-emoji-sm search-emoji-fb" style="display:none">{{ breed.emoji }}</span>
          </div>
          <div class="breed-list-info">
            <div class="breed-list-name">{{ breed.name[locale] }}</div>
            <div class="breed-list-en">{{ breed.name.en }}</div>
            <div class="breed-list-meta">{{ getCatName(breed.category) }}</div>
          </div>
          <div class="breed-list-arrow">›</div>
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
      <router-link to="/search" class="nav-item active">
        <span class="nav-icon">🔍</span><span>{{ t('nav.search') }}</span>
      </router-link>
      <router-link to="/my-pets" class="nav-item">
        <span class="nav-icon">🐾</span><span>{{ t('nav.myPets') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const { t, locale } = useI18n()
const query = ref('')

const hotTags = computed(() => {
  if (locale.value === 'zh') return ['猫咪', '狗狗', '乌龟', '蛇', '仓鼠', '兔子', '鹦鹉', '蜘蛛']
  return ['Cat', 'Dog', 'Turtle', 'Snake', 'Hamster', 'Rabbit', 'Parrot', 'Spider']
})

const results = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase().trim()
  return breeds.filter(b =>
    b.name.zh.includes(q) ||
    b.name.en.toLowerCase().includes(q) ||
    b.keywords.some(k => k.toLowerCase().includes(q))
  )
})

function onSearch() {}
function getCatColor(catId) { return categories.find(c => c.id === catId)?.color || '#6C5CE7' }
function getCatName(catId) { const c = categories.find(c => c.id === catId); return c ? c.name[locale.value] : catId }
</script>

<style scoped>
.hot-section { margin-bottom: 20px; }
.tag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.hot-tag {
  cursor: pointer;
  padding: 6px 16px;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: var(--transition);
}
.hot-tag:hover { border-color: var(--primary-light); color: var(--primary); background: var(--purple-light); }

.result-count { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; font-weight: 600; }

.breed-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}
.breed-list-emoji {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}
.search-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md);
}
.search-emoji-fb { position: absolute; }
.breed-list-info { flex: 1; }
.breed-list-name { font-weight: 700; font-size: 0.95rem; }
.breed-list-en { font-size: 0.75rem; color: var(--text-light); }
.breed-list-meta { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
.breed-list-arrow { font-size: 1.5rem; color: var(--text-light); }
</style>
