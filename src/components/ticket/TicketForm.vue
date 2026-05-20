<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Ticket, CreateTicketInput, UpdateTicketInput, TicketPriority, TicketCategory, TicketStatus, WorkType } from '@/types/ticket'
import type { Department } from '@/types/auth'
import { TicketPriorityLabels, TicketCategoryLabels, TicketStatusLabels, WorkTypeLabels } from '@/types/ticket'
import { DepartmentLabels } from '@/types/auth'
import Button from '@/components/ui/Button.vue'

interface Props {
  ticket?: Ticket | null
  loading?: boolean
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  ticket: null,
  loading: false,
  mode: 'create',
})

const emit = defineEmits<{
  submit: [data: CreateTicketInput | UpdateTicketInput]
  cancel: []
}>()

const route = useRoute()

const form = ref({
  workTitle: props.ticket?.title || props.ticket?.workTitle || '',  // 工单主题（参考 MatrixOrigWeb）
  workType: props.ticket?.workType || ('simple' as WorkType),        // 工单类型（参考 MatrixOrigWeb）
  priority: props.ticket?.priority || ('低' as any),                 // 优先级（参考 MatrixOrigWeb，使用中文）
  department: props.ticket?.department || (route.query.department as Department) || '',
  description: props.ticket?.description || '',
  phone: props.ticket?.phone || '',
  location: props.ticket?.location || '',
  urgencyNote: props.ticket?.urgencyNote || '',
  workContent: props.ticket?.workContent || '',
  workResult: props.ticket?.workResult || '',
  tags: props.ticket?.tags?.join(', ') || '',
  category: props.ticket?.category || ('system_failure' as TicketCategory),
  status: props.ticket?.status || ('pending' as TicketStatus),
  assignee: props.ticket?.assigneeId || '',
})

// 工单类型选项（参考 MatrixOrigWeb）
const workTypeOptions: Array<{ value: WorkType; label: string }> = [
  { value: 'simple', label: '日常维护' },
  { value: 'technical', label: '技术支持' },
  { value: 'billing', label: '财务问题' },
  { value: 'feature', label: '功能请求' },
  { value: 'bug', label: '故障报告' },
  { value: 'other', label: '其他' },
]

// 优先级选项（参考 MatrixOrigWeb，使用中文）
const priorities: Array<{ value: string; label: string; color: string }> = [
  { value: '低', label: '低', color: '#67C23A' },
  { value: '中', label: '中', color: '#E6A23C' },
  { value: '高', label: '高', color: '#F56C6C' },
  { value: '紧急', label: '紧急', color: '#F56C6C' },
]

const categories: Array<{ value: TicketCategory; label: string }> = [
  { value: 'system_failure' as TicketCategory, label: TicketCategoryLabels['system_failure'] },
  { value: 'device_failure' as TicketCategory, label: TicketCategoryLabels['device_failure'] },
  { value: 'network_issue' as TicketCategory, label: TicketCategoryLabels['network_issue'] },
  { value: 'software_request' as TicketCategory, label: TicketCategoryLabels['software_request'] },
  { value: 'data_query' as TicketCategory, label: TicketCategoryLabels['data_query'] },
  { value: 'account_issue' as TicketCategory, label: TicketCategoryLabels['account_issue'] },
  { value: 'other' as TicketCategory, label: TicketCategoryLabels['other'] },
]

const statuses: Array<{ value: TicketStatus; label: string }> = [
  { value: 'pending' as TicketStatus, label: TicketStatusLabels['pending'] },
  { value: 'progress' as TicketStatus, label: TicketStatusLabels['progress'] },
  { value: 'resolved' as TicketStatus, label: TicketStatusLabels['resolved'] },
  { value: 'closed' as TicketStatus, label: TicketStatusLabels['closed'] },
]

// 工单类型选项（参考 MatrixOrigWeb）
const workTypes: Array<{ value: WorkType; label: string }> = [
  { value: 'simple', label: '日常维护' },
  { value: 'technical', label: '技术支持' },
  { value: 'billing', label: '财务问题' },
  { value: 'feature', label: '功能请求' },
  { value: 'bug', label: '故障报告' },
  { value: 'other', label: '其他' },
]

