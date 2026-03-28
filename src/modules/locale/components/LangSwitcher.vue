<template>
  <div class="lang-switcher">
    <div class="ls-label">{{ t('lang.label') }}</div>
    <div class="ls-options">
      <button
        v-for="opt in options"
        :key="opt.code"
        class="ls-btn"
        :class="{ active: locale === opt.code }"
        @click="switchTo(opt.code)"
      >
        <span class="ls-flag">{{ opt.flag }}</span>
        <span class="ls-name">{{ opt.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { setLocale, type Locale } from '@/i18n/index.ts'

const { t, locale } = useI18n()

const options: { code: Locale; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'EN' },
  { code: 'ru', flag: '🇷🇺', name: 'RU' },
  { code: 'hy', flag: '🇦🇲', name: 'ՀՅ' },
]

function switchTo(code: Locale): void {
  setLocale(code)
}
</script>
