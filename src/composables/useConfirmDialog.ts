import { ref } from 'vue'

export function useConfirmDialog() {
  const isOpen = ref(false)
  const message = ref('')
  let resolver: ((confirmed: boolean) => void) | null = null

  function confirm(nextMessage: string) {
    message.value = nextMessage
    isOpen.value = true
    return new Promise<boolean>((resolve) => {
      resolver = resolve
    })
  }

  function resolve(confirmed: boolean) {
    isOpen.value = false
    if (!resolver) return
    resolver(confirmed)
    resolver = null
  }

  return {
    isOpen,
    message,
    confirm,
    resolve,
  }
}
