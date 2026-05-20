/**
 * 用户认证相关类型定义
 * 针对医院信息科业务场景
 */

// 用户角色
export type UserRole = 'admin' | 'doctor' | 'nurse' | 'technician' | 'admin_staff' | 'other'

// 用户角色映射（用于显示）
export const UserRoleLabels: Record<UserRole, string> = {
  admin: '系统管理员',
  doctor: '医生',
  nurse: '护士',
  technician: '医技人员',
  admin_staff: '行政人员',
  other: '其他'
}

// 科室类型
export type Department = 
  | 'outpatient'      // 门诊部
  | 'inpatient'       // 住院部
  | 'emergency'       // 急诊科
  | 'icu'             // 重症监护室
  | 'surgery'         // 外科
  | 'internal'        // 内科
  | 'pediatrics'      // 儿科
  | 'obstetrics'      // 妇产科
  | 'ophthalmology'   // 眼科
  | 'dentistry'       // 口腔科
  | 'radiology'       // 放射科
  | 'laboratory'      // 检验科
  | 'pharmacy'        // 药剂科
  | 'administration'  // 行政科室
  | 'it_department'   // 信息科
  | 'other'           // 其他

// 科室映射（用于显示）
export const DepartmentLabels: Record<Department, string> = {
  outpatient: '门诊部',
  inpatient: '住院部',
  emergency: '急诊科',
  icu: '重症监护室',
  surgery: '外科',
  internal: '内科',
  pediatrics: '儿科',
  obstetrics: '妇产科',
  ophthalmology: '眼科',
  dentistry: '口腔科',
  radiology: '放射科',
  laboratory: '检验科',
  pharmacy: '药剂科',
  administration: '行政科室',
  it_department: '信息科',
  other: '其他'
}

// 科室分组（用于前端展示）
export const DepartmentGroups = [
  {
    name: '临床科室',
    departments: ['outpatient', 'inpatient', 'emergency', 'icu', 'surgery', 'internal', 'pediatrics', 'obstetrics', 'ophthalmology', 'dentistry']
  },
  {
    name: '医技科室',
    departments: ['radiology', 'laboratory', 'pharmacy']
  },
  {
    name: '行政科室',
    departments: ['administration', 'it_department']
  }
]

// 用户信息
export interface UserInfo {
  id: string
  username: string
  name: string
  role: UserRole
  department: Department
  phone?: string
  email?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应
export interface LoginResponse {
  token: string
  user: UserInfo
  expiresIn: number
}

// 注册请求
export interface RegisterRequest {
  username: string
  password: string
  name: string
  role: UserRole
  department: Department
  phone?: string
  email?: string
}

// 认证状态
export interface AuthState {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  isInitialized: boolean
}
