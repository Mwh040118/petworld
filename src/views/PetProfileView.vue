<template>
  <div class="profile-page page">
    <div class="page-header">
      <router-link to="/my-pets" class="back-btn">←</router-link>
      <h1 class="page-title">{{ pet?.name }}</h1>
      <button class="btn btn-sm btn-ghost" @click="showDelete = true">🗑️</button>
    </div>

    <template v-if="pet">
      <!-- Profile Hero -->
      <div class="profile-hero poke-card" style="margin-bottom: 16px;">
        <div class="profile-avatar pet-emoji-lg" :style="{ background: avatarBg }">
          <img v-if="pet.photo" :src="pet.photo" class="photo-preview" />
          <span v-else>{{ pet.emoji || '🐾' }}</span>
        </div>
        <div class="profile-info">
          <h2 class="profile-name">{{ pet.name }}</h2>
          <div class="profile-meta">
            <span v-if="pet.breedName" class="breed-link" @click="$router.push(`/pet/${pet.breedId}`)">
              📖 {{ pet.breedName }}
            </span>
            <span v-if="pet.age"> · 🎂 {{ pet.age }}</span>
            <span v-if="pet.gender && pet.gender !== 'unknown'">
              · {{ pet.gender === 'male' ? '♂️' : '♀️' }}
            </span>
          </div>
          <div v-if="pet.notes" class="profile-notes">{{ pet.notes }}</div>
        </div>
      </div>

      <!-- Care Advice -->
      <div v-if="breedInfo" class="care-advice poke-card" style="margin-bottom: 16px; border-left: 4px solid var(--green);">
        <div class="card-section-title">💡 {{ t('myPet.careAdvice') }}</div>
        <p style="white-space: pre-line; font-size: 0.85rem; color: var(--text-secondary);">{{ breedInfo.careTips[locale] }}</p>
        <button class="btn btn-sm btn-secondary" style="margin-top: 10px;" @click="$router.push(`/pet/${pet.breedId}`)">
          📖 {{ t('myPet.viewBreedInfo') }}
        </button>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" style="margin-bottom: 16px;">
        <button class="btn btn-primary" @click="$router.push(`/my-pets/${pet.id}/diary`)">
          📝 {{ t('myPet.addDiary') }}
        </button>
        <button class="btn btn-secondary" @click="$router.push({ path: `/my-pets/new`, query: { edit: pet.id } })">
          ✏️ {{ t('common.edit') }}
        </button>
      </div>

      <!-- Photo Album -->
      <div class="poke-card" style="margin-bottom: 16px; padding: 16px;">
        <PetPhotoAlbum :petId="pet.id" />
      </div>

      <!-- Diary Entries -->
      <div style="margin-bottom: 24px;">
        <h2 class="section-title">📖 {{ t('myPet.diary') }}</h2>
        <div v-if="!pet.diary || pet.diary.length === 0" class="empty-state" style="padding: 40px;">
          <span class="empty-icon">📝</span>
          <p class="empty-text" style="margin-bottom: 16px;">{{ t('common.noData') }}</p>
          <button class="btn btn-primary btn-sm" @click="$router.push(`/my-pets/${pet.id}/diary`)">
            + {{ t('myPet.addDiary') }}
          </button>
        </div>
        <div v-else class="diary-list">
          <div v-for="entry in pet.diary" :key="entry.id" class="diary-entry poke-card">
            <div class="diary-header">
              <span class="diary-date">{{ formatDate(entry.createdAt) }}</span>
              <button class="diary-delete" @click="deleteEntry(entry.id)">✕</button>
            </div>
            <div v-if="entry.title" class="diary-title">{{ entry.title }}</div>
            <p class="diary-content">{{ entry.content }}</p>
            <div v-if="entry.photo" class="diary-photo">
              <img :src="entry.photo" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Delete Modal -->
    <div v-if="showDelete" class="modal-overlay" @click.self="showDelete = false">
      <div class="modal-content">
        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">⚠️ {{ t('myPet.deleteConfirm') }}</h3>
        <div style="display:flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-ghost" style="flex:1" @click="showDelete = false">{{ t('common.cancel') }}</button>
          <button class="btn btn-danger" style="flex:1" @click="confirmDelete">{{ t('common.delete') }}</button>
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
      <router-link to="/my-pets" class="nav-item active">
        <span class="nav-icon">🐾</span><span>{{ t('nav.myPets') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMyPetsStore } from '@/stores/myPets'
import breeds from '@/data/breeds.json'
import PetPhotoAlbum from '@/components/PetPhotoAlbum.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const myPetsStore = useMyPetsStore()

const showDelete = ref(false)

const pet = computed(() => myPetsStore.getPet(route.params.id))
const breedInfo = computed(() => breeds.find(b => b.id === pet.value?.breedId))

const avatarBg = '#E8E0FF'

function formatDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function deleteEntry(entryId) {
  myPetsStore.deleteDiaryEntry(route.params.id, entryId)
}

function confirmDelete() {
  myPetsStore.deletePet(route.params.id)
  router.replace('/my-pets')
}
</script>

<style scoped>
.profile-hero {
  display: flex;
  gap: 16px;
  align-items: center;
}
.profile-avatar { flex-shrink: 0; overflow: hidden; }
.photo-preview { width: 100%; height: 100%; object-fit: cover; }
.profile-info { flex: 1; }
.profile-name { font-size: 1.3rem; font-weight: 900; }
.profile-meta { font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; }
.breed-link { color: var(--primary); cursor: pointer; }
.breed-link:hover { text-decoration: underline; }
.profile-notes { font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px; padding: 8px; background: var(--bg-overlay); border-radius: var(--radius-sm); }

.card-section-title { font-size: 0.95rem; font-weight: 800; margin-bottom: 8px; }

.quick-actions { display: flex; gap: 10px; }

.diary-entry { margin-bottom: 10px; padding: 16px; }
.diary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.diary-date { font-size: 0.75rem; color: var(--text-light); }
.diary-delete { color: var(--text-light); font-size: 0.85rem; padding: 2px 8px; border-radius: var(--radius-full); }
.diary-delete:hover { background: var(--red-light); color: var(--red); }
.diary-title { font-weight: 700; margin-bottom: 4px; }
.diary-content { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }
.diary-photo { margin-top: 8px; border-radius: var(--radius-md); overflow: hidden; }
.diary-photo img { width: 100%; max-height: 200px; object-fit: cover; }
</style>
