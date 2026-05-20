import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '工单管理系统',
  description: '现代化的医院工单管理系统，基于 Vue 3 + TypeScript + Vite 构建',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '使用指南', link: '/guide/getting-started' },
      { text: 'API 文档', link: '/api/endpoints' },
      { text: '开发文档', link: '/develop/architecture' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始使用',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '环境配置', link: '/guide/configuration' },
            { text: '项目结构', link: '/guide/structure' },
          ],
        },
        {
          text: '功能说明',
          items: [
            { text: '工单管理', link: '/guide/ticket-management' },
            { text: '数据看板', link: '/guide/dashboard' },
            { text: '实时通知', link: '/guide/websocket' },
            { text: '用户认证', link: '/guide/authentication' },
          ],
        },
        {
          text: '部署',
          items: [
            { text: '构建与部署', link: '/guide/deployment' },
            { text: 'Docker 部署', link: '/guide/docker' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '接口概览', link: '/api/endpoints' },
            { text: '工单接口', link: '/api/ticket-api' },
            { text: 'WebSocket', link: '/api/websocket' },
            { text: '数据模型', link: '/api/models' },
          ],
        },
      ],
      '/develop/': [
        {
          text: '开发指南',
          items: [
            { text: '架构设计', link: '/develop/architecture' },
            { text: '技术栈', link: '/develop/tech-stack' },
            { text: '代码规范', link: '/develop/code-style' },
            { text: '测试指南', link: '/develop/testing' },
          ],
        },
        {
          text: '贡献',
          items: [
            { text: '贡献指南', link: '/develop/contributing' },
            { text: '更新日志', link: '/develop/changelog' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/miralexand/ticket-system' },
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2026 RjxZyyXxk',
    },

    editLink: {
      pattern: 'https://github.com/miralexand/ticket-system/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },

    docFooter: {
      prev: '上一页',
      next: '下一页',
    },

    outline: {
      label: '页面导航',
    },

    // lastUpdated: {
    //   text: '最后更新于',
    //   formatOptions: {
    //     dateStyle: 'short',
    //     timeStyle: 'medium',
    //   },
    // },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档',
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    carbonAds: undefined,
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  sitemap: {
    hostname: 'https://ticket-system.example.com',
  },

  cleanUrls: true,

  ignoreDeadLinks: true,
})
