<template>
  <div class="department-view">
    <div class="page-header">
      <h1>🏥 科室管理</h1>
      <p>查看和管理医院各科室信息</p>
    </div>

    <div class="department-grid">
      <div
        v-for="group in departmentGroups"
        :key="group.name"
        class="department-group"
      >
        <h3>{{ group.name }}</h3>
        <div class="department-list">
          <div
            v-for="dept in group.departments"
            :key="dept"
            class="department-card"
            @click="selectDepartment(dept)"
          >
            <div class="dept-icon">🏥</div>
            <div class="dept-info">
              <div class="dept-name">{{ getDepartmentLabel(dept) }}</div>
              <div class="dept-code">{{ dept }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 科室详情模态框 -->
    <div v-if="selectedDepartment" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ getDepartmentLabel(selectedDepartment) }}</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="dept-details">
            <div class="detail-item">
              <span class="label">科室代码:</span>
              <span class="value">{{ selectedDepartment }}</span>
            </div>
            <div class="detail-item">
              <span class="label">科室类型:</span>
              <span class="value">{{ getDepartmentType(selectedDepartment) }}</span>
            </div>
            <div class="detail-item">
              <span class="label">工单数量:</span>
              <span class="value">{{ getDepartmentTicketCount(selectedDepartment) }}</span>
            </div>
          </div>

          <div class="quick-actions">
            <h4>快速操作</h4>
            <div class="action-buttons">
              <button
                class="btn-action"
                @click="createTicketForDepartment(selectedDepartment)"
              >
                📝 为此科室创建工单
              </button>
              <button class="btn-action" @click="viewDepartmentTickets(selectedDepartment)">
                📋 查看科室工单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { DepartmentGroups, DepartmentLabels } from '@/types/auth'
import type { Department } from '@/types/auth'

const router = useRouter()
const selectedDepartment = ref<Department | null>(null)

const departmentGroups = computed(() => DepartmentGroups)

// 获取科室标签
const getDepartmentLabel = (dept: string): string => {
  return DepartmentLabels[dept as Department] || dept
}

// 获取科室类型
const getDepartmentType = (dept: string): string => {
  const group = DepartmentGroups.find(g => g.departments.includes(dept as Department))
  return group ? group.name : '其他'
}

// 获取科室工单数量（模拟数据）
const getDepartmentTicketCount = (dept: string): number => {
  const counts: Record<string, number> = {
    outpatient: 45,
    inpatient: 38,
    emergency: 22,
    icu: 15,
    surgery: 28,
    internal: 42,
    pediatrics: 25,
    obstetrics: 20,
    ophthalmology: 12,
    dentistry: 8,
    radiology: 35,
    laboratory: 40,
    pharmacy: 18,
    administration: 10,
    it_department: 5,
    other: 15
  }
  return counts[dept] || 0
}

// 选择科室
const selectDepartment = (dept: string) => {
  selectedDepartment.value = dept as Department
}

// 关闭模态框
const closeModal = () => {
  selectedDepartment.value = null
}

// 为此科室创建工单
const createTicketForDepartment = (dept: string) => {
  closeModal()
  router.push({
    path: '/tickets/create',
    query: { department: dept }
  })
}

// 查看科室工单
const viewDepartmentTickets = (dept: Department) => {
  closeModal()
  router.push({
    path: '/tickets',
    query: { department: dept }
  })
}
</script>

<style scoped>
.department-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-header p {
  color: #6b7280;
  margin: 0;
  font-size: 16px;
}

.department-grid {
  display: grid;
  gap: 32px;
}

.department-group {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.department-group h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
}

.department-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.department-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.department-card:hover {
  background: #f0f9ff;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.dept-icon {
  font-size: 24px;
}

.dept-info {
  flex: 1;
}

.dept-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.dept-code {
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.dept-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item .label {
  font-weight: 500;
  color: #6b7280;
}

.detail-item .value {
  font-weight: 600;
  color: #1f2937;
  font-family: monospace;
}

.quick-actions h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-action {
  padding: 12px 16px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.btn-action:hover {
  background: #667eea;
  color: white;
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .department-list {
    grid-template-columns: 1fr;
  }
  
  .department-group {
    padding: 16px;
  }
  
  .modal-content {
    max-width: 90%;
  }
}
</style>
