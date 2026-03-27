import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/router/Router.ts'

import 'highlight.js/styles/atom-one-dark.css'

// Global helpers called from lesson HTML (v-html does not process Vue directives)
window.copyCode = (btn: HTMLElement): void => {
  const block = btn.closest('.code-block')
  const code = block?.querySelector('code')
  if (!code) return
  navigator.clipboard.writeText(code.innerText).then(() => {
    btn.textContent = 'Copied!'
    setTimeout(() => (btn.textContent = 'Copy'), 2000)
  })
}

window.toggleQA = (el: HTMLElement): void => {
  const block = el.closest('.qa-block')
  if (!block) return
  block.querySelector('.qa-a')?.classList.toggle('open')
  el.querySelector('.qa-arrow')?.classList.toggle('open')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
