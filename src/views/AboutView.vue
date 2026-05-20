<template>
  <div class="about-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <!-- 主内容 -->
    <div class="about-content">
      <!-- 标题区域 -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-icon">🏥</div>
        </div>
        <h1 class="main-title">
          <span class="title-text">工单数据可视化看板</span>
          <span class="title-sub">Hospital Ticket Dashboard System</span>
        </h1>
        <div class="version-badge">
          <span class="badge-icon">🚀</span>
          v2.0.0
        </div>
        <div class="mode-badge" :class="{ 'dashboard-mode': isDashboardMode }">
          <span class="mode-icon">{{ isDashboardMode ? '📊' : '🔐' }}</span>
          {{ isDashboardMode ? '看板模式' : '标准模式' }}
        </div>
      </div>

      <!-- 功能特性 -->
      <div class="features-section">
        <div class="section-title">
          <span class="title-icon">✨</span>
          <h2>核心功能</h2>
        </div>
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <h3>数据可视化看板</h3>
            <p>多维度图表展示，支持柱状图、折线图、饼图、环形图等多种可视化方式</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📅</div>
            <h3>灵活时间筛选</h3>
            <p>支持本周/本月/本季度/按月份/全部等多种时间范围查看</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <h3>实时数据刷新</h3>
            <p>自动每分钟刷新数据，支持手动点击刷新</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <h3>工单管理</h3>
            <p>创建、编辑、删除工单，支持多种状态和优先级管理</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔍</div>
            <h3>智能筛选</h3>
            <p>多维度筛选条件，快速定位目标工单</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h3>响应式设计</h3>
            <p>完美适配桌面端和移动端设备</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔐</div>
            <h3>看板/标准双模式</h3>
            <p>支持免登录看板模式，也支持用户登录的标准管理模式</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3>高性能</h3>
            <p>基于Vue 3 + TypeScript + Chart.js构建，流畅体验</p>
          </div>
        </div>
      </div>

      <!-- 技术栈 -->
      <div class="tech-section">
        <div class="section-title">
          <span class="title-icon">🚀</span>
          <h2>技术栈</h2>
        </div>
        <div class="tech-stack">
          <span class="tech-tag">Vue 3</span>
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Pinia</span>
          <span class="tech-tag">Vue Router</span>
          <span class="tech-tag">Vite</span>
          <span class="tech-tag">Chart.js</span>
          <span class="tech-tag">vue-chartjs</span>
        </div>
      </div>

      <!-- 项目统计 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-icon">📁</div>
          <div class="stat-number">40+</div>
          <div class="stat-label">源文件</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">📝</div>
          <div class="stat-number">1000+</div>
          <div class="stat-label">代码行数</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">⚡</div>
          <div class="stat-number">8</div>
          <div class="stat-label">核心功能</div>
        </div>
        <div class="stat-item">
          <div class="stat-icon">📱</div>
          <div class="stat-number">100%</div>
          <div class="stat-label">响应式</div>
        </div>
      </div>

      <!-- 开发者信息 -->
      <div class="developer-section">
        <div class="section-title">
          <span class="title-icon">👨‍💻</span>
          <h2>开发者</h2>
        </div>
        <div class="developer-card">
          <div class="developer-info">
            <p class="developer-text">
              <span class="dev-label">开发者：</span>
              <span class="developer-name">YongZhuo、Matrix张</span>
            </p>
            <p class="developer-text">
              <span class="dev-label">邮箱：</span>
              <a href="mailto:dalingaixidelu@163.com" class="developer-link">dalingaixidelu@163.com</a>
            </p>
            <p class="developer-text">
              <span class="dev-label">GitHub：</span>
              <a href="https://github.com/miralexand" target="_blank" class="developer-link">miralexand</a>
            </p>
          </div>
        </div>
      </div>

      <!-- 致谢 -->
      <div class="thanks-section">
        <div class="thanks-card">
          <div class="thanks-icon">🌟</div>
          <h3>致谢</h3>
          <p>感谢所有使用本系统的医护人员，你们的反馈是我们不断改进的动力。</p>
          <p class="thanks-note">特别感谢 Matrix张 的技术支持！</p>
        </div>
      </div>

      <!-- 底部 -->
      <div class="footer-section">
        <div class="footer-content">
          <div class="footer-logo">🏥</div>
          <p class="footer-title">医院工单数据可视化看板</p>
          <p class="footer-text">基于 Vue 3 + TypeScript + Chart.js 构建</p>
          <p class="footer-copyright">© 2026 All Rights Reserved</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dashboardConfig } from '@/support/config'

