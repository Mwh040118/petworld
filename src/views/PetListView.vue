<template>
  <div class="pet-list-page page">
    <div class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">{{ t('nav.explore') }}</h1>
      <div style="width:40px"></div>
    </div>

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
        <span class="category-count">{{ getBreedCount(cat.id) }}</span>
      </div>
    </div>

    <h2 class="section-title" style="margin-top:24px">⭐ {{ t('home.popular') }}</h2>
    <div class="pet-list">
      <div
        v-for="breed in sortedBreeds.slice(0, 10)"
        :key="breed.id"
        class="breed-list-item poke-card"
        @click="$router.push(`/pet/${breed.id}`)"
        :style="{ '--cat-color': getCategoryColor(breed.category) }"
      >
        <div class="breed-list-emoji pet-emoji-sm" :style="{ background: getCategoryColor(breed.category) + '18' }">
          {{ breed.emoji }}
        </div>
        <div class="breed-list-info">
          <div class="breed-list-name">{{ breed.name[locale] }}</div>
          <div class="breed-list-meta">
            {{ getCategoryName(breed.category) }} · {{ breed.origin[locale] }}
          </div>
        </div>
        <div class="breed-list-popularity">⭐ {{ breed.stats.popularity }}</div>
      </div>
    </div>

    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item">
        <span class="nav-icon">🏠</span><span>{{ t('nav.home') }}</span>
      </router-link>
      <router-link to="/pets" class="nav-item active">
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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const { t, locale } = useI18n()

const sortedBreeds = computed(() =>
  [...breeds].sort((a, b) => b.stats.popularity - a.stats.popularity)
)

function getBreedCount(catId) {
  return breeds.filter(b => b.category === catId).length
}

function getCategoryColor(catId) {
  return categories.find(c => c.id === catId)?.color || '#6C5CE7'
}

function getCategoryName(catId) {
  const cat = categories.find(c => c.id === catId)
  return cat ? cat.name[locale.value] : catId
}
</script>

<style scoped>
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
  border-radius: var(--radius-lg);
  background: var(--cat-bg);
  cursor: pointer;
  transition: var(--transition);
  border: 2px solid transparent;
}
.category-card:hover {
  transform: translateY(-3px);
  border-color: var(--cat-color);
}
.category-emoji { font-size: 2rem; }
.category-name { font-size: 0.8rem; font-weight: 700; color: var(--cat-color); }
.category-count { font-size: 0.7rem; color: var(--text-secondary); }

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
}
.breed-list-info { flex: 1; }
.breed-list-name { font-weight: 700; font-size: 0.95rem; }
.breed-list-meta { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
.breed-list-popularity { font-size: 0.8rem; color: var(--text-secondary); }
</style>
