<template>
  <div class="identify-page page">
    <div class="page-header">
      <router-link to="/home" class="back-btn">←</router-link>
      <h1 class="page-title">🔍 {{ t('identify.title') }}</h1>
      <div style="width:40px"></div>
    </div>

    <p class="identify-desc">{{ t('identify.desc') }}</p>

    <!-- Upload Area -->
    <div v-if="!result" class="upload-area" @click="startIdentify" :class="{ 'is-analyzing': analyzing }">
      <div v-if="!analyzing">
        <div class="upload-icon animate-wiggle">📸</div>
        <p class="upload-text">{{ t('identify.upload') }}</p>
      </div>
      <div v-else class="analyzing">
        <div class="analyzing-spinner">🔍</div>
        <p class="analyzing-text">{{ t('identify.analyzing') }}</p>
        <div class="analyzing-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    </div>
    <input type="file" ref="fileInput" accept="image/*" @change="onFileChange" hidden />

    <!-- Result -->
    <div v-if="result" class="result-area">
      <div class="result-header">
        <div class="result-emoji pet-emoji-lg" :style="{ background: getCatBg(result.category) + '20' }">
          {{ result.emoji }}
        </div>
        <div class="result-info">
          <div class="result-label">{{ t('identify.result') }}</div>
          <div class="result-name">{{ result.name[locale] }}</div>
          <div class="result-confidence">
            {{ t('identify.confidence') }}:
            <span class="confidence-value">{{ result.confidence }}%</span>
          </div>
        </div>
      </div>

      <p class="result-summary">{{ result.temperament[locale] }}</p>

      <div class="result-actions">
        <router-link :to="`/pet/${result.id}`" class="btn btn-primary btn-block">
          📖 {{ t('identify.viewBreed') }}
        </router-link>
        <button class="btn btn-secondary btn-block" @click="reset" style="margin-top: 10px;">
          🔄 {{ t('identify.tryAgain') }}
        </button>
      </div>
    </div>

    <!-- Tips -->
    <div class="tips-section" style="margin-top: 24px;">
      <h3 class="section-title">💡 {{ locale === 'zh' ? '小贴士' : 'Tips' }}</h3>
      <div class="tip-item">
        <span>📷</span>
        <span>{{ locale === 'zh' ? '拍正面照，让宠物的特征更清晰' : 'Take a front-facing photo for clearer features' }}</span>
      </div>
      <div class="tip-item">
        <span>☀️</span>
        <span>{{ locale === 'zh' ? '光线充足的环境识别效果更好' : 'Better lighting improves recognition' }}</span>
      </div>
      <div class="tip-item">
        <span>🎯</span>
        <span>{{ locale === 'zh' ? '一次只拍一只宠物' : 'One pet per photo' }}</span>
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
      <router-link to="/my-pets" class="nav-item">
        <span class="nav-icon">🐾</span><span>{{ t('nav.myPets') }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import categories from '@/data/categories.json'
import breeds from '@/data/breeds.json'

const { t, locale } = useI18n()
const fileInput = ref(null)
const analyzing = ref(false)
const result = ref(null)

function startIdentify() {
  fileInput.value?.click()
}

function onFileChange(e) {
  const file = e.target.files[0]
  if (file) {
    simulateIdentify()
  }
}

function simulateIdentify() {
  analyzing.value = true
  result.value = null
  // Simulate AI recognition with random breed
  setTimeout(() => {
    const randomBreed = breeds[Math.floor(Math.random() * breeds.length)]
    result.value = {
      ...randomBreed,
      confidence: Math.floor(Math.random() * 20) + 80 // 80-99%
    }
    analyzing.value = false
  }, 2000)
}

function reset() {
  result.value = null
  analyzing.value = false
}

function getCatBg(catId) { return categories.find(c => c.id === catId)?.color || '#6C5CE7' }
</script>

<style scoped>
.identify-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.upload-area {
  border: 3px dashed var(--primary-light);
  border-radius: var(--radius-xl);
  padding: 48px 20px;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  background: var(--bg-card);
}
.upload-area:hover { border-color: var(--primary); background: var(--purple-light); }
.upload-area.is-analyzing { cursor: wait; border-color: var(--cyan); background: linear-gradient(135deg, #DFFFFE, #E8E0FF); }

.upload-icon { font-size: 3.5rem; margin-bottom: 12px; }
.upload-text { font-size: 1rem; font-weight: 700; color: var(--primary); }

.analyzing { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.analyzing-spinner { font-size: 3rem; animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.analyzing-text { font-size: 1rem; font-weight: 700; color: var(--primary); }
.analyzing-dots span { animation: blink 1.4s infinite; font-weight: 900; }
.analyzing-dots span:nth-child(2) { animation-delay: 0.2s; }
.analyzing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }

/* Result */
.result-area { margin-top: 20px; }
.result-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}
.result-label { font-size: 0.8rem; color: var(--text-secondary); }
.result-name { font-size: 1.3rem; font-weight: 900; }
.result-confidence { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
.confidence-value { font-weight: 800; color: var(--green); }
.result-summary {
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: 16px;
  background: var(--purple-light);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}
.result-actions { margin-top: 16px; }

/* Tips */
.tips-section { margin-top: 24px; }
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.tip-item span:first-child { font-size: 1.1rem; flex-shrink: 0; }
</style>
