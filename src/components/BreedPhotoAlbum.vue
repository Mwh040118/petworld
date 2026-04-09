<template>
  <div class="breed-album">
    <!-- 标题栏 -->
    <div class="album-header">
      <div class="album-title-wrap">
        <h3 class="album-title">📸 {{ locale === 'zh' ? '图片库' : 'Photo Gallery' }}</h3>
        <span class="album-sub">{{ locale === 'zh' ? '孩子们上传的真实照片' : 'Photos uploaded by kids' }}</span>
      </div>
      <div class="album-header-right">
        <span class="photo-count" v-if="photos.length > 0">{{ photos.length }} {{ locale === 'zh' ? '张' : 'photos' }}</span>
        <button class="upload-btn" @click="triggerUpload">
          + {{ locale === 'zh' ? '上传照片' : 'Upload' }}
        </button>
      </div>
    </div>

    <!-- 相册网格 -->
    <div class="album-grid" v-if="photos.length > 0">
      <!-- 封面大图 -->
      <div class="cover-photo" @click="openViewer(coverPhoto)">
        <img :src="coverPhoto.url" :alt="coverPhoto.caption || ''" />
        <div class="cover-badge">⭐ {{ locale === 'zh' ? '精选' : 'Featured' }}</div>
        <div class="photo-overlay"><span class="view-icon">🔍</span></div>
      </div>

      <!-- 其他图片 -->
      <div
        v-for="photo in otherPhotos.slice(0, showAll ? 999 : 5)"
        :key="photo.id"
        class="thumb-photo"
        @click="openViewer(photo)"
      >
        <img :src="photo.url" :alt="photo.caption || ''" />
        <div class="photo-overlay"><span class="view-icon">🔍</span></div>
      </div>

      <!-- 更多提示 -->
      <div
        v-if="!showAll && otherPhotos.length > 5"
        class="thumb-photo more-btn"
        @click="showAll = true"
      >
        <span class="more-num">+{{ otherPhotos.length - 5 }}</span>
        <span class="more-text">{{ locale === 'zh' ? '查看全部' : 'View All' }}</span>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="album-empty" @click="triggerUpload">
      <div class="empty-emoji">📷</div>
      <p class="empty-tip">{{ locale === 'zh' ? '还没有照片，快来上传真实的' : 'No photos yet' }}</p>
      <p class="empty-sub" v-if="locale === 'zh'">{{ breedName }} {{ locale === 'zh' ? '照片吧！' : '' }}</p>
      <button class="btn btn-primary btn-sm" @click.stop="triggerUpload">
        📁 {{ locale === 'zh' ? '选择照片' : 'Choose Photos' }}
      </button>
    </div>

    <!-- 隐藏文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display:none"
      @change="onFilesSelected"
    />

    <!-- 全屏查看器 -->
    <Teleport to="body">
      <div v-if="viewerOpen" class="photo-viewer" @click.self="closeViewer">
        <div class="viewer-content">
          <!-- 顶部操作栏 -->
          <div class="viewer-header">
            <button class="viewer-close" @click="closeViewer">✕</button>
            <div class="viewer-title-wrap">
              <span class="viewer-breed">{{ breedName }}</span>
              <span class="viewer-caption">{{ viewerPhoto?.caption || '' }}</span>
            </div>
            <div class="viewer-actions">
              <button
                v-if="viewerPhoto?.id !== currentCoverId"
                class="viewer-btn cover-btn"
                @click="setCoverPhoto(viewerPhoto.id)"
              >
                ⭐ {{ locale === 'zh' ? '设为精选' : 'Feature' }}
              </button>
              <span v-else class="cover-badge-sm">⭐ {{ locale === 'zh' ? '精选中' : 'Featured' }}</span>
              <button class="viewer-btn delete-btn" @click="confirmDelete(viewerPhoto.id)">🗑️</button>
            </div>
          </div>

          <!-- 主图 -->
          <div class="viewer-img-wrap">
            <button class="nav-arrow left" @click="prevPhoto" v-if="photos.length > 1">‹</button>
            <img :src="viewerPhoto?.url" />
            <button class="nav-arrow right" @click="nextPhoto" v-if="photos.length > 1">›</button>
          </div>

          <!-- 底部缩略图 -->
          <div class="viewer-thumbs">
            <div
              v-for="photo in photos"
              :key="photo.id"
              :class="['viewer-thumb', { active: photo.id === viewerPhoto?.id }]"
              @click="viewerPhoto = photo"
            >
              <img :src="photo.url" />
              <span v-if="photo.id === currentCoverId" class="thumb-star">⭐</span>
            </div>
            <div class="viewer-thumb add-thumb" @click="triggerUpload">
              <span>+</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 上传进度 -->
    <Teleport to="body">
      <div v-if="uploading" class="upload-toast">
        ⏳ {{ locale === 'zh' ? `正在添加 ${uploadProgress}/${uploadTotal} 张...` : `Adding ${uploadProgress}/${uploadTotal}...` }}
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBreedPhotosStore } from '@/stores/breedPhotos'

