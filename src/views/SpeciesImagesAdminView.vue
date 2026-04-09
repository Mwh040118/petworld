<template>
  <div class="admin-container">
    <!-- 顶部导航 -->
    <div class="admin-header">
      <div class="header-left">
        <h1>📸 物种图片管理</h1>
        <p class="subtitle">批量上传和管理物种图片</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary" @click="goBack">
          ← 返回
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalBreeds }}</div>
          <div class="stat-label">总品种数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ breedsWithImages }}</div>
          <div class="stat-label">有图片的品种</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <div class="stat-value">{{ breedsWithoutImages }}</div>
          <div class="stat-label">无图片的品种</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📸</div>
        <div class="stat-content">
          <div class="stat-value">{{ totalImages }}</div>
          <div class="stat-label">总图片数</div>
        </div>
      </div>
    </div>

    <!-- 布偶猫封面设置 -->
    <div class="special-section" v-if="ragdollImages.length > 0">
      <div class="section-header">
        <h2>🎯 布偶猫封面设置</h2>
        <p class="section-subtitle">系统已识别布偶猫图片，可立即设置为封面</p>
      </div>
      <div class="ragdoll-preview">
        <div class="cover-preview">
          <img :src="getImageUrl(ragdollImages[0])" alt="布偶猫封面" />
          <div class="cover-badge">封面推荐</div>
        </div>
        <div class="cover-info">
          <h3>布偶猫</h3>
          <p>图片路径: {{ ragdollImages[0] }}</p>
          <p>文件大小: {{ ragdollImageSize }}</p>
          <button class="btn btn-success" @click="uploadRagdollCover">
            📤 上传并设为封面
          </button>
        </div>
      </div>
    </div>

    <!-- 批量上传 -->
    <div class="upload-section">
      <div class="section-header">
        <h2>🚀 批量上传</h2>
        <p class="section-subtitle">上传现有图片到系统数据库</p>
      </div>
      
      <div class="upload-options">
        <div class="option-card" @click="startBatchUpload">
          <div class="option-icon">📦</div>
          <div class="option-content">
            <h3>批量上传所有图片</h3>
            <p>上传 {{ breedsWithImages }} 个品种的现有图片到数据库</p>
          </div>
        </div>
        
        <div class="option-card" @click="showCategoryFilter = true">
          <div class="option-icon">🐱</div>
          <div class="option-content">
            <h3>按分类上传</h3>
            <p>选择特定分类（猫、狗等）进行上传</p>
          </div>
        </div>
        
        <div class="option-card" @click="showManualUpload = true">
          <div class="option-icon">➕</div>
          <div class="option-content">
            <h3>手动上传单个品种</h3>
            <p>为特定品种上传图片</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 无图片品种列表 -->
    <div class="no-images-section">
      <div class="section-header">
        <h2>🚨 无图片品种列表</h2>
        <p class="section-subtitle">需要手动补充图片的品种</p>
      </div>
      
      <div class="breeds-grid">
        <div v-for="breed in noImageBreeds.slice(0, 20)" :key="breed.id" class="breed-card">
          <div class="breed-emoji">{{ getCategoryEmoji(breed.category) }}</div>
          <div class="breed-info">
            <h4>{{ breed.name_zh }}</h4>
            <p>{{ breed.name_en }}</p>
            <span class="category-badge">{{ breed.category }}</span>
          </div>
          <button class="btn btn-sm btn-outline" @click="uploadForBreed(breed)">
            上传图片
          </button>
        </div>
      </div>
      
      <div v-if="noImageBreeds.length > 20" class="show-more">
        <p>还有 {{ noImageBreeds.length - 20 }} 个无图片品种...</p>
        <button class="btn btn-sm" @click="showAllNoImages = !showAllNoImages">
          {{ showAllNoImages ? '收起' : '查看全部' }}
        </button>
      </div>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" class="upload-progress">
      <h3>📤 上传进度</h3>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="progress-info">
        <span>{{ uploadProgress }} / {{ uploadTotal }}</span>
        <span>{{ progressPercentage.toFixed(1) }}%</span>
      </div>
      <div class="current-task">
        {{ currentTask }}
      </div>
    </div>

    <!-- 模态框：分类选择 -->
    <div v-if="showCategoryFilter" class="modal-overlay" @click.self="showCategoryFilter = false">
      <div class="modal-content">
        <h3>选择分类</h3>
        <div class="category-list">
          <label v-for="category in categories" :key="category" class="category-item">
            <input type="checkbox" v-model="selectedCategories" :value="category" />
            <span>{{ getCategoryName(category) }}</span>
          </label>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="showCategoryFilter = false">取消</button>
          <button class="btn btn-primary" @click="uploadSelectedCategories">开始上传</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSpeciesImagesStore } from '@/stores/speciesImages'

