<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import Button from '@/components/ui/Button.vue'

const error = ref<Error | null>(null)
const hasError = ref(false)

onErrorCaptured((err) => {
  error.value = err
  hasError.value = true
  console.error('Error caught by boundary:', err)
  return false
})

const handleRetry = () => {
  error.value = null
  hasError.value = false
  window.location.reload()
}

const handleGoHome = () => {
  window.location.href = '/'
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2>发生错误</h2>
      <p class="error-message">{{ error?.message || '未知错误' }}</p>
      <div class="error-actions">
        <Button @click="handleRetry">重试</Button>
        <Button variant="secondary" @click="handleGoHome">返回首页</Button>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 2rem;
}

.error-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-content h2 {
  margin: 0 0 0.5rem 0;
  color: #dc2626;
  font-size: 1.5rem;
}

.error-message {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.5;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
