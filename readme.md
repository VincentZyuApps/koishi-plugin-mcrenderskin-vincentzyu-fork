# koishi-plugin-mcrenderskin-vincentzyu-fork

[![npm](https://img.shields.io/npm/v/koishi-plugin-mcrenderskin-vincentzyu-fork?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-mcrenderskin-vincentzyu-fork)
[![npm-downloads](https://img.shields.io/npm/dm/koishi-plugin-mcrenderskin-vincentzyu-fork?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-mcrenderskin-vincentzyu-fork)

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/VincentZyuApps/koishi-plugin-mcrenderskin-vincentzyu-fork)
[![Gitee](https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white)](https://gitee.com/vincent-zyu/koishi-plugin-mcrenderskin-vincentzyu-fork)

[![Koishi Forum](https://img.shields.io/badge/forum.koishi.xyz_topic_xxxxx-5546A3?style=for-the-badge&logo=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Ff%2Ff3%2FKoishi.js_Logo.png&logoColor=white)](https://forum.koishi.xyz/t/topic/xxxxx)
[![QQ群](https://img.shields.io/badge/QQ群-259248174-12B7F5?style=flat-square&logo=qq&logoColor=white)](https://qm.qq.com/q/4vjto4V7Di)

## 🙏 特别感谢

本插件的 3D 皮肤渲染能力基于 [bs-community/skinview3d](https://github.com/bs-community/skinview3d) 项目。感谢 skinview3d 提供优秀的 Minecraft 皮肤渲染能力；本插件使用其 TypeScript 源码生态与本地 bundle JS 资源进行 Koishi 侧封装。

[![skinview3d TypeScript Source](https://img.shields.io/badge/skinview3d-TypeScript%20Source-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://github.com/bs-community/skinview3d)
[![skinview3d Bundle JS](https://img.shields.io/badge/skinview3d-Bundle%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.npmjs.com/package/skinview3d)

<p><del>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入QQ群：<b>259248174</b>   🎉（这个群G了）</del></p> 
<p>💬 插件使用问题 / 🐛 Bug反馈 / 👨‍💻 插件开发交流，欢迎加入新QQ群：<b>1085190201</b> 🎉</p>
<p>💡 在群里直接艾特我，回复的更快哦~ ✨</p>

🎮 基于`skinView3D.js` 渲染Minecraft Java玩家的 皮肤和披风 3D图片 ✨

---

## ✨ 功能

- 🧍 渲染 Minecraft 玩家 3D 皮肤
- 🧥 支持披风渲染与兜底获取
- 🖼️ 支持自定义背景图、字体路径、bundle 路径
- 🌐 支持通过 `ctx.http` 下载 skin / cape 并转为 base64
- 🐞 支持调试日志，方便排查下载与 Puppeteer 渲染问题

---

## 📦 安装

```bash
npm install koishi-plugin-mcrenderskin-vincentzyu-fork
```

在 Koishi 控制台插件市场中搜索 `mcrenderskin-vincentzyu-fork` 也可以安装。

---

## 🧭 使用

1. 先启用 `puppeteer` 依赖插件
2. 在本插件里开启 `enableRender`
3. 使用指令 `MCR [玩家名称]`

---

## ⚙️ 配置说明

### 常规设置

- `enableRender`
  - 是否启用 `MCR` 指令
- `initName`
  - 默认玩家名称
- `renderSize`
  - 渲染分辨率，越高越清晰，但更耗时

### 下载设置

- `trySkinBase64`
  - 尝试先用 `ctx.http` 下载皮肤，再交给浏览器渲染
- `tryCapeBase64`
  - 尝试先用 `ctx.http` 下载披风，再交给浏览器渲染

### 背景图设置

- `wallPaper`
  - 支持 `Default`、URL、Base64、路径

### 运行控制

- `renderTimeOut`
  - Puppeteer 渲染超时阈值

### 资源路径

- `skinview3dBundlePath`
  - 本地 `assets/vendor/skinview3d.bundle.js`
- `fontPath`
  - Minecraft 字体文件
- `defaultWallPath`
  - 默认背景图文件

### 调试输出

- `debugLog`
  - 开启后输出更详细的资源读取、下载和渲染日志

---

## ⚠️ 常见问题

### 只显示背景，没有玩家

- 检查 `puppeteer` 是否正常启动
- 检查 `assets/vendor/skinview3d.bundle.js` 是否能读到
- 检查字体和背景图路径是否正确
- Docker 环境下可尝试将 `chromium` 替换为 `chromium-swiftshader`

### 皮肤或披风加载失败

- 可尝试开启 `trySkinBase64`
- 可尝试开启 `tryCapeBase64`
- 打开 `debugLog` 查看失败阶段

---

## 🪪 许可

MIT