const router = useRouter()
const speciesImagesStore = useSpeciesImagesStore()

// 数据
const breeds = ref([])
const manifest = ref({})
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadTotal = ref(0)
const currentTask = ref('')
const showCategoryFilter = ref(false)
const showManualUpload = ref(false)
const showAllNoImages = ref(false)
const selectedCategories = ref(['cat', 'dog'])

// 加载数据
onMounted(async () => {
  await loadBreedsData()
  await loadManifestData()
})

async function loadBreedsData() {
  try {
    const response = await fetch('/src/data/breeds.json')
    breeds.value = await response.json()
  } catch (error) {
    console.error('加载品种数据失败:', error)
  }
}

async function loadManifestData() {
  try {
    const response = await fetch('/dataset/images/manifest.json')
    manifest.value = await response.json()
  } catch (error) {
    console.error('加载图片清单失败:', error)
  }
}

// 计算属性
const totalBreeds = computed(() => breeds.value.length)

const breedsWithImages = computed(() => {
  return breeds.value.filter(breed => {
    const images = manifest.value[breed.id]
    return images && images.length > 0
  }).length
})

const breedsWithoutImages = computed(() => {
  return totalBreeds.value - breedsWithImages.value
})

const totalImages = computed(() => {
  let count = 0
  for (const images of Object.values(manifest.value)) {
    count += images.length
  }
  return count
})

const ragdollImages = computed(() => {
  return manifest.value['ragdoll'] || []
})

const ragdollImageSize = computed(() => {
  // 这里可以添加获取实际文件大小的逻辑
  return '123.2 KB'
})

const noImageBreeds = computed(() => {
  return breeds.value.filter(breed => {
    const images = manifest.value[breed.id]
    return !images || images.length === 0
  }).map(breed => ({
    id: breed.id,
    name_zh: breed.name.zh,
    name_en: breed.name.en,
    category: breed.category
  }))
})

const categories = computed(() => {
  const cats = new Set()
  breeds.value.forEach(breed => cats.add(breed.category))
  return Array.from(cats)
})

const progressPercentage = computed(() => {
  return uploadTotal.value > 0 ? (uploadProgress.value / uploadTotal.value) * 100 : 0
})

// 方法
function getImageUrl(imagePath) {
  // 转换为可访问的URL
  return `/dataset/images/${imagePath.replace(/\\/g, '/')}`
}

function getCategoryEmoji(category) {
  const emojis = {
    cat: '🐱',
    dog: '🐶',
    bird: '🐦',
    rabbit: '🐰',
    hamster: '🐹',
    fish: '🐠',
    turtle: '🐢',
    snake: '🐍',
    lizard: '🦎',
    frog: '🐸',
    spider: '🕷️',
    crocodile: '🐊'
  }
  return emojis[category] || '🐾'
}

function getCategoryName(category) {
  const names = {
    cat: '猫',
    dog: '狗',
    bird: '鸟',
    rabbit: '兔子',
    hamster: '仓鼠',
    fish: '鱼',
    turtle: '龟',
    snake: '蛇',
    lizard: '蜥蜴',
    frog: '蛙',
    spider: '蜘蛛',
    crocodile: '鳄鱼'
  }
  return names[category] || category
}