const props = defineProps({
  breedId: { type: String, required: true },
  breedName: { type: String, default: '' }
})

const { locale } = useI18n()
const store = useBreedPhotosStore()

const fileInput = ref(null)
const viewerOpen = ref(false)
const viewerPhoto = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadTotal = ref(0)
const showAll = ref(false)

// 响应式读取照片列表（store 里用 reactive 触发）
const photos = computed(() => store.getPhotos(props.breedId))
const currentCoverId = computed(() => store.getCoverId(props.breedId))
const coverPhoto = computed(() => {
  if (!photos.value.length) return null
  return photos.value.find(p => p.id === currentCoverId.value) || photos.value[0]
})
const otherPhotos = computed(() => photos.value.filter(p => p.id !== coverPhoto.value?.id))

function triggerUpload() { fileInput.value?.click() }

function onFilesSelected(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return
  uploading.value = true
  uploadProgress.value = 0
  uploadTotal.value = files.length
  let i = 0
  function next() {
    if (i >= files.length) { uploading.value = false; fileInput.value.value = ''; return }
    const reader = new FileReader()
    reader.onload = ev => {
      store.addPhoto(props.breedId, {
        url: ev.target.result,
        caption: files[i].name.replace(/\.[^.]+$/, '')
      })
      uploadProgress.value = ++i
      next()
    }
    reader.readAsDataURL(files[i])
  }
  next()
}

function openViewer(photo) { viewerPhoto.value = photo; viewerOpen.value = true }
function closeViewer() { viewerOpen.value = false; viewerPhoto.value = null }

function prevPhoto() {
  const idx = photos.value.findIndex(p => p.id === viewerPhoto.value?.id)
  viewerPhoto.value = photos.value[(idx - 1 + photos.value.length) % photos.value.length]
}
function nextPhoto() {
  const idx = photos.value.findIndex(p => p.id === viewerPhoto.value?.id)
  viewerPhoto.value = photos.value[(idx + 1) % photos.value.length]
}

function setCoverPhoto(photoId) {
  store.setCover(props.breedId, photoId)
}

function confirmDelete(photoId) {
  const ok = confirm(locale.value === 'zh' ? '确定删除这张照片吗？' : 'Delete this photo?')
  if (!ok) return
  const nextIdx = photos.value.findIndex(p => p.id !== photoId)
  store.deletePhoto(props.breedId, photoId)
  if (photos.value.length > 0) {
    viewerPhoto.value = photos.value[0]
  } else {
    closeViewer()
  }
}
</script>

<style scoped>
.breed-album { position: relative; }

.album-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
}

.album-title-wrap { flex: 1; }
.album-title { font-size: 1rem; font-weight: 800; margin: 0 0 2px 0; }
.album-sub { font-size: 0.72rem; color: var(--text-light); }

.album-header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.photo-count {
  font-size: 0.75rem;
  color: var(--text-light);
  background: var(--bg-overlay);
  padding: 2px 8px;
  border-radius: 20px;
}

.upload-btn {
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--primary);
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  white-space: nowrap;
}
.upload-btn:hover { opacity: 0.88; }

/* 相册网格 */
.album-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.cover-photo {
  grid-column: span 3;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  background: #eee;
}

.cover-photo img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.cover-photo:hover img { transform: scale(1.03); }

.cover-badge {
  position: absolute;
  top: 8px; left: 8px;
  background: rgba(0,0,0,0.5);
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
  background: #eee;
}
.thumb-photo img {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s;
}
.thumb-photo:hover img { transform: scale(1.06); }

.photo-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.cover-photo:hover .photo-overlay,
.thumb-photo:hover .photo-overlay { background: rgba(0,0,0,0.2); }
.view-icon { font-size: 1.4rem; opacity: 0; transition: opacity 0.2s; }
.cover-photo:hover .view-icon,
.thumb-photo:hover .view-icon { opacity: 1; }