const isDashboardMode = computed(() => dashboardConfig.enabled)
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #6B8DD6 100%);
  padding: 30px 20px;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  animation: float 8s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: white;
  top: 10%;
  left: -5%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  background: #ffd700;
  top: 60%;
  right: -3%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  background: white;
  bottom: 10%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  background: #ffd700;
  top: 30%;
  right: 25%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(10deg);
  }
}

/* 主内容 */
.about-content {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

/* 标题区域 */
.header-section {
  text-align: center;
  margin-bottom: 30px;
  animation: fadeInDown 0.8s ease-out;
}

.logo-container {
  width: 90px;
  height: 90px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
}

.logo-icon {
  font-size: 42px;
  animation: gentleBounce 2s ease-in-out infinite;
}

@keyframes gentleBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.main-title {
  color: white;
  margin: 0;
}

.title-text {
  display: block;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.title-sub {
  display: block;
  font-size: 0.95rem;
  font-weight: 400;
  opacity: 0.85;
  margin-top: 8px;
  letter-spacing: 2px;
}

.version-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  animation: fadeIn 1s ease-out 0.3s both;
}

.badge-icon {
  font-size: 1rem;
}

.mode-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  margin-left: 10px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
  animation: fadeIn 1s ease-out 0.4s both;
}

.mode-badge.dashboard-mode {
  background: rgba(16, 185, 129, 0.3);
  color: #a7f3d0;
}

/* 项目简介 */
.intro-section {
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

.intro-card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.intro-icon {
  font-size: 1.5rem;
}

.intro-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.2rem;
}

.intro-text {
  margin: 0 0 15px 0;
  color: #4b5563;
  line-height: 1.8;
  font-size: 1rem;
}

.intro-text strong {
  color: #667eea;
}

