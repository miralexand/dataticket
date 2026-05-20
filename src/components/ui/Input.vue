<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  disabled: false,
  clearable: false,
  type: 'text'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  clear: []
}>()

const value = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClear = () => {
  value.value = ''
  emit('clear')
}
</script>

<template>
  <div class="input-wrapper" :class="{ 'has-clear': clearable }">
    <input
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="input"
    />
    <button
      v-if="clearable && value"
      type="button"
      class="clear-btn"
      @click="handleClear"
      :disabled="disabled"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
/* Apple风格输入框 */
.input-wrapper {
  position: relative;
  width: 100%;
}

.input-wrapper.has-clear .input {
  padding-right: 44px; /* 为清除按钮留出空间 */
}

.input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--input-border);
  border-radius: var(--radius-md);
  font-family: var(--font-system);
  font-size: 17px;
  line-height: 1.47059;
  transition: all var(--transition-normal);
  background: var(--input-bg);
  color: var(--color-text);
  appearance: none;
  -webkit-appearance: none;
}

.input::placeholder {
  color: var(--color-text-muted);
  font-weight: 400;
  opacity: 0.75;
}

.input:focus {
  outline: none;
  border-color: var(--input-focus-border);
  box-shadow: var(--input-focus-shadow);
  background: var(--input-bg);
}

.input:hover:not(:focus):not(:disabled) {
  border-color: var(--color-border-hover);
}

.input:disabled {
  background: var(--color-background-mute);
  color: var(--color-text-muted);
  cursor: not-allowed;
  opacity: 0.6;
  border-color: var(--color-border);
}

/* Apple风格清除按钮 */
.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  font-size: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-normal);
  z-index: 2;
}

.clear-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text);
}

.clear-btn:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

/* 使用SVG图标作为清除按钮 */
.clear-btn::before {
  content: '';
  display: block;
  width: 14px;
  height: 14px;
  background: currentColor;
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E");
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
}

/* 深色模式调整 */
@media (prefers-color-scheme: dark) {
  .clear-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

/* 输入错误状态 */
.input-error {
  border-color: var(--color-danger) !important;
}

.input-error:focus {
  border-color: var(--color-danger) !important;
  box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1) !important;
}

/* 输入成功状态 */
.input-success {
  border-color: var(--color-success) !important;
}

.input-success:focus {
  border-color: var(--color-success) !important;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.1) !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .input {
    padding: 12px 14px;
    font-size: 16px;
  }
  
  .input-wrapper.has-clear .input {
    padding-right: 40px;
  }
}
</style>
