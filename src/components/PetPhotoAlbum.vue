<template>
  <div class="photo-album">
    <!-- 标题栏 -->
    <div class="album-header">
      <h3 class="album-title">📸 {{ locale === 'zh' ? '宠物相册' : 'Photo Album' }}</h3>
      <span class="photo-count" v-if="photos.length > 0">{{ photos.length }} {{ locale === 'zh' ? '张' : 'photos' }}</span>
    </div>

    <!-- 相册网格 -->
    <div class="album-grid" v-if="photos.length > 0">
      <!-- 封面大图 -->
      <div class="cover-photo" @click="openViewer(coverPhoto)">
        <img :src="coverPhoto.url" :alt="coverPhoto.caption || ''" />
        <div class="cover-badge">⭐ {{ locale === 'zh' ? '封面' : 'Cover' }}</div>
        <div class="photo-overlay">
          <span class="view-icon">🔍</span>
        </div>
      </div>

      <!-- 其他照片小格 -->
      <div
        v-for="photo in otherPhotos"
        :key="photo.id"
        class="thumb-photo"
        @click="openViewer(photo)"
      >
        <img :src="photo.url" :alt="photo.caption || ''" />
        <div class="photo-overlay">
          <span class="view-icon">🔍</span>
        </div>
      </div>

      <!-- 添加按钮 -->
      <div class="thumb-photo add-btn" @click="triggerUpload">
        <span class="add-icon">+</span>
        <span class="add-text">{{ locale === 'zh' ? '添加' : 'Add' }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="album-empty" @click="triggerUpload">
      <div class="empty-icon-wrap">📷</div>
      <p>{{ locale === 'zh' ? '点击添加宠物照片' : 'Tap to add photos' }}</p>
      <button class="btn btn-primary btn-sm">
        📁 {{ locale === 'zh' ? '从相册选择' : 'Choose Photos' }}
      </button>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="onFilesSelected"
    />

    <!-- 全屏查看器 -->
    <Teleport to="body">
      <div v-if="viewerOpen" class="photo-viewer" @click.self="closeViewer">
        <div class="viewer-content">
          <!-- 顶部操作栏 -->
          <div class="viewer-header">
            <button class="viewer-close" @click="closeViewer">✕</button>
            <span class="viewer-caption">{{ viewerPhoto?.caption || (locale === 'zh' ? '无描述' : 'No caption') }}</span>
            <div class="viewer-actions">
              <button
                v-if="viewerPhoto?.id !== coverPhotoId"
                class="viewer-btn cover-btn"
                @click="setCoverPhoto(viewerPhoto.id)"
              >
                ⭐ {{ locale === 'zh' ? '设为封面' : 'Set Cover' }}
              </button>
              <span v-else class="cover-badge-sm">⭐ {{ locale === 'zh' ? '当前封面' : 'Cover' }}</span>
              <button class="viewer-btn delete-btn" @click="confirmDeletePhoto(viewerPhoto.id)">
                🗑️
              </button>
            </div>
          </div>

          <!-- 图片 -->
          <div class="viewer-img-wrap">
            <img :src="viewerPhoto?.url" />
          </div>

          <!-- 底部缩略图导航 -->
          <div class="viewer-thumbs">
            <div
              v-for="photo in photos"
              :key="photo.id"
              :class="['viewer-thumb', { active: photo.id === viewerPhoto?.id }]"
              @click="viewerPhoto = photo"
            >
              <img :src="photo.url" />
              <span v-if="photo.id === coverPhotoId" class="thumb-cover-dot">⭐</span>
            </div>
            <div class="viewer-thumb add-thumb" @click="triggerUpload">
              <span>+</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 上传进度提示 -->
    <div v-if="uploading" class="upload-toast">
      ⏳ {{ locale === 'zh' ? `正在添加 ${uploadProgress}/${uploadTotal} 张...` : `Adding ${uploadProgress}/${uploadTotal}...` }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMyPetsStore } from '@/stores/myPets'

const props = defineProps({
  petId: { type: String, required: true }
})

const { locale } = useI18n()
const myPetsStore = useMyPetsStore()

const fileInput = ref(null)
const viewerOpen = ref(false)
const viewerPhoto = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadTotal = ref(0)

const pet = computed(() => myPetsStore.getPet(props.petId))
const photos = computed(() => pet.value?.photos || [])
const coverPhotoId = computed(() => pet.value?.coverPhotoId)
const coverPhoto = computed(() => {
  if (!photos.value.length) return null
  return photos.value.find(p => p.id === coverPhotoId.value) || photos.value[0]
})
const otherPhotos = computed(() => photos.value.filter(p => p.id !== coverPhoto.value?.id))

function triggerUpload() {
  fileInput.value?.click()
}

function onFilesSelected(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return

  uploading.value = true
  uploadProgress.value = 0
  uploadTotal.value = files.length

  let i = 0
  function processNext() {
    if (i >= files.length) {
      uploading.value = false
      fileInput.value.value = ''
      return
    }
    const file = files[i]
    const reader = new FileReader()
    reader.onload = (ev) => {
      myPetsStore.addPhoto(props.petId, {
        url: ev.target.result,
        caption: file.name.replace(/\.[^.]+$/, '')
      })
      uploadProgress.value = ++i
      processNext()
    }
    reader.readAsDataURL(file)
  }
  processNext()
}

function openViewer(photo) {
  viewerPhoto.value = photo
  viewerOpen.value = true
}

function closeViewer() {
  viewerOpen.value = false
  viewerPhoto.value = null
}

function setCoverPhoto(photoId) {
  myPetsStore.setCover(props.petId, photoId)
  viewerPhoto.value = photos.value.find(p => p.id === photoId)
}

function confirmDeletePhoto(photoId) {
  const ok = confirm(locale.value === 'zh' ? '确定删除这张照片吗？' : 'Delete this photo?')
  if (ok) {
    const isViewing = viewerPhoto.value?.id === photoId
    myPetsStore.deletePhoto(props.petId, photoId)
    if (isViewing) {
      if (photos.value.length > 0) {
        viewerPhoto.value = photos.value[0]
      } else {
        closeViewer()
      }
    }
  }
}
</script>

<style scoped>
.photo-album {
  position: relative;
}

.album-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.album-title {
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.photo-count {
  font-size: 0.8rem;
  color: var(--text-light);
  background: var(--bg-overlay);
  padding: 2px 8px;
  border-radius: 20px;
}

/* 相册网格 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.cover-photo {
  grid-column: span 3;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #f0f0f0;
}

.cover-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.cover-photo:hover img {
  transform: scale(1.03);
}

.cover-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0,0,0,0.55);
  color: #FFD700;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.thumb-photo {
  aspect-ratio: 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #f0f0f0;
}

.thumb-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.thumb-photo:hover img {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.cover-photo:hover .photo-overlay,
.thumb-photo:hover .photo-overlay {
  background: rgba(0,0,0,0.25);
}

.view-icon {
  font-size: 1.5rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.cover-photo:hover .view-icon,
.thumb-photo:hover .view-icon {
  opacity: 1;
}

/* 添加按钮 */
.add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-overlay) !important;
  border: 2px dashed var(--border);
  gap: 2px;
}

