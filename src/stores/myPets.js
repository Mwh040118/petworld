import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getStorage, setStorage } from '@/utils/storage'

export const useMyPetsStore = defineStore('myPets', () => {
  const pets = ref(JSON.parse(localStorage.getItem('petworld_mypets') || '[]'))
  const ready = ref(false)

  async function init() {
    if (ready.value) return
    const saved = await getStorage('petworld_mypets', [])
    if (saved.length > 0 && pets.value.length === 0) {
      pets.value = saved
    }
    ready.value = true
  }

  async function savePets() {
    await setStorage('petworld_mypets', pets.value)
  }

  async function addPet(pet) {
    pet.id = Date.now().toString()
    pet.createdAt = new Date().toISOString()
    pets.value.push(pet)
    await savePets()
    return pet.id
  }

  async function updatePet(id, data) {
    const idx = pets.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      pets.value[idx] = { ...pets.value[idx], ...data }
      await savePets()
    }
  }

  async function deletePet(id) {
    pets.value = pets.value.filter(p => p.id !== id)
    await savePets()
  }

  function getPet(id) {
    return pets.value.find(p => p.id === id)
  }

  async function addDiaryEntry(petId, entry) {
    const pet = pets.value.find(p => p.id === petId)
    if (pet) {
      if (!pet.diary) pet.diary = []
      entry.id = Date.now().toString()
      entry.createdAt = new Date().toISOString()
      pet.diary.unshift(entry)
      await savePets()
    }
  }

  async function deleteDiaryEntry(petId, entryId) {
    const pet = pets.value.find(p => p.id === petId)
    if (pet && pet.diary) {
      pet.diary = pet.diary.filter(d => d.id !== entryId)
      await savePets()
    }
  }

  // 相册：添加照片
  async function addPhoto(petId, photoData) {
    const pet = pets.value.find(p => p.id === petId)
    if (pet) {
      if (!pet.photos) pet.photos = []
      const photo = {
        id: Date.now().toString(),
        url: photoData.url,
        caption: photoData.caption || '',
        createdAt: new Date().toISOString()
      }
      pet.photos.push(photo)
      if (pet.photos.length === 1) {
        pet.coverPhotoId = photo.id
        pet.photo = photo.url
      }
      await savePets()
      return photo.id
    }
  }

  // 相册：删除照片
  async function deletePhoto(petId, photoId) {
    const pet = pets.value.find(p => p.id === petId)
    if (pet && pet.photos) {
      pet.photos = pet.photos.filter(p => p.id !== photoId)
      if (pet.coverPhotoId === photoId) {
        if (pet.photos.length > 0) {
          pet.coverPhotoId = pet.photos[0].id
          pet.photo = pet.photos[0].url
        } else {
          pet.coverPhotoId = null
          pet.photo = null
        }
      }
      await savePets()
    }
  }

  // 相册：设置封面
  async function setCover(petId, photoId) {
    const pet = pets.value.find(p => p.id === petId)
    if (pet && pet.photos) {
      const photo = pet.photos.find(p => p.id === photoId)
      if (photo) {
        pet.coverPhotoId = photoId
        pet.photo = photo.url
        await savePets()
      }
    }
  }

  const petCount = computed(() => pets.value.length)

  return { pets, ready, init, addPet, updatePet, deletePet, getPet, addDiaryEntry, deleteDiaryEntry, petCount, addPhoto, deletePhoto, setCover }
})
