<template>
  <div class="category-page page">
    <div class="page-header">
      <router-link to="/pets" class="back-btn">←</router-link>
      <h1 class="page-title">{{ cat?.emoji }} {{ cat?.name[locale] }}</h1>
      <div style="width:40px"></div>
    </div>

    <div class="cat-desc poke-card" v-if="cat" style="margin-bottom: 20px;">
      <p>{{ cat.description[locale] }}</p>
      <div class="cat-count-badge">
        {{ categoryBreeds.length }} {{ locale === 'zh' ? '个品种' : 'breeds' }}
      </div>
    </div>

    <div class="pet-list">
      <div
        v-for="(breed, idx) in categoryBreeds"
        :key="breed.id"
        class="breed-card poke-card animate-bounce-in"
        :style="{ 'animation-delay': idx * 0.08 + 's', '--cat-color': cat?.color }"
        @click="$router.push(`/pet/${breed.id}`)"
      >
        <div class="breed-card-top">
          <div class="breed-emoji-lg" :style="{ background: (cat?.color || '#6C5CE7') + '12' }">
            <img v-if="breed.image" :src="breed.image" :alt="breed.name[locale]" class="breed-thumb-img" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='block'" />
            <span v-else class="pet-emoji-lg">{{ breed.emoji }}</span>
            <span v-if="breed.image" class="pet-emoji-lg breed-emoji-fb" style="display:none">{{ breed.emoji }}</span>
          </div>
          <div class="breed-card-info">
            <div class="breed-card-name">{{ breed.name[locale] }}</div>
            <div class="breed-card-origin">📍 {{ breed.origin[locale] }}</div>
            <div class="breed-card-stats">
              <span class="mini-stat">⭐ {{ breed.stats.popularity }}</span>
              <span class="mini-stat">💜 {{ breed.stats.friendly }}</span>
            </div>
          </div>
        </div>
        <p class="breed-card-summary">{{ breed.temperament[locale] }}</p>
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
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const route = useRoute()
const { t, locale } = useI18n()

const cat = computed(() => categories.find(c => c.id === route.params.category))
const categoryBreeds = computed(() => breeds.filter(b => b.category === route.params.category))
</script>

<style scoped>
.cat-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  position: relative;
}
.cat-count-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--bg-overlay);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary);
}

.breed-card {
  cursor: pointer;
  margin-bottom: 12px;
}
.breed-card-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 10px;
}
.breed-emoji-lg {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.breed-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
}
.breed-emoji-fb { position: absolute; }
.breed-card-info { flex: 1; }
.breed-card-name { font-weight: 800; font-size: 1.1rem; color: var(--text); }
.breed-card-origin { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
.breed-card-stats { display: flex; gap: 12px; margin-top: 6px; }
.mini-stat { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; }
.breed-card-summary {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}
</style>
