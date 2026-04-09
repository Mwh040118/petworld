<template>
  <div class="add-pet-page page">
    <div class="page-header">
      <router-link to="/my-pets" class="back-btn">←</router-link>
      <h1 class="page-title">{{ t('myPet.addNew') }}</h1>
      <div style="width:40px"></div>
    </div>

    <div class="form-section">
      <!-- Emoji/Photo -->
      <div class="form-group" style="text-align:center; margin-bottom: 20px;">
        <div class="photo-upload pet-emoji-lg" :style="{ background: photoPreview ? 'none' : '#E8E0FF' }">
          <img v-if="photoPreview" :src="photoPreview" class="photo-preview" />
          <span v-else class="upload-hint">{{ form.emoji || '📸' }}</span>
        </div>
        <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" hidden />
        <div class="photo-actions">
          <button class="btn btn-sm btn-secondary" @click="showEmojiPicker = !showEmojiPicker">
            {{ locale === 'zh' ? '选Emoji' : 'Emoji' }}
          </button>
          <button class="btn btn-sm btn-secondary" @click="fileInput?.click()">
            {{ t('myPet.uploadPhoto') }}
          </button>
        </div>
      </div>

      <!-- Emoji Picker -->
      <div v-if="showEmojiPicker" class="emoji-picker poke-card" style="margin-bottom: 16px;">
        <div class="emoji-grid">
          <span v-for="e in emojiList" :key="e" class="emoji-opt" @click="form.emoji = e; showEmojiPicker = false">{{ e }}</span>
        </div>
      </div>

      <!-- Name -->
      <div class="form-group">
        <label class="form-label">{{ t('myPet.name') }} *</label>
        <input v-model="form.name" class="input-field" :placeholder="t('myPet.namePlaceholder')" maxlength="20" />
      </div>

      <!-- Species & Breed -->
      <div class="form-row">
        <div class="form-group" style="flex:1">
          <label class="form-label">{{ t('myPet.species') }}</label>
          <select v-model="form.category" class="input-field" @change="form.breedId = ''">
            <option value="">{{ locale === 'zh' ? '请选择' : 'Select' }}</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.emoji }} {{ cat.name[locale] }}</option>
          </select>
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">{{ t('myPet.breed') }}</label>
          <select v-model="form.breedId" class="input-field" @change="onBreedChange">
            <option value="">{{ locale === 'zh' ? '请选择品种' : 'Select breed' }}</option>
            <option v-for="b in availableBreeds" :key="b.id" :value="b.id">{{ b.name[locale] }}</option>
          </select>
        </div>
      </div>

      <!-- Age -->
      <div class="form-row">
        <div class="form-group" style="flex:1">
          <label class="form-label">{{ t('myPet.age') }}</label>
          <input v-model="form.age" class="input-field" type="text" :placeholder="locale === 'zh' ? '如: 2岁' : 'e.g. 2 years'" />
        </div>
        <div class="form-group" style="flex:1">
          <label class="form-label">{{ t('myPet.gender') }}</label>
          <div class="gender-select">
            <button :class="['gender-btn', { active: form.gender === 'male' }]" @click="form.gender = 'male'">
              ♂ {{ t('myPet.male') }}
            </button>
            <button :class="['gender-btn', { active: form.gender === 'female' }]" @click="form.gender = 'female'">
              ♀ {{ t('myPet.female') }}
            </button>
            <button :class="['gender-btn', { active: form.gender === 'unknown' }]" @click="form.gender = 'unknown'">
              ❓ {{ t('myPet.unknown') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Birthday -->
      <div class="form-group">
        <label class="form-label">{{ t('myPet.birthday') }}</label>
        <input v-model="form.birthday" class="input-field" type="date" />
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">{{ t('myPet.notes') }}</label>
        <textarea v-model="form.notes" class="input-field" rows="3" :placeholder="locale === 'zh' ? '写点备注...' : 'Notes...'"></textarea>
      </div>

      <button class="btn btn-primary btn-block btn-lg" @click="savePet" :disabled="!form.name.trim()" style="margin-top: 20px;">
        ✅ {{ t('common.save') }}
      </button>
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMyPetsStore } from '@/stores/myPets'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const router = useRouter()
const { t, locale } = useI18n()
const myPetsStore = useMyPetsStore()

const fileInput = ref(null)
const showEmojiPicker = ref(false)
const photoPreview = ref('')

const form = ref({
  name: '', emoji: '', category: '', breedId: '', breedName: '',
  age: '', gender: 'unknown', birthday: '', notes: '', photo: ''
})

const emojiList = ['🐱','🐶','🐰','🐢','🐍','🕷️','🦜','🐹','🐟','🐊','🦎','🐸','🐻','🐼','🐨','🦊','🐯','🦁','🐮','🐷','🐵','🐧','🦆','🦉','🐦','🐢','🐊','🐲','🦕','🐋','🐬','🦈','🐙','🦑','🦐','🦀','🐢']

const availableBreeds = computed(() => {
  if (!form.value.category) return []
  return breeds.filter(b => b.category === form.value.category)
})

function onBreedChange() {
  const breed = breeds.find(b => b.id === form.value.breedId)
  form.value.breedName = breed ? breed.name[locale.value] : ''
  form.value.emoji = breed?.emoji || form.value.emoji
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { photoPreview.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

function savePet() {
  if (!form.value.name.trim()) return
  const pet = { ...form.value, photo: photoPreview.value }
  const id = myPetsStore.addPet(pet)
  router.replace(`/my-pets/${id}`)
}
</script>

<style scoped>
.form-section { padding-top: 8px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; }
.form-row { display: flex; gap: 12px; }

.photo-upload {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
  border: 3px dashed var(--primary-light);
  cursor: pointer;
}
.upload-hint { font-size: 2rem; }
.photo-preview { width: 100%; height: 100%; object-fit: cover; }

.photo-actions { display: flex; gap: 8px; justify-content: center; margin-top: 10px; }

.emoji-picker { padding: 16px; }
.emoji-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.emoji-opt {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
}
.emoji-opt:hover { background: var(--bg-overlay); transform: scale(1.2); }

.gender-select { display: flex; gap: 6px; }
.gender-btn {
  flex: 1;
  padding: 10px 8px;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 700;
  border: 2px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  transition: var(--transition);
}
.gender-btn.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--purple-light);
}

select.input-field { appearance: auto; }
textarea.input-field { resize: vertical; min-height: 80px; }
</style>
