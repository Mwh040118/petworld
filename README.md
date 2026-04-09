# 🐾 PetWorld 宠物百科社区

> 一个面向宠物爱好者的全栈社区平台，涵盖百科浏览、社区动态、问答互动、用户系统等核心功能。

[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📸 项目预览

| 首页 | 百科浏览 | 社区动态 |
|:---:|:---:|:---:|
| ![首页](docs/screenshots/home.png) | ![百科](docs/screenshots/encyclopedia.png) | ![社区](docs/screenshots/community.png) |

| 宠物问答 | 个人主页 | 我的页面 |
|:---:|:---:|:---:|
| ![问答](docs/screenshots/qa.png) | ![主页](docs/screenshots/profile.png) | ![我的](docs/screenshots/me.png) |

> ⚠️ **截图占位提示**：请将实际截图放入 `docs/screenshots/` 目录，文件名为 `home.png`、`encyclopedia.png`、`community.png`、`qa.png`、`profile.png`、`me.png`

---

## ✨ 核心功能

### 🏠 首页与百科
- **付费霸榜专区** — 炫宠写真位展示（预留支付接入点）
- **12 大宠物分类** — 猫、狗、龟、蛇、蜘蛛、鸟、兔、仓鼠、蛙、蜥蜴、观赏鱼、鳄鱼
- **91 个品种详情** — 中英双语，含学名、种属分类（界门纲目科属种）、趣味科普

### 💬 社区动态
- 图文发帖（支持多图上传）
- 点赞互动
- 时间线展示
- 删除自己的帖子

### ❓ 宠物问答
- 发布求助问题（支持标签）
- 多人回答
- 发帖人采纳最佳答案
- 按标签筛选

### 👤 用户系统
- 用户名 + 密码注册/登录
- JWT Token 鉴权（30 天有效期）
- 个人主页展示
- 关注/被关注关系
- 宠物档案管理 + 成长日记

---

## 🛠️ 技术栈

### 前端
| 技术 | 用途 |
|------|------|
| Vue 3 | 渐进式 JavaScript 框架 |
| Vite 6 | 下一代前端构建工具 |
| Pinia | 状态管理 |
| Vue Router 4 | 路由管理 |
| Vue I18n 9 | 国际化（中英双语）|
| Capacitor 8 | 跨平台 App 打包（iOS/Android）|

### 后端
| 技术 | 用途 |
|------|------|
| Node.js 22 | JavaScript 运行时 |
| Express | Web 框架 |
| sql.js | SQLite 嵌入式数据库（纯 JS，零安装）|
| JWT | 用户鉴权 |
| Multer | 文件上传 |

### 开发工具
- **AI 辅助开发**：Cursor / Claude Code / GitHub Copilot
- **版本管理**：Git
- **包管理**：npm

---

## 🚀 快速启动

### 环境要求
- Node.js 22+
- npm 10+

### 1. 克隆项目
```bash
git clone https://github.com/你的用户名/petworld.git
cd petworld
```

### 2. 安装依赖
```bash
# 前端依赖
npm install

# 后端依赖
cd server
npm install
cd ..
```

### 3. 一键启动（Windows）
```bash
启动社区版.bat
```

或手动启动：
```bash
# 终端 1：启动后端
cd server
node server.js

# 终端 2：启动前端
npm run dev
```

### 4. 访问
- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:3000`

---

## 📁 项目结构

```
petworld/
├── src/                    # 前端源码
│   ├── views/              # 页面组件
│   │   ├── HomeView.vue    # 首页
│   │   ├── EncyclopediaView.vue  # 百科
│   │   ├── CommunityView.vue     # 社区动态
│   │   ├── QuestionsView.vue     # 问答列表
│   │   ├── QuestionDetailView.vue # 问题详情
│   │   ├── ProfileView.vue       # 个人主页
│   │   ├── MeView.vue            # 我的页面
│   │   └── AuthView.vue          # 登录/注册
│   ├── components/         # 公共组件
│   ├── stores/             # Pinia 状态管理
│   ├── utils/              # 工具函数
│   └── router/             # 路由配置
├── server/                 # 后端服务
│   ├── server.js           # 入口文件
│   ├── db.js               # 数据库封装
│   ├── routes/             # API 路由
│   │   ├── auth.js         # 认证
│   │   ├── user.js         # 用户
│   │   ├── post.js         # 动态
│   │   ├── question.js     # 问答
│   │   ├── spotlight.js    # 霸榜
│   │   ├── pet.js          # 宠物档案
│   │   └── upload.js       # 文件上传
│   └── uploads/            # 上传文件存储
├── dataset/                # 宠物数据（91品种 × 12分类）
├── docs/                   # 文档与截图
└── dist/                   # 构建输出
```

---

## 📊 数据规模

| 指标 | 数量 |
|------|------|
| 宠物分类 | 12 个 |
| 品种数量 | 91 个 |
| 中国本土品种 | 11 个 |
| 数据字段 | 名称、学名、种属分类、趣味科普、关系图谱等 |
| 语言支持 | 中英双语 |

---

## 📱 App 打包

本项目已配置 Capacitor，可打包为 iOS / Android App：

```bash
# 构建前端
npm run build

# 同步到 Capacitor
npx cap sync

# 打开 Xcode（需要 Mac）
npx cap open ios

# 或打开 Android Studio
npx cap open android
```

> **注意**：iOS 打包需要 Mac + Xcode 14+ + Apple Developer 账号

---

## 📝 API 文档

### 认证相关
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 社区动态
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/posts` | GET | 获取动态列表 |
| `/api/posts` | POST | 发布动态 |
| `/api/posts/:id/like` | POST | 点赞 |
| `/api/posts/:id` | DELETE | 删除动态 |

### 问答系统
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/questions` | GET/POST | 问答列表/提问 |
| `/api/questions/:id` | GET | 问题详情 |
| `/api/questions/:id/answers` | POST | 回答问题 |
| `/api/answers/:id/accept` | POST | 采纳答案 |

更多 API 详见 `server/routes/` 目录源码。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

---

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源。

---

## 👤 作者

- **你的名字** - [@你的GitHub用户名](https://github.com/你的用户名)

---

## 🙏 致谢

- 宠物品种数据整理自公开资料
- 图标使用 [Phosphor Icons](https://phosphoricons.com/)
- UI 设计灵感来自 Pokémon Pokédex

---

<p align="center">🐾 Made with ❤️ for pet lovers</p>
