import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '@/utils/api'

// 物种图片存储，使用后端API
export const useSpeciesImagesStore = defineStore('speciesImages', () => {
  // 内存缓存：{ breedId: { images: [], coverImage: null } }
  const cache = ref({})
  
  // 获取物种图片
  async function getSpeciesImages(breedId) {
    if (!cache.value[breedId]) {
      try {
        const response = await api.speciesImages.get(breedId)
        if (response.success) {
          cache.value[breedId] = {
            images: response.images || [],
            coverImage: response.coverImage || null
          }
        } else {
          cache.value[breedId] = { images: [], coverImage: null }
        }
      } catch (error) {
        console.error('获取物种图片失败:', error)
        cache.value[breedId] = { images: [], coverImage: null }
      }
    }
    return cache.value[breedId].images
  }
  
  // 获取封面图片
  function getCoverImage(breedId) {
    if (!cache.value[breedId]) {
      return null
    }
    return cache.value[breedId].coverImage
  }
  
  // 获取封面图片ID
  function getCoverId(breedId) {
    const coverImage = getCoverImage(breedId)
    return coverImage ? coverImage.id : null
  }
  
  // 清除缓存
  function clearCache(breedId) {
    if (breedId) {
      delete cache.value[breedId]
    } else {
      cache.value = {}
    }
  }
  
  // 添加物种图片
  async function addSpeciesImage(breedId, imageUrl, isCover = false) {
    try {
      const response = await api.speciesImages.upload(breedId, imageUrl, isCover)
      if (response.success) {
        // 清除缓存以重新加载
        clearCache(breedId)
        return response
      }
      return { success: false, error: response.error }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // 批量添加物种图片
  async function batchAddSpeciesImages(breedId, images) {
    try {
      const response = await api.speciesImages.batchUpload(breedId, images)
      if (response.success) {
        clearCache(breedId)
      }
      return response
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // 设置封面图片
  async function setCoverImage(breedId, imageId) {
    try {
      const response = await api.speciesImages.setCover(breedId, imageId)
      if (response.success) {
        clearCache(breedId)
      }
      return response
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // 删除物种图片
  async function deleteSpeciesImage(breedId, imageId) {
    try {
      const response = await api.speciesImages.delete(breedId, imageId)
      if (response.success) {
        clearCache(breedId)
      }
      return response
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  // 预加载物种图片（用于多个品种）
  async function preloadSpeciesImages(breedIds) {
    const promises = breedIds.map(breedId => getSpeciesImages(breedId))
    await Promise.all(promises)
  }
  
  return {
    getSpeciesImages,
    getCoverImage,
    getCoverId,
    addSpeciesImage,
    batchAddSpeciesImages,
    setCoverImage,
    deleteSpeciesImage,
    clearCache,
    preloadSpeciesImages
  }
})