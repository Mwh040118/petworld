<template>
  <div class="questions-page page">
    <div class="page-header">
      <h1 class="page-title">❓ 宠物问答</h1>
      <button v-if="userStore.isLoggedIn" class="btn btn-primary btn-sm" @click="showForm = !showForm">+ 提问</button>
    </div>

    <!-- 提问表单 -->
    <div v-if="showForm" class="question-form poke-card">
      <input v-model="newQ.title" class="input-field" placeholder="问题标题" />
      <textarea v-model="newQ.content" class="input-field" placeholder="详细描述你的问题..." rows="3"></textarea>
      <div class="form-actions">
        <label class="tag-btn">
          # 标签
          <input type="text" v-model="tagInput" @keyup.enter="addTag" placeholder="输入标签" hidden />
        </label>
        <button class="btn btn-primary btn-sm" @click="submitQ" :disabled="!newQ.title.trim()">发布</button>
      </div>
      <div v-if="newQ.tags.length" class="tag-list">
        <span v-for="(t, i) in newQ.tags" :key="i" class="tag tag-primary">#{{ t }} <span @click="newQ.tags.splice(i, 1)">✕</span></span>
      </div>
    </div>

    <!-- 问题列表 -->
    <div v-if="loading" class="loading-state">
      <div class="skeleton" style="height: 100px; margin-bottom: 12px;"></div>
      <div class="skeleton" style="height: 100px;"></div>
    </div>

    <div v-else-if="qList.length === 0" class="empty-state">
      <div class="empty-icon">🤔</div>
      <p class="empty-text">还没有问题，快来提问吧</p>
    </div>

    <div v-else class="question-list">
      <div v-for="q in qList" :key="q.id" class="question-card poke-card" @click="goDetail(q.id)">
        <div class="q-header">
          <div class="q-user">
            <span class="q-avatar">{{ q.nickname?.[0] || '🐾' }}</span>
            <span class="q-username">{{ q.nickname || q.username }}</span>
          </div>
          <span v-if="q.resolved" class="tag tag-primary" style="background: var(--green);">✓ 已解决</span>
        </div>
        <h3 class="q-title">{{ q.title }}</h3>
        <p class="q-content">{{ q.content }}</p>
        <div class="q-footer">
          <span class="q-count">💬 {{ q.answer_count || 0 }}</span>
          <span class="q-time">{{ formatTime(q.created_at) }}</span>
        </div>
      </div>
    </div>

    <BottomNav active="questions" />
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

const qList = ref([])
const loading = ref(true)
const showForm = ref(false)
const tagInput = ref('')
const newQ = ref({ title: '', content: '', tags: [] })

onMounted(loadQuestions)

async function loadQuestions() {
  loading.value = true
  try {
    const res = await api.questions.list()
    qList.value = res.questions
  } catch {}
  loading.value = false
}

function addTag() {
  const t = tagInput.value.trim()
  if (t && !newQ.value.tags.includes(t)) {
    newQ.value.tags.push(t)
  }
  tagInput.value = ''
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace(' ', 'T'))
  const diff = Date.now() - d
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function submitQ() {
  if (!newQ.value.title.trim()) return
  try {
    await api.questions.create(newQ.value.title, newQ.value.content, [], newQ.value.tags)
    newQ.value = { title: '', content: '', tags: [] }
    showForm.value = false
    await loadQuestions()
  } catch (e) {
    alert(e.message)
  }
}

function goDetail(id) {
  router.push(`/questions/${id}`)
}
</script>

<style scoped>
.question-form {
  margin-bottom: 16px;
  padding: 16px;
}

.question-form .input-field {
  margin-bottom: 10px;
}

.question-form textarea {
  resize: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-btn {
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-list .tag span {
  cursor: pointer;
  margin-left: 4px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.question-card {
  padding: 16px;
  cursor: pointer;
}

.q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.q-user {
  display: flex;
  align-items: center;
  gap: 6px;
}

.q-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.q-username {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.q-title {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--text);
}

.q-content {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.q-footer {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: var(--text-light);
}

.loading-state { margin-top: 20px; }
</style>
