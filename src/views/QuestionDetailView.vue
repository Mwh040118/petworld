<template>
  <div class="qdetail-page page">
    <div class="page-header">
      <button class="back-btn" @click="router.back()">←</button>
      <h1 class="page-title">问题详情</h1>
      <div style="width:40px;"></div>
    </div>

    <div v-if="loading" class="skeleton" style="height: 200px;"></div>

    <div v-else-if="question" class="qdetail-card poke-card">
      <div class="q-header">
        <span class="q-avatar">{{ question.nickname?.[0] || '?' }}</span>
        <div>
          <div class="q-username">{{ question.nickname || question.username }}</div>
          <div class="q-time">{{ formatTime(question.created_at) }}</div>
        </div>
        <span v-if="question.resolved" class="tag tag-primary" style="background: var(--green); margin-left: auto;">✓ 已解决</span>
      </div>

      <h2 class="q-title">{{ question.title }}</h2>
      <p class="q-body">{{ question.content }}</p>

      <div v-if="question.images?.length" class="q-images">
        <img v-for="(img, i) in question.images" :key="i" :src="img" />
      </div>

      <div v-if="question.tags?.length" class="q-tags">
        <span v-for="t in question.tags" :key="t" class="tag tag-cat">#{{ t }}</span>
      </div>

      <!-- 回答列表 -->
      <div class="answers-section">
        <h3 class="section-title">💬 回答 ({{ question.answers?.length || 0 }})</h3>

        <div v-if="question.answers?.length" class="answer-list">
          <div v-for="a in question.answers" :key="a.id" class="answer-item" :class="{ accepted: a.accepted }">
            <div class="answer-header">
              <span class="answer-avatar">{{ a.nickname?.[0] || '?' }}</span>
              <span class="answer-name">{{ a.nickname || a.username }}</span>
              <span v-if="a.accepted" class="accepted-badge">✓ 最佳答案</span>
              <span class="answer-time">{{ formatTime(a.created_at) }}</span>
            </div>
            <p class="answer-content">{{ a.content }}</p>
            <button
              v-if="userStore.userId === question.user_id && !question.resolved"
              class="btn btn-sm btn-secondary accept-btn"
              @click="acceptAnswer(a.id)"
            >
              采纳
            </button>
          </div>
        </div>

        <div v-else class="empty-hint">暂无回答，快来帮 TA 吧</div>
      </div>

      <!-- 回答输入 -->
      <div v-if="userStore.isLoggedIn" class="answer-form">
        <textarea v-model="answerText" class="input-field" placeholder="写下你的回答..." rows="2"></textarea>
        <button class="btn btn-primary btn-sm" @click="submitAnswer" :disabled="!answerText.trim()">回答</button>
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

const question = ref(null)
const loading = ref(true)
const answerText = ref('')

onMounted(loadQuestion)

async function loadQuestion() {
  loading.value = true
  try {
    question.value = await api.questions.get(route.params.id)
  } catch {}
  loading.value = false
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t.replace(' ', 'T'))
  const diff = Date.now() - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function submitAnswer() {
  if (!answerText.value.trim()) return
  try {
    await api.questions.answer(route.params.id, answerText.value)
    answerText.value = ''
    await loadQuestion()
  } catch (e) {
    alert(e.message)
  }
}

async function acceptAnswer(answerId) {
  if (!confirm('采纳这个回答？')) return
  try {
    await api.questions.accept(route.params.id, answerId)
    await loadQuestion()
  } catch (e) {
    alert(e.message)
  }
}
</script>

<style scoped>
.q-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.q-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}

.q-username {
  font-weight: 700;
  font-size: 0.9rem;
}

.q-time {
  font-size: 0.75rem;
  color: var(--text-light);
}

.q-title {
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.q-body {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text);
  white-space: pre-wrap;
}

.q-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.q-images img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.q-tags {
  display: flex;
  gap: 6px;
  margin: 12px 0;
}

.answers-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid var(--border);
}

.answer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-item {
  padding: 14px;
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
}

.answer-item.accepted {
  border-color: var(--green);
  background: var(--green-light);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.answer-avatar {
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

.answer-name {
  font-weight: 700;
  font-size: 0.85rem;
}

.accepted-badge {
  font-size: 0.75rem;
  color: var(--green);
  font-weight: 700;
}

.answer-time {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-light);
}

.answer-content {
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.accept-btn {
  margin-top: 8px;
}

.empty-hint {
  text-align: center;
  color: var(--text-light);
  padding: 20px;
  font-size: 0.9rem;
}

.answer-form {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.answer-form textarea {
  resize: none;
}
</style>
