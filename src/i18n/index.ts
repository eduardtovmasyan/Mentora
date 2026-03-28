import { createI18n } from 'vue-i18n'
import { ref } from 'vue'
import en from './locales/en.ts'
import ru from './locales/ru.ts'
import hy from './locales/hy.ts'

export type Locale = 'en' | 'ru' | 'hy'

const STORAGE_KEY = 'mentora_locale'

function detectLocale(): Locale {
  const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
  if (saved && ['en', 'ru', 'hy'].includes(saved)) return saved
  const browser = navigator.language.slice(0, 2)
  if (browser === 'ru') return 'ru'
  if (browser === 'hy') return 'hy'
  return 'en'
}

export const currentLocale = ref<Locale>(detectLocale())

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, ru, hy },
})

export function setLocale(locale: Locale): void {
  ;(i18n.global.locale as { value: Locale }).value = locale
  currentLocale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.lang = locale
}

export function getLocale(): Locale {
  return (i18n.global.locale as { value: Locale }).value
}
