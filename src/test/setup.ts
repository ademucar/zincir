import { afterEach } from 'vitest'

// Yalnızca tarayıcı ortamı (jsdom) kullanan test dosyaları için
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react')

  // jsdom <dialog> penceresini desteklemez; tarayıcıdaki davranışın sade bir karşılığı
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return
      this.removeAttribute('open')
      this.dispatchEvent(new Event('close'))
    }
  }

  // jsdom'da ResizeObserver yok; takvim bileşeni için geniş bir ekran varsayılır
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class {
      private callback: ResizeObserverCallback
      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }
      observe() {
        this.callback([{ contentRect: { width: 1000 } } as ResizeObserverEntry], this)
      }
      unobserve() {}
      disconnect() {}
    }
  }

  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.className = ''
  })
}
