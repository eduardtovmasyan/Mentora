<template>
  <div ref="bodyRef" class="lesson-body">
    <template v-for="(seg, i) in segments" :key="i">

      <h2 v-if="seg.type === 'h2'" v-html="t(seg.key)" />
      <h3 v-else-if="seg.type === 'h3'" v-html="t(seg.key)" />
      <p v-else-if="seg.type === 'p'" v-html="t(seg.key)" />

      <div v-else-if="seg.type === 'code'" class="code-block">
        <div class="code-header">
          <span class="code-lang">{{ seg.label }}</span>
          <button class="code-copy" @click="copyCode($event)">Copy</button>
        </div>
        <pre><code :class="`language-${seg.lang}`" v-html="seg.code" /></pre>
      </div>

      <table v-else-if="seg.type === 'table'" class="ctable">
        <thead>
          <tr>
            <th v-for="h in tTable(seg.key).headers" :key="h" v-html="h" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in tTable(seg.key).rows" :key="ri">
            <td
              v-for="(cell, ci) in row"
              :key="ci"
              :class="[typeof cell === 'string' ? undefined : cell.cls, seg.colClasses?.[ci] ?? undefined]"
              :colspan="typeof cell === 'string' ? undefined : cell.span"
              v-html="typeof cell === 'string' ? cell : cell.v"
            />
          </tr>
        </tbody>
      </table>

      <ul v-else-if="seg.type === 'ul'">
        <li v-for="(item, ii) in tList(seg.key)" :key="ii" v-html="item" />
      </ul>
      <ol v-else-if="seg.type === 'ol'">
        <li v-for="(item, ii) in tList(seg.key)" :key="ii" v-html="item" />
      </ol>

      <div v-else-if="seg.type === 'callout'" :class="`callout callout-${seg.style}`">
        <div class="callout-title" v-html="tCallout(seg.key).title" />
        <p v-html="tCallout(seg.key).html" />
      </div>

      <div v-else-if="seg.type === 'keypoints'" class="keypoints">
        <div class="keypoints-title" v-html="tKeypoints(seg.key).title" />
        <ul>
          <li v-for="(item, ii) in tKeypoints(seg.key).items" :key="ii" v-html="item" />
        </ul>
      </div>

      <template v-else-if="seg.type === 'qa'">
        <div v-for="(pair, pi) in tQA(seg.key)" :key="pi" class="qa-block">
          <div class="qa-q" @click="toggleQA($event.currentTarget as HTMLElement)">
            <span class="qa-q-text" v-html="pair.q" />
            <span class="qa-arrow">▼</span>
          </div>
          <div class="qa-a"><p v-html="pair.a" /></div>
        </div>
      </template>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import hljs from 'highlight.js'
import type { IBodySegment, TableCell } from '@/modules/course/interfaces/IBodySegment.ts'
import type { IBodyLocale } from '@/modules/course/interfaces/IBodyLocale.ts'

const props = defineProps<{
  segments: IBodySegment[]
  bodyTexts: IBodyLocale        // English source text
  localeBodyTexts?: IBodyLocale // translated text (may be partial)
}>()

const bodyRef = ref<HTMLElement | null>(null)

/** Look up a text key: locale first, fallback to English */
function t(key: string): string {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  return typeof val === 'string' ? val : key
}

function tTable(key: string): { headers: string[]; rows: TableCell[][] } {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  if (val && typeof val === 'object' && 'headers' in val) {
    return val as { headers: string[]; rows: TableCell[][] }
  }
  return { headers: [], rows: [] }
}

function tList(key: string): string[] {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  return Array.isArray(val) ? val : []
}

function tCallout(key: string): { title: string; html: string } {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  if (val && typeof val === 'object' && 'title' in val && 'html' in val) {
    return val as { title: string; html: string }
  }
  return { title: '', html: '' }
}

function tKeypoints(key: string): { title: string; items: string[] } {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  if (val && typeof val === 'object' && 'items' in val) {
    return val as { title: string; items: string[] }
  }
  return { title: '', items: [] }
}

function tQA(key: string): Array<{ q: string; a: string }> {
  const val = props.localeBodyTexts?.[key] ?? props.bodyTexts[key]
  if (val && typeof val === 'object' && 'pairs' in val) {
    return (val as { pairs: Array<{ q: string; a: string }> }).pairs
  }
  return []
}

function toggleQA(el: HTMLElement | null): void {
  if (!el) return
  el.classList.toggle('open')
  const answer = el.nextElementSibling as HTMLElement | null
  if (answer) answer.style.display = answer.style.display === 'block' ? 'none' : 'block'
}

function copyCode(e: Event): void {
  const btn = e.currentTarget as HTMLElement
  const code = btn.closest('.code-block')?.querySelector('code')?.textContent ?? ''
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!'
    setTimeout(() => { btn.textContent = 'Copy' }, 2000)
  })
}

hljs.configure({ ignoreUnescapedHTML: true })
function highlight(): void {
  nextTick(() => {
    bodyRef.value?.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightElement(el as HTMLElement)
    })
  })
}

onMounted(highlight)
watch(() => props.segments, highlight)
</script>