.add-btn:hover {
  border-color: var(--primary);
  background: #EDE7FF !important;
}

.add-icon {
  font-size: 1.8rem;
  color: var(--primary);
  line-height: 1;
}

.add-text {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

/* 空状态 */
.album-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 16px;
  border: 2px dashed var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-overlay);
}

.album-empty:hover {
  border-color: var(--primary);
  background: #EDE7FF;
}

.empty-icon-wrap {
  font-size: 2.5rem;
}

.album-empty p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* 全屏查看器 */
.photo-viewer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.viewer-content {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  height: 100dvh;
}

.viewer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  flex-shrink: 0;
}

.viewer-close {
  color: white;
  font-size: 1.2rem;
  padding: 6px 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  line-height: 1;
}

.viewer-close:hover {
  background: rgba(255,255,255,0.3);
}

.viewer-caption {
  flex: 1;
  color: rgba(255,255,255,0.8);
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.viewer-btn {
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: 600;
}

.cover-btn {
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
  border: 1px solid rgba(255, 215, 0, 0.4);
}

.cover-btn:hover {
  background: rgba(255, 215, 0, 0.35);
}

.cover-badge-sm {
  font-size: 0.78rem;
  color: #FFD700;
  background: rgba(255, 215, 0, 0.15);
  padding: 4px 8px;
  border-radius: 20px;
}

.delete-btn {
  background: rgba(255, 80, 80, 0.2);
  color: #ff6b6b;
  border: 1px solid rgba(255, 80, 80, 0.3);
  font-size: 1rem;
  padding: 5px 8px;
}

.delete-btn:hover {
  background: rgba(255, 80, 80, 0.4);
}

.viewer-img-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 8px;
}

.viewer-img-wrap img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

/* 底部缩略图 */
.viewer-thumbs {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}

.viewer-thumbs::-webkit-scrollbar { display: none; }

.viewer-thumb {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  position: relative;
  transition: border-color 0.2s;
}

.viewer-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.viewer-thumb.active {
  border-color: var(--primary);
}

.thumb-cover-dot {
  position: absolute;
  bottom: 1px;
  right: 1px;
  font-size: 0.6rem;
  line-height: 1;
}

.add-thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.1);
  border: 2px dashed rgba(255,255,255,0.3);
  font-size: 1.4rem;
  color: rgba(255,255,255,0.6);
}

.add-thumb:hover {
  border-color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.2);
}

/* 上传提示 */
.upload-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.75);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 999;
  backdrop-filter: blur(4px);
}
</style>
