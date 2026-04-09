/**
 * PetWorld 统一存储层
 * 
 * App 环境下使用 Capacitor Preferences（持久化，不会被系统清理）
 * Web 环境下降级为 localStorage（兼容浏览器调试）
 */
import { Preferences } from '@capacitor/preferences'

const isNative = typeof window !== 'undefined' && !!window.Capacitor

/**
 * 获取存储值
 * @param {string} key
 * @param {*} defaultValue - 不存在时返回的默认值
 * @returns {Promise<*>}
 */
export async function getStorage(key, defaultValue = null) {
  if (isNative) {
    const { value } = await Preferences.get({ key })
    if (value === null) return defaultValue
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }
  // Web 降级
  const raw = localStorage.getItem(key)
  if (raw === null) return defaultValue
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * 设置存储值
 * @param {string} key
 * @param {*} value
 */
export async function setStorage(key, value) {
  const data = typeof value === 'string' ? value : JSON.stringify(value)
  if (isNative) {
    await Preferences.set({ key, value: data })
  } else {
    localStorage.setItem(key, data)
  }
}

/**
 * 删除存储值
 * @param {string} key
 */
export async function removeStorage(key) {
  if (isNative) {
    await Preferences.remove({ key })
  } else {
    localStorage.removeItem(key)
  }
}

/**
 * 清空所有存储（慎用）
 */
export async function clearStorage() {
  if (isNative) {
    await Preferences.clear()
  } else {
    localStorage.clear()
  }
}

/**
 * 同步获取（仅在 Web 可用，用于初始化等场景）
 */
export function getStorageSync(key, defaultValue = null) {
  if (isNative) {
    console.warn('[Storage] getStorageSync is sync only in Web. Use getStorage() for native.')
    return defaultValue
  }
  const raw = localStorage.getItem(key)
  if (raw === null) return defaultValue
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

/**
 * 同步设置（仅在 Web 可用）
 */
export function setStorageSync(key, value) {
  if (isNative) {
    console.warn('[Storage] setStorageSync is sync only in Web. Use setStorage() for native.')
    return
  }
  const data = typeof value === 'string' ? value : JSON.stringify(value)
  localStorage.setItem(key, data)
}
