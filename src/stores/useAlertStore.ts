import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alert', () => {
  const alertState = ref({
    title: '',
    description: '',
    type: 'success',
    show: false,
  })

  function clearAlert() {
    alertState.value.title = ''
    alertState.value.description = ''
    alertState.value.type = 'success'
    alertState.value.show = false
  }

  function showAlert(title: string, description: string, type: 'success' | 'error') {
    alertState.value.title = title
    alertState.value.description = description
    alertState.value.type = type
    alertState.value.show = true
  }
  return { alertState, showAlert, clearAlert }
})
