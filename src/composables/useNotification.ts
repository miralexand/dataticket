import { ref } from 'vue'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration: number
}

export function useNotification() {
  const notifications = ref<Notification[]>([])

  const show = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    }

    notifications.value.push(notification)

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  const remove = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, duration = 3000) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration = 5000) => {
    return show(message, 'error', duration)
  }

  const warning = (message: string, duration = 4000) => {
    return show(message, 'warning', duration)
  }

  const info = (message: string, duration = 3000) => {
    return show(message, 'info', duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications,
    show,
    remove,
    success,
    error,
    warning,
    info,
    clear,
  }
}