function goBack() {
  router.back()
}

async function uploadRagdollCover() {
  if (ragdollImages.value.length === 0) return
  
  uploading.value = true
  currentTask.value = '上传布偶猫封面图片...'
  uploadProgress.value = 0
  uploadTotal.value = 1
  
  try {
    const imageUrl = getImageUrl(ragdollImages.value[0])
    const result = await speciesImagesStore.addSpeciesImage('ragdoll', imageUrl, true)
    
    if (result.success) {
      alert('布偶猫封面图片上传成功！')
    } else {
      alert(`上传失败: ${result.error}`)
    }
  } catch (error) {
    alert(`上传错误: ${error.message}`)
  } finally {
    uploading.value = false
  }
}

async function startBatchUpload() {
  if (!confirm(`确定要批量上传 ${breedsWithImages.value} 个品种的图片吗？`)) {
    return
  }
  
  uploading.value = true
  currentTask.value = '开始批量上传...'
  uploadProgress.value = 0
  
  // 计算需要上传的总数
  let totalTasks = 0
  const tasks = []
  
  for (const breed of breeds.value) {
    const images = manifest.value[breed.id]
    if (images && images.length > 0) {
      // 每个品种至少上传1张（封面），最多3张
      const count = Math.min(3, images.length)
      totalTasks += count
      
      for (let i = 0; i < count; i++) {
        tasks.push({
          breedId: breed.id,
          imagePath: images[i],
          isCover: i === 0
        })
      }
    }
  }
  
  uploadTotal.value = totalTasks
  
  // 执行上传
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    currentTask.value = `上传 ${task.breedId} (${i + 1}/${tasks.length})...`
    
    try {
      const imageUrl = getImageUrl(task.imagePath)
      await speciesImagesStore.addSpeciesImage(task.breedId, imageUrl, task.isCover)
      uploadProgress.value++
    } catch (error) {
      console.error(`上传失败 ${task.breedId}:`, error)
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  uploading.value = false
  alert(`批量上传完成！成功: ${uploadProgress.value}/${totalTasks}`)
}

function uploadSelectedCategories() {
  showCategoryFilter.value = false
  // 实现按分类上传的逻辑
  alert('按分类上传功能开发中...')
}

function uploadForBreed(breed) {
  alert(`为 ${breed.name_zh} 上传图片功能开发中...`)
}
</script>

<style scoped>
.admin-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-left h1 {
  margin: 0;
  font-size: 1.8rem;
}

.subtitle {
  color: #666;
  margin: 5px 0 0;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

/* 特殊部分 */
.special-section {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0 0 10px;
}

.section-subtitle {
  color: #666;
  margin: 0 0 20px;
}

.ragdoll-preview {
  display: flex;
  gap: 30px;
  align-items: center;
}

.cover-preview {
  width: 200px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ffd700;
  color: #333;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.cover-info h3 {
  margin: 0 0 10px;
}

/* 上传选项 */
.upload-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.option-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid #e0e0e0;
}

.option-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-color: #4a6bff;
}

.option-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.option-content h3 {
  margin: 0 0 10px;
}

.option-content p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

/* 无图片品种 */
.breeds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.breed-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid #e0e0e0;
}

.breed-emoji {
  font-size: 2rem;
  margin-bottom: 10px;
}

.breed-info h4 {
  margin: 0 0 5px;
}

.breed-info p {
  color: #666;
  margin: 0 0 10px;
  font-size: 0.85rem;
}

.category-badge {
  background: #f0f0f0;
  color: #666;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.show-more {
  text-align: center;
  margin-top: 20px;
  padding: 20px;
}

/* 上传进度 */
.upload-progress {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  width: 300px;
  z-index: 1000;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
}

.progress-fill {
  height: 100%;
  background: #4a6bff;
  transition: width 0.3s;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.current-task {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #666;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 500px;
  width: 90%;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.category-item:hover {
  background: #f5f5f5;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #4a6bff;
  color: white;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 1px solid #4a6bff;
  color: #4a6bff;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.85rem;
}
</style>