/* 更多 */
.more-btn {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: var(--bg-overlay) !important;
  border: 2px solid var(--border);
  gap: 2px;
}
.more-btn:hover { border-color: var(--primary); background: #EDE7FF !important; }
.more-num { font-size: 1.2rem; font-weight: 900; color: var(--primary); }
.more-text { font-size: 0.65rem; color: var(--text-secondary); }

/* 空状态 */
.album-empty {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 8px; padding: 28px 16px;
  border: 2px dashed var(--border);
  border-radius: 14px; cursor: pointer;
  background: var(--bg-overlay);
  transition: all 0.2s;
}
.album-empty:hover { border-color: var(--primary); background: #EDE7FF; }
.empty-emoji { font-size: 2.4rem; }
.empty-tip { font-size: 0.85rem; color: var(--text-secondary); margin: 0; text-align: center; }
.empty-sub { font-size: 0.85rem; color: var(--primary); font-weight: 700; margin: 0; }

/* 全屏查看器 */
.photo-viewer {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.92);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
}
.viewer-content {
  width: 100%; max-width: 600px;
  display: flex; flex-direction: column;
  height: 100dvh;
}
.viewer-header {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; flex-shrink: 0;
}
.viewer-close {
  color: white; font-size: 1.2rem;
  padding: 6px 10px; border-radius: 50%;
  background: rgba(255,255,255,0.15); line-height: 1;
}
.viewer-close:hover { background: rgba(255,255,255,0.3); }
.viewer-title-wrap { flex: 1; overflow: hidden; }
.viewer-breed { font-size: 0.9rem; font-weight: 700; color: white; display: block; }
.viewer-caption { font-size: 0.75rem; color: rgba(255,255,255,0.6); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
.viewer-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
.viewer-btn { font-size: 0.78rem; padding: 5px 10px; border-radius: 20px; font-weight: 600; }
.cover-btn { background: rgba(255,215,0,0.2); color: #FFD700; border: 1px solid rgba(255,215,0,0.4); }
.cover-btn:hover { background: rgba(255,215,0,0.35); }
.cover-badge-sm { font-size: 0.75rem; color: #FFD700; background: rgba(255,215,0,0.15); padding: 4px 8px; border-radius: 20px; }
.delete-btn { background: rgba(255,80,80,0.2); color: #ff6b6b; border: 1px solid rgba(255,80,80,0.3); font-size: 1rem; padding: 5px 8px; }
.delete-btn:hover { background: rgba(255,80,80,0.4); }

/* 主图区 + 左右箭头 */
.viewer-img-wrap {
  flex: 1; display: flex; align-items: center; justify-content: center;
  overflow: hidden; padding: 8px; position: relative;
}
.viewer-img-wrap img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 8px; }
.nav-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  color: white; font-size: 2.5rem; line-height: 1;
  background: rgba(255,255,255,0.12); border-radius: 50%;
  width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.nav-arrow:hover { background: rgba(255,255,255,0.28); }
.nav-arrow.left { left: 12px; }
.nav-arrow.right { right: 12px; }

/* 底部缩略图 */
.viewer-thumbs {
  display: flex; gap: 6px; padding: 10px 14px;
  overflow-x: auto; flex-shrink: 0; scrollbar-width: none;
}
.viewer-thumbs::-webkit-scrollbar { display: none; }
.viewer-thumb {
  flex-shrink: 0; width: 52px; height: 52px;
  border-radius: 8px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent;
  position: relative; transition: border-color 0.2s;
}
.viewer-thumb img { width: 100%; height: 100%; object-fit: cover; }
.viewer-thumb.active { border-color: var(--primary); }
.thumb-star { position: absolute; bottom: 1px; right: 1px; font-size: 0.55rem; line-height: 1; }
.add-thumb {
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.1);
  border: 2px dashed rgba(255,255,255,0.3) !important;
  font-size: 1.4rem; color: rgba(255,255,255,0.6);
}
.add-thumb:hover { border-color: rgba(255,255,255,0.6) !important; background: rgba(255,255,255,0.2); }

/* 上传提示 */
.upload-toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.75); color: white;
  padding: 8px 18px; border-radius: 20px;
  font-size: 0.85rem; z-index: 9998;
  backdrop-filter: blur(4px);
}
</style>
