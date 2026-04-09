<template>
  <div class="detail-page page">
    <div class="page-header">
      <router-link to="/pets" class="back-btn">←</router-link>
      <h1 class="page-title">{{ breed.name[locale] }}</h1>
      <div style="width:40px"></div>
    </div>

    <template v-if="breed">
      <!-- Hero Card -->
      <div class="hero-card" :style="{ '--cat-color': cat?.color, '--cat-bg': cat?.bgColor }">
        <div v-if="breed.image" class="hero-image-wrap animate-float" :style="{ background: (cat?.bgColor || '#E8E0FF') }">
          <img :src="breed.image" :alt="breed.name[locale]" class="hero-image" @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'" />
          <div class="hero-emoji-fallback pet-emoji-lg" style="display:none">{{ breed.emoji }}</div>
        </div>
        <div v-else class="hero-emoji-wrap pet-emoji-lg animate-float" :style="{ background: (cat?.bgColor || '#E8E0FF') }">
          {{ breed.emoji }}
        </div>
        <div class="hero-info">
          <h2 class="hero-name">{{ breed.name[locale] }}</h2>
          <p class="hero-en">{{ breed.name.en }}</p>
          <div class="hero-tags">
            <span class="tag tag-cat" :style="{ '--cat-bg': cat?.bgColor, '--cat-color': cat?.color }">
              {{ cat?.emoji }} {{ cat?.name[locale] }}
            </span>
            <span class="tag tag-primary">📍 {{ breed.origin[locale] }}</span>
          </div>
        </div>
      </div>

      <!-- Taxonomy Card -->
      <div v-if="breed.taxonomy" class="taxonomy-card poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🔬 {{ locale === 'zh' ? '生物分类' : 'Taxonomy' }}</div>
        <div class="taxonomy-grid">
          <div class="taxonomy-item" v-for="(val, key) in displayedTaxonomy" :key="key">
            <div class="taxonomy-label">{{ locale === 'zh' ? taxonomyLabels[key] : taxonomyLabelsEn[key] }}</div>
            <div class="taxonomy-value">{{ val }}</div>
          </div>
        </div>

      </div>

      <!-- Photo Gallery -->
      <div class="poke-card" style="margin-bottom: 16px; padding: 16px;">
        <BreedPhotoAlbum :breedId="breed.id" :breedName="breed.name[locale]" />
      </div>

      <!-- Stats -->
      <div class="poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">📊 {{ t('pet.temperament') }}</div>
        <div class="stat-bar">
          <span class="stat-label">💜 {{ locale === 'zh' ? '友善' : 'Friendly' }}</span>
          <div class="stat-track"><div class="stat-fill" :style="{ width: breed.stats.friendly + '%' }"></div></div>
          <span class="stat-value">{{ breed.stats.friendly }}</span>
        </div>
        <div class="stat-bar">
          <span class="stat-label">🎮 {{ locale === 'zh' ? '难度' : 'Difficulty' }}</span>
          <div class="stat-track"><div class="stat-fill" :style="{ width: breed.stats.difficulty + '%', background: 'linear-gradient(90deg, #00CEC9, #00B894)' }"></div></div>
          <span class="stat-value">{{ breed.stats.difficulty }}</span>
        </div>
        <div class="stat-bar">
          <span class="stat-label">⭐ {{ locale === 'zh' ? '人气' : 'Popular' }}</span>
          <div class="stat-track"><div class="stat-fill" :style="{ width: breed.stats.popularity + '%', background: 'linear-gradient(90deg, #FDCB6E, #E17055)' }"></div></div>
          <span class="stat-value">{{ breed.stats.popularity }}</span>
        </div>
        <div class="stat-bar">
          <span class="stat-label">💰 {{ locale === 'zh' ? '花费' : 'Cost' }}</span>
          <div class="stat-track"><div class="stat-fill" :style="{ width: breed.stats.cost + '%', background: 'linear-gradient(90deg, #FD79A8, #E84393)' }"></div></div>
          <span class="stat-value">{{ breed.stats.cost }}</span>
        </div>
      </div>

      <!-- Quick Info -->
      <div class="info-grid" style="margin-bottom: 16px;">
        <div class="info-item poke-card">
          <div class="info-icon">📏</div>
          <div class="info-label">{{ t('pet.size') }}</div>
          <div class="info-value">{{ breed.size[locale] }}</div>
        </div>
        <div class="info-item poke-card">
          <div class="info-icon">⏳</div>
          <div class="info-label">{{ t('pet.lifespan') }}</div>
          <div class="info-value">{{ breed.lifespan[locale] }}</div>
        </div>
      </div>

      <!-- Main Content Sections -->
      <div class="content-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🤗 {{ t('pet.temperament') }}</div>
        <p>{{ breed.temperament[locale] }}</p>
      </div>

      <div class="content-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">👀 {{ t('pet.appearance') }}</div>
        <p>{{ breed.appearance[locale] }}</p>
      </div>

      <div class="content-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🍖 {{ t('pet.diet') }}</div>
        <p>{{ breed.diet[locale] }}</p>
      </div>

      <div class="content-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🏠 {{ t('pet.habitat') }}</div>
        <p>{{ breed.habitat[locale] }}</p>
      </div>

      <div class="content-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">📖 {{ t('pet.history') }}</div>
        <p>{{ breed.history[locale] }}</p>
      </div>

      <!-- Fun Facts - Special Style -->
      <div class="content-section fun-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🎯 {{ t('pet.funFact') }}</div>
        <p>{{ breed.funFact[locale] }}</p>
      </div>

      <!-- Myths -->
      <div class="content-section myth-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">🔮 {{ t('pet.myths') }}</div>
        <p>{{ breed.myths[locale] }}</p>
      </div>

      <!-- Care Tips -->
      <div class="content-section care-section poke-card" style="margin-bottom: 16px;">
        <div class="card-section-title">💡 {{ t('pet.careTips') }}</div>
        <p style="white-space: pre-line">{{ breed.careTips[locale] }}</p>
      </div>

      <!-- Related Breeds -->
      <div v-if="relatedBreeds.length > 0" style="margin-bottom: 24px;">
        <h2 class="section-title">🔗 {{ t('pet.relatedBreeds') }}</h2>
        <div class="related-scroll">
          <div class="related-cards">
            <div
              v-for="rb in relatedBreeds"
              :key="rb.id"
              class="related-card poke-card"
              @click="$router.push(`/pet/${rb.id}`)"
              :style="{ '--rb-color': getCatColor(rb.category) }"
            >
              <div class="related-emoji">{{ rb.emoji }}</div>
              <div class="related-name">{{ rb.name[locale] }}</div>
              <div class="related-cat">{{ getCatName(rb.category) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>

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
import { computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'
import BreedPhotoAlbum from '@/components/BreedPhotoAlbum.vue'

const route = useRoute()
const { t, locale } = useI18n()

const breed = computed(() => breeds.find(b => b.id === route.params.id))
const cat = computed(() => categories.find(c => c.id === breed.value?.category))

const relatedBreeds = computed(() => {
  if (!breed.value?.relatedBreeds) return []
  return breed.value.relatedBreeds
    .map(id => breeds.find(b => b.id === id))
    .filter(Boolean)
})

function getCatColor(catId) { return categories.find(c => c.id === catId)?.color || '#6C5CE7' }
function getCatName(catId) {
  const c = categories.find(c => c.id === catId)
  return c ? c.name[locale.value] : catId
}

const taxonomyLabels = { kingdom: '界', phylum: '门', class: '纲', order: '目', family: '科', genus: '属', species: '种' }
const taxonomyLabelsEn = { kingdom: 'Kingdom', phylum: 'Phylum', class: 'Class', order: 'Order', family: 'Family', genus: 'Genus', species: 'Species' }

const displayedTaxonomy = computed(() => {
  if (!breed.value?.taxonomy) return {}
  return breed.value.taxonomy
})

watch(() => route.params.id, () => {
  nextTick(() => window.scrollTo(0, 0))
})
</script>

<style scoped>
/* Hero */
.hero-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 16px;
}
.hero-emoji-wrap { flex-shrink: 0; }
.hero-image-wrap {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-lg);
}
.hero-emoji-fallback {
  font-size: 2.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-name { font-size: 1.3rem; font-weight: 900; }
.hero-en { font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px; }
.hero-tags { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }

/* Taxonomy Card */
.taxonomy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.taxonomy-item {
  background: var(--bg-overlay);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  text-align: center;
}
.taxonomy-label {
  font-size: 0.7rem;
  color: var(--text-light);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.taxonomy-value {
  font-size: 0.78rem;
  color: var(--text);
  font-weight: 600;
  line-height: 1.3;
}
.taxonomy-note {
  margin-top: 10px;
  font-size: 0.72rem;
  color: var(--text-light);
  text-align: center;
}

/* Stats */
.card-section-title {
  font-size: 0.95rem;
  font-weight: 800;
  margin-bottom: 12px;
  color: var(--text);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.info-item {
  text-align: center;
  padding: 14px 10px;
}
.info-icon { font-size: 1.5rem; margin-bottom: 4px; }
.info-label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px; }
.info-value { font-size: 0.9rem; font-weight: 700; color: var(--text); }

/* Content */
.content-section {
  padding: 20px;
}
.content-section p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Fun Section */
.fun-section {
  border-left: 4px solid var(--yellow);
  background: linear-gradient(135deg, #FFFDF5, #FFF8E1);
}
.fun-section .card-section-title { color: #E17055; }

/* Myth Section */
.myth-section {
  border-left: 4px solid var(--purple);
  background: linear-gradient(135deg, #FDF5FF, #F0E6FF);
}
.myth-section .card-section-title { color: var(--purple); }

/* Care Section */
.care-section {
  border-left: 4px solid var(--green);
  background: linear-gradient(135deg, #F5FFF8, #E0FFE8);
}
.care-section .card-section-title { color: var(--green); }

/* Related Breeds */
.related-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -16px;
  padding: 0 16px;
}
.related-cards {
  display: flex;
  gap: 12px;
}
.related-card {
  flex-shrink: 0;
  width: 130px;
  text-align: center;
  padding: 14px 10px;
  cursor: pointer;
}
.related-emoji { font-size: 2rem; margin-bottom: 6px; }
.related-name { font-size: 0.8rem; font-weight: 700; margin-bottom: 2px; }
.related-cat { font-size: 0.7rem; color: var(--text-secondary); }
</style>