const departments: Array<{ value: Department; label: string; group: string }> = [
  { value: 'outpatient', label: DepartmentLabels['outpatient'], group: '临床科室' },
  { value: 'inpatient', label: DepartmentLabels['inpatient'], group: '临床科室' },
  { value: 'emergency', label: DepartmentLabels['emergency'], group: '临床科室' },
  { value: 'icu', label: DepartmentLabels['icu'], group: '临床科室' },
  { value: 'surgery', label: DepartmentLabels['surgery'], group: '临床科室' },
  { value: 'internal', label: DepartmentLabels['internal'], group: '临床科室' },
  { value: 'pediatrics', label: DepartmentLabels['pediatrics'], group: '临床科室' },
  { value: 'obstetrics', label: DepartmentLabels['obstetrics'], group: '临床科室' },
  { value: 'ophthalmology', label: DepartmentLabels['ophthalmology'], group: '临床科室' },
  { value: 'dentistry', label: DepartmentLabels['dentistry'], group: '临床科室' },
  { value: 'radiology', label: DepartmentLabels['radiology'], group: '医技科室' },
  { value: 'laboratory', label: DepartmentLabels['laboratory'], group: '医技科室' },
  { value: 'pharmacy', label: DepartmentLabels['pharmacy'], group: '医技科室' },
  { value: 'administration', label: DepartmentLabels['administration'], group: '行政科室' },
  { value: 'it_department', label: DepartmentLabels['it_department'], group: '行政科室' },
  { value: 'other', label: DepartmentLabels['other'], group: '其他' },
]

const errors = ref<Record<string, string>>({})

const isValid = computed(() => {
  return form.value.workTitle.trim() &&
         form.value.description.trim() &&
         form.value.workType &&
         form.value.department &&
         form.value.priority
})

