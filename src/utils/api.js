/**
 * PetWorld API 封装
 * 所有请求自动带 token
 */

const BASE = '/api'

function getToken() {
  return localStorage.getItem('petworld_token') || ''
}

async function request(url, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${url}`, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    if (res.status === 401) {
      // token 过期，清除登录状态
      localStorage.removeItem('petworld_token')
      localStorage.removeItem('petworld_user')
      window.location.hash = '#/login'
    }
    throw new Error(data.error || '请求失败')
  }

  return data
}

// === Auth ===
export const auth = {
  register: (username, password, nickname) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, nickname }) }),

  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getMe: () => request('/auth/me')
}

// === User ===
export const user = {
  getProfile: (userId) => request(`/user/${userId}`),
  updateProfile: (data) => request('/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
  follow: (userId) => request(`/user/${userId}/follow`, { method: 'POST' })
}

// === Posts ===
export const posts = {
  list: (page = 1) => request(`/posts?page=${page}`),
  create: (content, images = []) =>
    request('/posts', { method: 'POST', body: JSON.stringify({ content, images }) }),
  like: (postId) => request(`/posts/${postId}/like`, { method: 'POST' }),
  delete: (postId) => request(`/posts/${postId}`, { method: 'DELETE' }),
  userPosts: (userId, page = 1) => request(`/posts/user/${userId}?page=${page}`)
}

// === Questions ===
export const questions = {
  list: (page = 1) => request(`/questions?page=${page}`),
  get: (id) => request(`/questions/${id}`),
  create: (title, content, images = [], tags = []) =>
    request('/questions', { method: 'POST', body: JSON.stringify({ title, content, images, tags }) }),
  answer: (questionId, content) =>
    request(`/questions/${questionId}/answers`, { method: 'POST', body: JSON.stringify({ content }) }),
  accept: (questionId, answerId) =>
    request(`/questions/${questionId}/answers/${answerId}/accept`, { method: 'POST' })
}

// === Spotlights ===
export const spotlights = {
  list: () => request('/spotlights'),
  create: (image, caption, petId, days) =>
    request('/spotlights', { method: 'POST', body: JSON.stringify({ image, caption, pet_id: petId, days }) })
}

// === Pets ===
export const pets = {
  list: () => request('/pets'),
  create: (data) => request('/pets', { method: 'POST', body: JSON.stringify(data) }),
  update: (petId, data) => request(`/pets/${petId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (petId) => request(`/pets/${petId}`, { method: 'DELETE' }),
  getDiaries: (petId) => request(`/pets/${petId}/diaries`),
  addDiary: (petId, content, images = []) =>
    request(`/pets/${petId}/diaries`, { method: 'POST', body: JSON.stringify({ content, images }) })
}

// === Upload ===
export function uploadImage(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('image', file)
  return fetch(`${BASE}/upload/image`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  }).then(r => r.json())
}

export function uploadImages(files) {
  const token = getToken()
  const formData = new FormData()
  files.forEach(f => formData.append('images', f))
  return fetch(`${BASE}/upload/images`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  }).then(r => r.json())
}

// === 物种图片 ===
export const speciesImages = {
  // 获取物种图片
  get: (breedId) => request(`/species-images/${breedId}/images`),
  
  // 上传物种图片
  upload: (breedId, imageUrl, isCover = false) =>
    request(`/species-images/${breedId}/images`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl, isCover })
    }),
  
  // 批量上传
  batchUpload: (breedId, images) =>
    request('/species-images/batch-upload', {
      method: 'POST',
      body: JSON.stringify({ breedId, images })
    }),
  
  // 设置封面图片
  setCover: (breedId, imageId) =>
    request(`/species-images/${breedId}/images/${imageId}/cover`, {
      method: 'PUT'
    }),
  
  // 删除图片
  delete: (breedId, imageId) =>
    request(`/species-images/${breedId}/images/${imageId}`, {
      method: 'DELETE'
    })
}
