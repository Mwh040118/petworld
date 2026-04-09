# PetWorld iOS App 构建指南

## 当前状态

✅ Capacitor 已集成，Vue 项目可直接打包为 iOS App
✅ 数据存储已从 localStorage 迁移到 Capacitor Preferences
✅ 路由使用 Hash 模式（兼容 App 原生加载）
✅ 构建成功（dist 目录可直接供 App 使用）

## 需要一台 Mac

iOS App 开发**必须**在 macOS 上进行（Xcode 只支持 Mac）。有两种方案：

### 方案 A：用 Mac 电脑（推荐）

1. 把项目拷到 Mac 上
2. 安装 Node.js 18+ 和 Xcode 14+
3. 安装 CocoaPods：`sudo gem install cocoapods`
4. 在项目目录运行：
```bash
npm install
npm run build
npx cap add ios
npx cap copy ios
npx cap open ios
```
5. Xcode 会打开，配置签名（Apple Developer 账号）
6. 点击运行按钮 → 在模拟器或真机上测试

### 方案 B：没有 Mac

1. **租 Mac 云主机**：MacStadium、AWS EC2 Mac、阿里云 Mac（约 1-3元/小时）
2. 或使用 **GitHub Actions** 免费构建（需要配置 macOS runner）

## App Store 上架清单

### 前置条件
- [ ] Apple Developer 账号（$99/年，个人或公司）
- [ ] Mac 电脑（或云 Mac）
- [ ] Xcode 14+

### 开发阶段
- [ ] App 图标（1024x1024，需要准备各种尺寸）
- [ ] 启动图（Launch Screen）
- [ ] 隐私政策 URL（需要托管一个网页）
- [ ] App 描述、截图、关键词

### 审核要点（儿童类 App 特别注意）
- [ ] 年龄分级设为 4+（Kids Category）
- [ ] 不能有广告
- [ ] 不能收集 13 岁以下儿童的个人信息
- [ ] 不能有第三方社交登录（微信/QQ等对儿童有风险）
- [ ] 不能有外部链接引导离开 App

### 构建命令速查
```bash
# 构建 Web 资源
npm run build

# 同步到 iOS 项目
npx cap sync ios

# 打开 Xcode
npx cap open ios

# 在 Xcode 中：
#   Product → Archive → Distribute App → App Store Connect
```

## 文件结构

```
E:\child_pets\
├── capacitor.config.json    # Capacitor 配置
├── package.json             # 依赖管理（已含 Capacitor 插件）
├── src/
│   ├── utils/
│   │   └── storage.js       # 统一存储层（App 用 Preferences，Web 用 localStorage）
│   ├── stores/
│   │   ├── user.js          # 用户设置（已改造）
│   │   ├── myPets.js        # 我的宠物（已改造）
│   │   └── breedPhotos.js   # 品种照片（已改造）
│   └── App.vue              # 入口（已加 StatusBar + SplashScreen）
└── ios/                     # [待生成] iOS 原生项目
```
