<template>
  <div class="my-pets-page page">
    <div class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">🐾 {{ t('myPet.title') }}</h1>
      <button class="btn btn-sm btn-primary" @click="$router.push('/my-pets/new')">+ {{ t('myPet.addNew') }}</button>
    </div>

    <div v-if="myPetsStore.petCount === 0" class="empty-state">
      <span class="empty-icon">🐾</span>
      <p class="empty-text">{{ t('myPet.noPets') }}</p>
      <button class="btn btn-primary" @click="$router.push('/my-pets/new')">
        + {{ t('myPet.addFirst') }}
      </button>
    </div>

    <div v-else class="pet-list">
      <div
        v-for="pet in myPetsStore.pets"
        :key="pet.id"
        class="my-pet-card poke-card"
        @click="$router.push(`/my-pets/${pet.id}`)"
      >
        <div class="mypet-avatar pet-emoji" :style="{ background: getPetBg(pet) }">
          <img v-if="pet.photo" :src="pet.photo" class="mypet-cover" />
          <span v-else>{{ pet.emoji || '🐾' }}</span>
        </div>
        <div class="mypet-info">
          <div class="mypet-name">{{ pet.name }}</div>
          <div class="mypet-breed" v-if="pet.breedName" @click.stop="$router.push(`/pet/${pet.breedId}`)">
            📖 {{ pet.breedName }}
          </div>
          <div class="mypet-meta">
            <span v-if="pet.age">{{ pet.age }}</span>
            <span v-if="pet.gender"> · {{ t(`myPet.${pet.gender}`) }}</span>
          </div>
          <div class="mypet-diary-count" v-if="pet.diary?.length">
            📝 {{ pet.diary.length }} {{ locale === 'zh' ? '篇日记' : 'entries' }}
          </div>
        </div>
        <div class="mypet-arrow">›</div>
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
      <router-link to="/my-pets" class="nav-item active">
        <span class="nav-icon">🐾</span><span>{{ t('nav.myPets') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useMyPetsStore } from '@/stores/myPets'

const { t, locale } = useI18n()
const myPetsStore = useMyPetsStore()

const bgColors = ['#FFE0EC', '#D6EFFF', '#D5FFE8', '#E8E0FF', '#FFF8E1', '#FFE0D6', '#DFFFFE']
function getPetBg(pet) {
  const idx = myPetsStore.pets.indexOf(pet)
  return bgColors[idx % bgColors.length]
}
</script>

<style scoped>
.my-pet-card {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
}
.mypet-avatar { flex-shrink: 0; overflow: hidden; }
.mypet-cover { width: 100%; height: 100%; object-fit: cover; display: block; }
.mypet-info { flex: 1; }
.mypet-name { font-size: 1.05rem; font-weight: 800; }
.mypet-breed {
  font-size: 0.8rem;
  color: var(--primary);
  margin-top: 2px;
  cursor: pointer;
}
.mypet-breed:hover { text-decoration: underline; }
.mypet-meta { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
.mypet-diary-count { font-size: 0.75rem; color: var(--text-light); margin-top: 2px; }
.mypet-arrow { font-size: 1.5rem; color: var(--text-light); }
</style>
