<template>
  <div class="diary-page page">
    <div class="page-header">
      <router-link :to="`/my-pets/${petId}`" class="back-btn">←</router-link>
      <h1 class="page-title">📝 {{ t('myPet.addDiary') }}</h1>
      <div style="width:40px"></div>
    </div>

    <div class="form-section">
      <div class="form-group">
        <label class="form-label">{{ t('myPet.diaryTitle') }}</label>
        <input v-model="entry.title" class="input-field" :placeholder="locale === 'zh' ? '今天的心情...' : 'Today\'s mood...'" maxlength="50" />
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('myPet.diaryContent') }}</label>
        <textarea v-model="entry.content" class="input-field" rows="6" :placeholder="t('myPet.diaryContent')"></textarea>
      </div>

      <div class="form-group" style="text-align: center;">
        <div class="photo-upload-area" @click="pickPhoto" :style="entry.photo ? {} : {}">
          <img v-if="entry.photo" :src="entry.photo" class="diary-photo-preview" />
          <div v-else class="upload-placeholder">
            <span style="font-size: 2rem;">📷</span>
            <span style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">{{ t('myPet.diaryPhoto') }}</span>
          </div>
        </div>
        <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" hidden />
      </div>

      <button class="btn btn-primary btn-block btn-lg" @click="saveEntry" :disabled="!entry.content.trim()" style="margin-top: 20px;">
        ✅ {{ t('common.save') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMyPetsStore } from '@/stores/myPets'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const myPetsStore = useMyPetsStore()

const petId = route.params.id
const fileInput = ref(null)

const entry = ref({
  title: '',
  content: '',
  photo: ''
})

function pickPhoto() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => { entry.value.photo = ev.target.result }
    reader.readAsDataURL(file)
  }
}

function saveEntry() {
  if (!entry.value.content.trim()) return
  myPetsStore.addDiaryEntry(petId, { ...entry.value })
  router.back()
}
</script>

<style scoped>
.form-section { padding-top: 8px; }
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 6px; }
textarea.input-field { resize: vertical; }

.photo-upload-area {
  width: 100%;
  min-height: 180px;
  border: 2.5px dashed var(--primary-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: var(--transition);
  background: var(--bg-card);
}
.photo-upload-area:hover { border-color: var(--primary); background: var(--purple-light); }

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.diary-photo-preview {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
}
</style>
