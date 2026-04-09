import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getStorage, setStorage, removeStorage } from '@/utils/storage'

// 科普宠物的用户上传图片，按品种ID分组存储
export const useBreedPhotosStore = defineStore('breedPhotos', () => {
  // 内存缓存：{ breedId: [{ id, url, caption, coverId?, createdAt }] }
  const cache = ref({})

  function _storageKey(breedId) {
    return `petworld_breedphotos_${breedId}`
  }

  function _coverKey(breedId) {
    return `petworld_breedcover_${breedId}`
  }

  function getPhotos(breedId) {
    if (!cache.value[breedId]) {
      try {
        cache.value[breedId] = JSON.parse(localStorage.getItem(_storageKey(breedId)) || '[]')
      } catch {
        cache.value[breedId] = []
      }
    }
    return cache.value[breedId]
  }

  function getCoverId(breedId) {
    return localStorage.getItem(_coverKey(breedId)) || null
  }

  async function _save(breedId) {
    await setStorage(_storageKey(breedId), cache.value[breedId])
  }

  async function addPhoto(breedId, photoData) {
    const photos = getPhotos(breedId)
    const photo = {
      id: Date.now().toString(),
      url: photoData.url,
      caption: photoData.caption || '',
      createdAt: new Date().toISOString()
    }
    photos.push(photo)
    if (photos.length === 1) {
      await setStorage(_coverKey(breedId), photo.id)
    }
    await _save(breedId)
    return photo.id
  }

  async function deletePhoto(breedId, photoId) {
    const photos = getPhotos(breedId)
    const idx = photos.findIndex(p => p.id === photoId)
    if (idx === -1) return
    photos.splice(idx, 1)
    const coverId = getCoverId(breedId)
    if (coverId === photoId) {
      if (photos.length > 0) {
        await setStorage(_coverKey(breedId), photos[0].id)
      } else {
        await removeStorage(_coverKey(breedId))
      }
    }
    await _save(breedId)
  }

  async function setCover(breedId, photoId) {
    await setStorage(_coverKey(breedId), photoId)
    cache.value[breedId] = [...(cache.value[breedId] || [])]
  }

  return { getPhotos, getCoverId, addPhoto, deletePhoto, setCover }
})
