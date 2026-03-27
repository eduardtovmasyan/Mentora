export {}

declare global {
  interface Window {
    copyCode: (btn: HTMLElement) => void
    toggleQA: (el: HTMLElement) => void
  }
}