.intro-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.intro-tag {
  padding: 5px 12px;
  background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
  color: #667eea;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* 功能特性 */
.features-section {
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.section-title h2 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.title-icon {
  font-size: 1.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 18px;
}

.feature-item {
  background: white;
  border-radius: 14px;
  padding: 22px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-top: 4px solid transparent;
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border-top-color: #667eea;
}

.feature-icon {
  font-size: 2.2rem;
  margin-bottom: 12px;
}

.feature-item h3 {
  margin: 0 0 10px 0;
  color: #1f2937;
  font-size: 1.1rem;
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* 技术栈 */
.tech-section {
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.6s both;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tech-tag {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 24px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.tech-tag:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* 项目统计 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.7s both;
}

.stat-item {
  background: white;
  border-radius: 14px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  color: #6b7280;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 开发者信息 */
.developer-section {
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.8s both;
}

.developer-card {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.developer-text {
  margin: 12px 0;
  color: #4b5563;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dev-label {
  color: #6b7280;
}

.developer-name {
  color: #1f2937;
  font-weight: 600;
}

.developer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.developer-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* 致谢 */
.thanks-section {
  margin-bottom: 30px;
  animation: fadeIn 0.8s ease-out 0.9s both;
}

.thanks-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.15) 100%);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 16px;
  padding: 28px;
  text-align: center;
}

.thanks-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.thanks-card h3 {
  margin: 0 0 15px 0;
  color: #1f2937;
  font-size: 1.3rem;
}

.thanks-card p {
  margin: 10px 0;
  color: #4b5563;
  line-height: 1.7;
  font-size: 0.95rem;
}

.thanks-note {
  font-weight: 600;
  color: #d97706 !important;
  font-style: italic;
}

/* 底部 */
.footer-section {
  animation: fadeIn 1s ease-out 1s both;
}

.footer-content {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-logo {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.footer-title {
  margin: 0 0 8px 0;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.footer-text {
  margin: 0 0 15px 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.footer-copyright {
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about-container {
    padding: 20px 15px;
  }

  .title-text {
    font-size: 1.7rem;
  }

  .title-sub {
    font-size: 0.8rem;
  }

  .logo-container {
    width: 70px;
    height: 70px;
  }

  .logo-icon {
    font-size: 32px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .intro-card,
  .feature-item,
  .stat-item,
  .developer-card,
  .thanks-card,
  .footer-content {
    padding: 20px;
  }

  .section-title h2 {
    font-size: 1.3rem;
  }

  .mode-badge {
    margin-left: 0;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .title-text {
    font-size: 1.4rem;
  }

  .title-sub {
    font-size: 0.75rem;
    letter-spacing: 1px;
  }

  .version-badge {
    font-size: 0.8rem;
    padding: 6px 14px;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .tech-stack {
    justify-content: center;
  }

  .developer-text {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 暗黑模式支持 */
:global(.dark-mode) .about-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

:global(.dark-mode) .intro-card {
  background: #16213e;
  border-left: 4px solid #667eea;
}

:global(.dark-mode) .intro-header h3 {
  color: #e8e8e8;
}

:global(.dark-mode) .intro-text {
  color: #a0a0a0;
}

:global(.dark-mode) .intro-text strong {
  color: #fbbf24;
}

:global(.dark-mode) .intro-tag {
  background: linear-gradient(135deg, #667eea30 0%, #764ba230 100%);
  color: #a5b4fc;
}

:global(.dark-mode) .section-title h2 {
  color: #e8e8e8;
}

:global(.dark-mode) .feature-item {
  background: #16213e;
  border-top-color: transparent;
}

:global(.dark-mode) .feature-item:hover {
  border-top-color: #667eea;
}

:global(.dark-mode) .feature-item h3 {
  color: #e8e8e8;
}

:global(.dark-mode) .feature-item p {
  color: #a0a0a0;
}

:global(.dark-mode) .tech-tag {
  background: rgba(255, 255, 255, 0.1);
  color: #a5b4fc;
  border-color: rgba(255, 255, 255, 0.2);
}

:global(.dark-mode) .tech-tag:hover {
  background: rgba(255, 255, 255, 0.15);
}

:global(.dark-mode) .stat-item {
  background: #16213e;
}

:global(.dark-mode) .stat-number {
  color: #fbbf24;
}

:global(.dark-mode) .stat-label {
  color: #a0a0a0;
}

:global(.dark-mode) .developer-card {
  background: #16213e;
}

:global(.dark-mode) .dev-label {
  color: #a0a0a0;
}

:global(.dark-mode) .developer-name {
  color: #e8e8e8;
}

:global(.dark-mode) .thanks-card {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%);
  border-color: rgba(251, 191, 36, 0.3);
}

:global(.dark-mode) .thanks-card h3 {
  color: #e8e8e8;
}

:global(.dark-mode) .thanks-card p {
  color: #a0a0a0;
}

:global(.dark-mode) .thanks-note {
  color: #fbbf24 !important;
}

:global(.dark-mode) .footer-content {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-mode) .footer-title {
  color: #e8e8e8;
}

:global(.dark-mode) .footer-text {
  color: #a0a0a0;
}

:global(.dark-mode) .footer-copyright {
  color: #6b7280;
}

@media (max-width: 768px) {
  :global(.dark-mode) .features-grid {
    grid-template-columns: 1fr;
  }

  :global(.dark-mode) .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  :global(.dark-mode) .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
