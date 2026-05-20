<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  closable: true,
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(true)
let timeout: ReturnType<typeof setTimeout>

const handleClose = () => {
  visible.value = false
  emit('close')
}

const typeColors: Record<string, string> = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
}

const typeIcons: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
}

onMounted(() => {
  if (props.duration > 0) {
    timeout = setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout)
  }
})
</script>

<template>
  <transition name="slide-fade">
    <div v-if="visible" class="notification" :class="`type-${type}`">
      <div class="notification-content">
        <span class="icon">{{ typeIcons[type] }}</span>
        <span class="message">{{ message }}</span>
      </div>
      <button v-if="closable" class="close-btn" @click="handleClose">×</button>
    </div>
  </transition>
</template>

<style scoped>
.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 0.5rem;
  border-left: 4px solid;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  max-width: 500px;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.icon {
  font-size: 1.25rem;
}

.message {
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Type variants */
.type-success {
  border-left-color: #10b981;
  background: #d1fae5;
}

.type-success .message {
  color: #065f46;
}

.type-error {
  border-left-color: #ef4444;
  background: #fee2e2;
}

.type-error .message {
  color: #991b1b;
}

.type-warning {
  border-left-color: #f59e0b;
  background: #fef3c7;
}

.type-warning .message {
  color: #92400e;
}

.type-info {
  border-left-color: #3b82f6;
  background: #dbeafe;
}

.type-info .message {
  color: #1e40af;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

@media (max-width: 640px) {
  .notification {
    min-width: auto;
    max-width: 100%;
  }
}
</style>
