---
layout: home

hero:
  name: 工单管理系统
  text: 医院信息科
  tagline: 一个现代化的工单管理系统，基于 Vue 3 + TypeScript + Vite 构建，适用于医院、企业、IT 服务管理等场景。
  image:
    src: /hero-illustration.svg
    alt: 工单管理系统
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: /guide/dashboard
    - theme: alt
      text: GitHub
      link: https://github.com/miralexand/ticket-system

features:
  - icon: 📊
    title: 数据可视化看板
    details: 多维度图表展示，支持柱状图、折线图、饼图、环形图等多种可视化方式，实时掌握工单动态。
  - icon: ⚡
    title: 高性能架构
    details: 基于 Vue 3 Composition API + Vite 构建，开发体验优秀，运行时性能卓越。
  - icon: 🔒
    title: 类型安全
    details: 完整的 TypeScript 支持，严格的类型检查，让代码更健壮、更易维护。
  - icon: 🔄
    title: 实时同步
    details: WebSocket 实时通知，新工单创建和状态更新即时推送，无需刷新页面。
  - icon: 📱
    title: 响应式设计
    details: 完美适配桌面端和移动端设备，随时随地管理工单。
  - icon: 🎨
    title: 现代化 UI
    details: 简洁优雅的设计语言，支持亮色/暗色模式切换，视觉体验一流。
---

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 添加入场动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.VPFeature').forEach(el => {
    observer.observe(el)
  })
})
</script>

<style scoped>
.VPFeatures .VPFeature {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.VPFeatures .VPFeature.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.VPFeatures .VPFeature:nth-child(1) { transition-delay: 0.1s; }
.VPFeatures .VPFeature:nth-child(2) { transition-delay: 0.2s; }
.VPFeatures .VPFeature:nth-child(3) { transition-delay: 0.3s; }
.VPFeatures .VPFeature:nth-child(4) { transition-delay: 0.4s; }
.VPFeatures .VPFeature:nth-child(5) { transition-delay: 0.5s; }
.VPFeatures .VPFeature:nth-child(6) { transition-delay: 0.6s; }
</style>

<div class="stats-section">

## 项目数据

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">40+</div>
    <div class="stat-label">源文件</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">1000+</div>
    <div class="stat-label">代码行数</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">8</div>
    <div class="stat-label">核心功能</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">100%</div>
    <div class="stat-label">响应式</div>
  </div>
</div>

</div>

<style>
.stats-section {
  max-width: 1152px;
  margin: 4rem auto 0;
  padding: 0 24px;
}

.stats-section h2 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 2rem;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.dark .stat-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #5f67ee 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.dark .stat-number {
  background: linear-gradient(135deg, #8b92f9 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  background-clip: text;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
