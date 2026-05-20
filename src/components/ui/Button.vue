<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'

interface Props extends /* @vue-ignore */ ButtonHTMLAttributes {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--loading': loading,
        'btn--disabled': disabled,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn__spinner"></span>
    <span class="btn__content">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
/* Apple风格按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-system);
  font-size: 17px;
  font-weight: 500;
  line-height: 1.23536;
  letter-spacing: -0.022em;
  cursor: pointer;
  transition: all var(--transition-spring);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

/* Apple风格的轻微按压效果 */
.btn:active:not(.btn--disabled):not(.btn--loading) {
  transform: scale(0.98);
}

/* 主按钮 - Apple蓝色 */
.btn--primary {
  background: var(--button-primary-bg);
  color: var(--button-text-color);
  font-weight: 600;
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--button-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 次按钮 - Apple灰色 */
.btn--secondary {
  background: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: 1px solid var(--color-border);
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
  background: var(--button-secondary-hover);
  border-color: var(--color-border-hover);
  transform: translateY(-1px);
}

/* 危险按钮 - Apple红色 */
.btn--danger {
  background: var(--color-danger);
  color: white;
}

.btn--danger:hover:not(.btn--disabled):not(.btn--loading) {
  background: #ff1c15;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

/* 幽灵按钮 - 透明边框 */
.btn--ghost {
  background: transparent;
  color: var(--color-blue);
  border: 1px solid var(--color-blue);
}

.btn--ghost:hover:not(.btn--disabled):not(.btn--loading) {
  background: rgba(0, 122, 255, 0.05);
  border-color: var(--color-blue-hover);
  color: var(--color-blue-hover);
}

/* 尺寸系统 - Apple触摸友好尺寸 */
.btn--sm {
  padding: 8px 16px;
  font-size: 15px;
  min-height: 36px;
  border-radius: var(--radius-md);
}

.btn--md {
  padding: 12px 24px;
  font-size: 17px;
  min-height: 44px; /* Apple推荐最小触摸目标 */
  border-radius: var(--radius-lg);
}

.btn--lg {
  padding: 16px 32px;
  font-size: 19px;
  min-height: 52px;
  border-radius: var(--radius-lg);
}

/* 状态 */
.btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.btn--disabled:hover {
  transform: none !important;
  box-shadow: none !important;
}

.btn--loading {
  cursor: wait;
  opacity: 0.8;
}

/* 加载指示器 - Apple风格 */
.btn__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 焦点样式 - Apple风格 */
.btn:focus-visible {
  outline: 2px solid var(--input-focus-border);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

/* Ripple效果 - 可选添加 */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.btn:not(.btn--disabled):active::after {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  100% {
    transform: scale(20, 20);
    opacity: 0;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .btn--md {
    padding: 10px 20px;
    min-height: 44px;
  }
  
  .btn--lg {
    padding: 14px 28px;
    min-height: 48px;
  }
}
</style>
