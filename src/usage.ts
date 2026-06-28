export const usage = `
<h1>🎮 Koishi 插件：Minecraft 玩家皮肤渲染器</h1>
<p>📦 基于 <b>skinview3d</b> 的 3D 皮肤 / 披风渲染插件，输出 Minecraft 风格玩家展示图。</p>

<p>
  <a href="https://www.npmjs.com/package/koishi-plugin-mcrenderskin-vincentzyu-fork" target="_blank">
    <img src="https://img.shields.io/npm/v/koishi-plugin-mcrenderskin-vincentzyu-fork?style=flat-square" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/koishi-plugin-mcrenderskin-vincentzyu-fork" target="_blank">
    <img src="https://img.shields.io/npm/dm/koishi-plugin-mcrenderskin-vincentzyu-fork?style=flat-square" alt="npm downloads">
  </a>
  <br>
  <a href="https://github.com/VincentZyuApps/koishi-plugin-mcrenderskin-vincentzyu-fork" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://gitee.com/vincent-zyu/koishi-plugin-mcrenderskin-vincentzyu-fork" target="_blank">
    <img src="https://img.shields.io/badge/Gitee-C71D23?style=for-the-badge&logo=gitee&logoColor=white" alt="Gitee">
  </a>
  <br>
  <a href="https://forum.koishi.xyz/t/topic/xxxxx/3" target="_blank">
    <img src="https://img.shields.io/badge/Koishi Forum-xxxxx-5546A3?style=for-the-badge&logo=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Ff%2Ff3%2FKoishi.js_Logo.png&logoColor=white" alt="Forum">
  </a>
  <a href="https://qm.qq.com/q/4vjto4V7Di" target="_blank">
    <img src="https://img.shields.io/badge/QQ群-259248174-12B7F5?style=flat-square&logo=qq&logoColor=white" alt="QQ群">
  </a>
</p>

<h2>🙏 特别感谢</h2>
<p>
  本插件的 3D 皮肤渲染能力基于
  <a href="https://github.com/bs-community/skinview3d" target="_blank"><b>bs-community/skinview3d</b></a>
  项目。感谢 skinview3d 提供优秀的 Minecraft 皮肤渲染能力；本插件使用其 TypeScript 源码生态与本地 bundle JS 资源进行 Koishi 侧封装。
</p>
<p>
  <a href="https://github.com/bs-community/skinview3d" target="_blank">
    <img src="https://img.shields.io/badge/skinview3d-TypeScript%20Source-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="skinview3d TypeScript Source">
  </a>
  <a href="https://www.npmjs.com/package/skinview3d" target="_blank">
    <img src="https://img.shields.io/badge/skinview3d-Bundle%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="skinview3d Bundle JS">
  </a>
</p>

<hr>

<h2>✨ 功能概述</h2>
<ul>
  <li>🧍 渲染 Minecraft Java 玩家 3D 皮肤</li>
  <li>🧥 支持披风 / cape 兜底获取</li>
  <li>🖼️ 支持自定义背景图、字体路径、bundle 路径</li>
  <li>🌐 支持通过 Koishi 的 <code>ctx.http</code> 下载皮肤或披风并转 base64</li>
  <li>🔎 支持调试日志，方便排查资源读取、下载和 Puppeteer 渲染问题</li>
</ul>

<hr>

<h2>📝 使用方式</h2>
<ol>
  <li>先安装并启用 <b>Puppeteer</b> 依赖插件。</li>
  <li>启用本插件的 <code>enableRender</code> 开关。</li>
  <li>使用 <code>MCR [玩家名称]</code> 渲染指定玩家。</li>
</ol>

<hr>

<h2>🔧 配置建议</h2>
<ul>
  <li>📐 <code>renderSize</code> 越高，画面越清晰，但渲染更慢、占用更多内存。</li>
  <li>🖼️ <code>wallPaper</code> 支持 <code>Default</code>、URL、Base64、路径。</li>
  <li>📦 <code>skinview3dBundlePath</code>、🔤 <code>fontPath</code>、🌄 <code>defaultWallPath</code> 都支持相对路径和绝对路径。</li>
  <li>🔎 调试时建议打开 <code>debugLog</code>，便于查看资源读取和渲染阶段日志。</li>
</ul>

<hr>

<h2>⚠️ 常见问题</h2>
<ol>
  <li><b>只显示背景，没有玩家</b><br>
    可能是浏览器 WebGL 不可用，或 bundle / 字体 / 图片资源加载失败。
  </li>
  <li><b>Docker 环境渲染失败</b><br>
    官方 Alpine 镜像下可尝试将 <code>chromium</code> 替换为 <code>chromium-swiftshader</code>，然后重启 Puppeteer。
  </li>
  <li><b>皮肤 / 披风请求失败</b><br>
    可尝试开启 <code>trySkinBase64</code> 或 <code>tryCapeBase64</code>，让插件先下载图片再交给浏览器渲染。
  </li>
</ol>

<hr>

<h2>🧭 调试建议</h2>
<ul>
  <li>🔎 打开 <code>debugLog</code> 查看资源读取、Mojang 查询、皮肤/披风下载、Puppeteer 渲染等阶段日志。</li>
  <li>📁 检查资源路径是否正确，尤其是相对路径是否能从当前插件目录解析到目标文件。</li>
  <li>🌐 如果网络较差，优先排查 Mojang、OptiFine、MinecraftCapes 相关接口是否可访问。</li>
</ul>

<hr>
`;
