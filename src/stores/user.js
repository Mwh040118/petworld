import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'
import * as api from '@/utils/api'

export const useUserStore = defineStore('user', () => {
  const mode = ref(localStorage.getItem('petworld_mode') || '')
  const language = ref(localStorage.getItem('petworld_lang') || 'zh')

  // 登录态
  const token = ref(localStorage.getItem('petworld_token') || '')
  const currentUser = ref(JSON.parse(localStorage.getItem('petworld_user') || 'null'))
  const username = ref(currentUser.value?.nickname || '')

  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => currentUser.value?.id || '')

  async function setMode(m) {
    mode.value = m
    await setStorage('petworld_mode', m)
  }

  async function setLanguage(lang) {
    language.value = lang
    await setStorage('petworld_lang', lang)
  }

  async function setUsername(name) {
    username.value = name
    await setStorage('petworld_username', name)
  }

  // 注册
  async function register(user, password, nickname) {
    const res = await api.auth.register(user, password, nickname)
    token.value = res.token
    currentUser.value = res.user
    username.value = res.user.nickname
    localStorage.setItem('petworld_token', res.token)
    localStorage.setItem('petworld_user', JSON.stringify(res.user))
    return res
  }

  // 登录
  async function login(user, password) {
    const res = await api.auth.login(user, password)
    token.value = res.token
    currentUser.value = res.user
    username.value = res.user.nickname
    localStorage.setItem('petworld_token', res.token)
    localStorage.setItem('petworld_user', JSON.stringify(res.user))
    return res
  }

  // 刷新用户信息
  async function refreshUser() {
    if (!token.value) return
    try {
      const user = await api.auth.getMe()
      currentUser.value = user
      username.value = user.nickname
      localStorage.setItem('petworld_user', JSON.stringify(user))
    } catch {}
  }

  // 登出
  function logout() {
    token.value = ''
    currentUser.value = null
    username.value = ''
    localStorage.removeItem('petworld_token')
    localStorage.removeItem('petworld_user')
  }

  // 自动恢复登录态
  async function init() {
    if (token.value) {
      await refreshUser()
    }
  }

  const isChild = computed(() => mode.value === 'child')

  return {
    mode, language, username, token, currentUser, isLoggedIn, userId,
    setMode, setLanguage, setUsername, register, login, logout, refreshUser, init, isChild
  }
})
