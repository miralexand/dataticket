<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'
import Notification from './Notification.vue'

const { notifications, remove } = useNotification()
</script>

<template>
  <div class="notification-container">
    <Notification
      v-for="notification in notifications"
      :key="notification.id"
      :type="notification.type"
      :message="notification.message"
      :duration="notification.duration"
      @close="remove(notification.id)"
    />
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 500px;
}

@media (max-width: 640px) {
  .notification-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}
</style>
