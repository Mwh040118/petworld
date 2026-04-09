<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">🐾</div>
      <h1 class="auth-title">PetWorld</h1>
      <p class="auth-subtitle">{{ isLogin ? '登录账号' : '注册新账号' }}</p>

      <div class="auth-form">
        <div class="form-group">
          <input
            v-model="form.username"
            class="input-field"
            placeholder="用户名"
            @keyup.enter="isLogin ? handleLogin() : handleRegister()"
          />
        </div>

        <div v-if="!isLogin" class="form-group">
          <input
            v-model="form.nickname"
            class="input-field"
            placeholder="昵称（选填）"
            @keyup.enter="handleRegister()"
          />
        </div>

        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            class="input-field"
            placeholder="密码"
            @keyup.enter="isLogin ? handleLogin() : handleRegister()"
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button class="btn btn-primary btn-block" @click="isLogin ? handleLogin() : handleRegister()" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登录' : '注册') }}
        </button>

        <p class="auth-switch">
          <span v-if="isLogin">还没有账号？<a @click="isLogin = false; error = ''">去注册</a></span>
          <span v-else>已有账号？<a @click="isLogin = true; error = ''">去登录</a></span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', password: '', nickname: '' })

onMounted(() => {
  if (userStore.isLoggedIn) {
    router.replace('/home')
  }
})

async function handleLogin() {
  error.value = ''
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }
  loading.value = true
  try {
    await userStore.login(form.value.username, form.value.password)
    router.replace('/home')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  error.value = ''
  if (!form.value.username || !form.value.password) {
    error.value = '请填写用户名和密码'
    return
  }
  if (form.value.password.length < 4) {
    error.value = '密码至少 4 个字符'
    return
  }
  loading.value = true
  try {
    await userStore.register(form.value.username, form.value.password, form.value.nickname)
    router.replace('/home')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px 28px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  box-shadow: var(--shadow-lg);
  animation: bounce-in 0.5s ease-out;
}

.auth-logo {
  font-size: 3.5rem;
  margin-bottom: 8px;
  animation: float 3s ease-in-out infinite;
}

.auth-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
}

.auth-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 28px;
}

.auth-form {
  text-align: left;
}

.form-group {
  margin-bottom: 14px;
}

.auth-error {
  color: var(--red);
  font-size: 0.85rem;
  margin-bottom: 12px;
  text-align: center;
}

.auth-switch {
  text-align: center;
  margin-top: 16px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.auth-switch a {
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
