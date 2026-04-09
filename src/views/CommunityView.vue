<template>
  <div class="community-page page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">🐾 社区动态</h1>
      <div class="header-actions">
        <button class="icon-btn" @click="showPostForm = !showPostForm">✏️</button>
      </div>
    </div>

    <!-- 发帖表单 -->
    <div v-if="showPostForm" class="post-form poke-card">
      <textarea
        v-model="newPost.content"
        class="input-field post-textarea"
        placeholder="分享你和宠物的日常..."
        rows="3"
      ></textarea>
      <div v-if="newPost.images.length" class="post-images">
        <div v-for="(img, i) in newPost.images" :key="i" class="post-img-item">
          <img :src="img" />
          <button class="post-img-del" @click="newPost.images.splice(i, 1)">✕</button>
        </div>
      </div>
      <div class="post-actions">
        <label class="post-img-btn">
          📷
          <input type="file" accept="image/*" multiple hidden @change="handleImageSelect" />
        </label>
        <button class="btn btn-primary btn-sm" @click="submitPost" :disabled="!newPost.content.trim() || submitting">
          {{ submitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>

    <!-- 动态列表 -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton" style="height: 120px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 120px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 120px;"></div>
    </div>

    <div v-else-if="postList.length === 0" class="empty-state">
      <div class="empty-icon">🐈</div>
      <p class="empty-text">还没有动态，快来发第一条吧！</p>
    </div>

    <div v-else class="post-list">
      <div v-for="post in postList" :key="post.id" class="post-card poke-card">
        <div class="post-header">
          <div class="post-avatar" @click="goProfile(post.user_id)">
            <img v-if="post.avatar" :src="post.avatar" class="avatar-img" />
            <span v-else class="avatar-emoji">🐾</span>
          </div>
          <div class="post-user-info">
            <span class="post-username" @click="goProfile(post.user_id)">{{ post.nickname || post.username }}</span>
            <span class="post-time">{{ formatTime(post.created_at) }}</span>
          </div>
          <button v-if="post.user_id === userStore.userId" class="post-delete" @click="deletePost(post.id)">🗑️</button>
        </div>

        <p class="post-content">{{ post.content }}</p>

        <div v-if="post.images && post.images.length" class="post-images-grid">
          <img v-for="(img, i) in post.images" :key="i" :src="img" class="post-grid-img" />
        </div>

        <div class="post-footer">
          <button class="post-action" :class="{ liked: post.isLiked }" @click="toggleLike(post)">
            {{ post.isLiked ? '❤️' : '🤍' }} {{ post.likes }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Nav -->
    <BottomNav active="community" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as api from '@/utils/api'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const userStore = useUserStore()

const postList = ref([])
const loading = ref(true)
const showPostForm = ref(false)
const submitting = ref(false)
const newPost = ref({ content: '', images: [] })

onMounted(async () => {
  await loadPosts()
})

async function loadPosts() {
  loading.value = true
  try {
    const res = await api.posts.list()
    postList.value = res.posts
  } catch {}
  loading.value = false
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace(' ', 'T'))
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function handleImageSelect(e) {
  const files = Array.from(e.target.files).slice(0, 9 - newPost.value.images.length)
  for (const file of files) {
    try {
      const res = await api.uploadImage(file)
      newPost.value.images.push(res.url)
    } catch {}
  }
  e.target.value = ''
}

async function submitPost() {
  if (!newPost.value.content.trim() || submitting.value) return
  submitting.value = true
  try {
    await api.posts.create(newPost.value.content, newPost.value.images)
    newPost.value = { content: '', images: [] }
    showPostForm.value = false
    await loadPosts()
  } catch (e) {
    alert(e.message)
  } finally {
    submitting.value = false
  }
}

async function toggleLike(post) {
  try {
    const res = await api.posts.like(post.id)
    post.isLiked = res.liked
    post.likes += res.liked ? 1 : -1
  } catch {}
}

async function deletePost(id) {
  if (!confirm('确定删除这条动态？')) return
  try {
    await api.posts.delete(id)
    postList.value = postList.value.filter(p => p.id !== id)
  } catch {}
}

function goProfile(userId) {
  router.push(`/profile/${userId}`)
}
</script>

<style scoped>
.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

/* Post Form */
.post-form {
  margin-bottom: 16px;
  padding: 16px;
}

.post-textarea {
  resize: none;
  min-height: 80px;
  margin-bottom: 12px;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.post-img-item {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
}

.post-img-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-img-del {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-img-btn {
  font-size: 1.3rem;
  cursor: pointer;
}

/* Post Card */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.post-card {
  padding: 16px;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-emoji {
  font-size: 1.3rem;
}

.post-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.post-username {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
}

.post-time {
  font-size: 0.75rem;
  color: var(--text-light);
}

.post-delete {
  font-size: 0.85rem;
  opacity: 0.5;
  transition: var(--transition);
}

.post-delete:hover {
  opacity: 1;
}

.post-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text);
  margin-bottom: 10px;
  white-space: pre-wrap;
  word-break: break-all;
}

.post-images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
}

.post-grid-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.post-footer {
  display: flex;
  gap: 16px;
}

.post-action {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  transition: var(--transition);
}

.post-action.liked {
  color: var(--pink);
}

.loading-state {
  margin-top: 20px;
}
</style>