const validate = () => {
  errors.value = {}

  if (!form.value.workTitle.trim()) {
    errors.value.workTitle = '请输入工单标题'
  } else if (form.value.workTitle.trim().length < 5) {
    errors.value.workTitle = '标题至少需要5个字符'
  }

  if (!form.value.description.trim()) {
    errors.value.description = '请输入工单描述'
  } else if (form.value.description.trim().length < 10) {
    errors.value.description = '描述至少需要10个字符'
  }

  if (!form.value.workType) {
    errors.value.workType = '请选择工单类型'
  }

  if (!form.value.department) {
    errors.value.department = '请选择申请科室'
  }

  if (!form.value.priority) {
    errors.value.priority = '请选择优先级'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (!validate()) return

  const tags = form.value.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const submitData = props.mode === 'create'
    ? {
        // 完全兼容 MatrixOrigWeb 的字段格式
        workTitle: form.value.workTitle.trim(),
        workType: form.value.workType,
        priority: form.value.priority,  // 使用中文优先级
        department: form.value.department as Department,
        description: form.value.description.trim(),
        phone: form.value.phone || undefined,
        location: form.value.location || undefined,
        urgencyNote: form.value.urgencyNote || undefined,
        workContent: form.value.workContent || form.value.description.trim(),
        workResult: form.value.workResult || undefined,
        tags,
      }
    : {
        title: form.value.workTitle.trim(),
        description: form.value.description.trim(),
        department: form.value.department as Department,
        priority: form.value.priority,
        category: form.value.category,
        status: form.value.status,
        assigneeId: form.value.assignee.trim() || undefined,
        phone: form.value.phone || undefined,
        location: form.value.location || undefined,
        urgencyNote: form.value.urgencyNote || undefined,
        tags,
        workType: form.value.workType,
        workContent: form.value.workContent || form.value.description.trim(),
        workResult: form.value.workResult || undefined,
      }

  emit('submit', submitData)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <form class="ticket-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="workTitle">工单标题 <span class="required">*</span></label>
      <input
        id="workTitle"
        v-model="form.workTitle"
        type="text"
        :class="{ 'input-error': errors.workTitle }"
        placeholder="请输入工单标题"
        :disabled="loading"
      />
      <span v-if="errors.workTitle" class="error-message">{{ errors.workTitle }}</span>
    </div>

    <div class="form-group">
      <label for="description">工单描述 <span class="required">*</span></label>
      <textarea
        id="description"
        v-model="form.description"
        :class="{ 'input-error': errors.description }"
        placeholder="请详细描述问题..."
        rows="4"
        :disabled="loading"
      />
      <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="workType">工单类型 <span class="required">*</span></label>
        <select id="workType" v-model="form.workType" :disabled="loading" required>
          <option value="">请选择工单类型</option>
          <option v-for="wt in workTypes" :key="wt.value" :value="wt.value">
            {{ wt.label }}
          </option>
        </select>
        <span v-if="errors.workType" class="error-message">{{ errors.workType }}</span>
      </div>

      <div class="form-group">
        <label for="priority">优先级 <span class="required">*</span></label>
        <select id="priority" v-model="form.priority" :disabled="loading" required>
          <option value="">请选择优先级</option>
          <option v-for="p in priorities" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
        <span v-if="errors.priority" class="error-message">{{ errors.priority }}</span>
      </div>

      <div class="form-group">
        <label for="department">申请科室 <span class="required">*</span></label>
        <select id="department" v-model="form.department" :disabled="loading" required>
          <option value="">请选择科室</option>
          <optgroup label="临床科室">
            <option value="outpatient">门诊部</option>
            <option value="inpatient">住院部</option>
            <option value="emergency">急诊科</option>
            <option value="icu">重症监护室</option>
            <option value="surgery">外科</option>
            <option value="internal">内科</option>
            <option value="pediatrics">儿科</option>
            <option value="obstetrics">妇产科</option>
            <option value="ophthalmology">眼科</option>
            <option value="dentistry">口腔科</option>
          </optgroup>
          <optgroup label="医技科室">
            <option value="radiology">放射科</option>
            <option value="laboratory">检验科</option>
            <option value="pharmacy">药剂科</option>
          </optgroup>
          <optgroup label="行政科室">
            <option value="administration">行政科室</option>
            <option value="it_department">信息科</option>
          </optgroup>
          <option value="other">其他</option>
        </select>
        <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="phone">联系电话</label>
        <input
          id="phone"
          v-model="form.phone"
          type="tel"
          placeholder="请输入联系电话"
          :disabled="loading"
        />
      </div>

      <div class="form-group">
        <label for="location">位置/房间号</label>
        <input
          id="location"
          v-model="form.location"
          type="text"
          placeholder="例如: 门诊楼3楼"
          :disabled="loading"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="tags">标签</label>
        <input
          id="tags"
          v-model="form.tags"
          type="text"
          placeholder="多个标签用逗号分隔，例如：紧急,登录,网站"
          :disabled="loading"
        />
        <span class="help-text">用逗号分隔多个标签</span>
      </div>

      <div class="form-group">
        <label for="urgencyNote">紧急说明</label>
        <input
          id="urgencyNote"
          v-model="form.urgencyNote"
          type="text"
          placeholder="紧急工单请填写原因"
          :disabled="loading"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="workContent">工单内容</label>
      <textarea
        id="workContent"
        v-model="form.workContent"
        placeholder="请详细描述问题或需求..."
        rows="4"
        :disabled="loading"
      />
    </div>

    <div v-if="mode === 'edit'" class="form-row">
      <div class="form-group">
        <label for="status">状态</label>
        <select id="status" v-model="form.status" :disabled="loading">
          <option v-for="s in statuses" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="assignee">负责人</label>
        <input
          id="assignee"
          v-model="form.assignee"
          type="text"
          placeholder="可选"
          :disabled="loading"
        />
      </div>
    </div>

    <div v-if="mode === 'edit'" class="form-group">
      <label for="workResult">处理结果</label>
      <textarea
        id="workResult"
        v-model="form.workResult"
        placeholder="请填写处理结果..."
        rows="3"
        :disabled="loading"
      />
    </div>

    <div class="form-actions">
      <Button
        type="button"
        variant="secondary"
        @click="handleCancel"
        :disabled="loading"
      >
        取消
      </Button>
      <Button
        type="submit"
        :loading="loading"
        :disabled="!isValid || loading"
        :variant="mode === 'create' ? 'primary' : 'primary'"
      >
        {{ mode === 'create' ? '提交工单' : '更新工单' }}
      </Button>
    </div>
  </form>
</template>

<style scoped>
.ticket-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 600px;
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9375rem;
}

.required {
  color: #ef4444;
}

input,
textarea,
select {
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled,
textarea:disabled,
select:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.7;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.input-error {
  border-color: #ef4444 !important;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.error-message {
  color: #ef4444;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #6b7280;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
