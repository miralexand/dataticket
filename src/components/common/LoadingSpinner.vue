<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  color: '#667eea',
})
</script>

<template>
  <div class="spinner-wrapper" :class="`size-${size}`">
    <div class="spinner" :style="{ borderColor: color }"></div>
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.size-sm .spinner {
  width: 1.25rem;
  height: 1.25rem;
  border-width: 2px;
}

.size-md .spinner {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

.size-lg .spinner {
  width: 3rem;
  height: 3rem;
  border-width: 4px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
