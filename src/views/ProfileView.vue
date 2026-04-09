<template>
  <div class="profile-page page">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1 class="page-title">个人主页</h1>
      <div style="width:40px;"></div>
    </div>

    <div v-if="loading" class="skeleton" style="height: 200px;"></div>

    <div v-else-if="profileData" class="profile-info poke-card">
      <div class="profile-top">
        <div class="profile-avatar">
          <img v-if="profileData.avatar" :src="profileData.avatar" class="avatar-img" />
          <span v-else class="avatar-emoji">{{ profileData.nickname?.[0] || '🐾' }}</span>
        </div>
        <div class="profile-name-wrap">
          <h2 class="profile-name">{{ profileData.nickname || profileData.username }}</h2>
          <p class="profile-id">@{{ profileData.username }}</p>
        </div>
        <button
          v-if="userStore.userId !== profileData.id"
          class="btn btn-sm"
          :class="profileData.isFollowing ? 'btn-secondary' : 'btn-primary'"
          @click="toggleFollow"
        >
          {{ profileData.isFollowing ? '已关注' : '关注' }}
        </button>
      </div>

      <p class="profile-bio">{{ profileData.bio || '这个人很懒，什么都没写~' }}</p>

      <div class="profile-stats">
        <div class="stat-item"><strong>{{ profileData.postCount || 0 }}</strong><span>动态</span></div>
        <div class="stat-item"><strong>{{ profileData.petCount || 0 }}</strong><span>宠物</span></div>
        <div class="stat-item"><strong>{{ profileData.followerCount || 0 }}</strong><span>粉丝</span></div>
        <div class="stat-item"><strong>{{ profileData.followingCount || 0 }}</strong><span>关注</span></div>
      </div>
    </div>

    <!-- TA 的动态 -->
    <div class="section" style="margin-top: 20px;">
      <h2 class="section-title">📝 TA 的动态</h2>
      <div v-if="userPosts.length === 0" class="empty-hint">暂无动态</div>
      <div v-else class="post-list">
        <div v-for="post in userPosts" :key="post.id" class="post-card poke-card">
          <p class="post-content">{{ post.content }}</p>
          <div v-if="post.images?.length" class="post-images-grid">
            <img v-for="(img, i) in post.images" :key="i" :src="img" class="post-grid-img" />
          </div>
          <div class="post-footer">
            <span class="post-likes">❤️ {{ post.likes }}</span>
            <span class="post-time">{{ formatTime(post.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import * as api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const profileData = ref(null)
const userPosts = ref([])
const loading = ref(true)

onMounted(async () => {
  await Promise.all([loadProfile(), loadPosts()])
  loading.value = false
})

async function loadProfile() {
  try {
    profileData.value = await api.user.getProfile(route.params.userId)
  } catch {}
}

async function loadPosts() {
  try {
    const res = await api.posts.userPosts(route.params.userId)
    userPosts.value = res.posts
  } catch {}
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace(' ', 'T'))
  const diff = Date.now() - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function toggleFollow() {
  try {
    const res = await api.user.follow(route.params.userId)
    profileData.value.isFollowing = res.followed
    profileData.value.followerCount += res.followed ? 1 : -1
  } catch {}
}
</script>

<style scoped>
.profile-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.avatar-emoji { font-size: 2rem; }

.profile-name-wrap { flex: 1; }
.profile-name { font-size: 1.15rem; font-weight: 800; }
.profile-id { font-size: 0.8rem; color: var(--text-light); }

.profile-bio {
  margin: 14px 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: 14px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.stat-item {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-item strong {
  font-size: 1.1rem;
  color: var(--text);
}

.stat-item span {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.post-list { display: flex; flex-direction: column; gap: 12px; }

.post-card { padding: 14px; }

.post-content {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.post-images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 8px;
}

.post-grid-img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-light);
}

.empty-hint {
  text-align: center;
  color: var(--text-light);
  padding: 20px;
  font-size: 0.9rem;
}
</style>
