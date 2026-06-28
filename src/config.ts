import path from 'node:path';
import { Schema } from 'koishi';
import { type RenderSizeKey } from './util';
import { DEFAULT_KEYBOARD_ROWS, stringifyCompact } from './qq';

export interface Config {
  // ===== 🎯 指令设置 =====
  /** 🎯 Minecraft 皮肤渲染指令名 */
  mcrCommandName: string;

  // ===== 💬 消息设置 =====
  /** 💬 是否自动引用回复触发指令的消息 */
  enableQuote: boolean;
  /** ⏳ 是否显示「渲染中，请等待...」提示 */
  enableWaitingHint: boolean;

  // ===== 👤 玩家设置 =====
  /** 👤 渲染指令的默认玩家名称 */
  initName: string;
  /** 📐 渲染分辨率 */
  renderSize: RenderSizeKey;

  // ===== 🌐 下载设置 =====
  /** 🌐 尝试使用 Koishi 的 ctx.http 下载皮肤，而非走 Puppeteer */
  trySkinBase64: boolean;
  /** 🪁 尝试使用 Koishi 的 ctx.http 下载披风，而非走 Puppeteer */
  tryCapeBase64: boolean;

  // ===== 🖼️ 背景图设置 =====
  /** 🖼️ 自定义背景图 */
  wallPaper: string;

  // ===== ⏱️ 运行控制 =====
  /** ⏱️ 渲染超时阈值 ms */
  renderTimeOut: number;

  // ===== 📁 资源路径 =====
  /** 📦 skinview3d bundle 路径 */
  skinview3dBundlePath: string;
  /** 🔤 Minecraft 字体路径 */
  fontPath: string;
  /** 🌄 默认背景图路径 */
  defaultWallPath: string;

  // ===== 🤖 QQ 官方 Bot 平台设置 =====
  /** 💬 是否启用 QQ Markdown 消息 */
  enableQQMarkdown: boolean;
  /** ⏱️ 是否在 QQ Markdown 中展示网络请求、渲染和总耗时 */
  enableQQMarkdownRenderInfo: boolean;
  /** 📋 QQ Markdown 按钮 JSON 配置 */
  qqMarkdownKeyboardJson: string;

  // ===== 📊 渲染信息 =====
  /** 🖼️ 是否在图片消息后追加渲染耗时信息 */
  showRenderInfo: boolean;

  // ===== 🗄️ 缓存设置 =====
  /** 🗄️ 是否启用 UUID 数据库缓存 */
  enableUuidCache: boolean;
  /** 📅 UUID 缓存有效期（天） */
  uuidCacheDays: number;
  /** 🧬 是否启用 Mojang profile 数据库缓存 */
  enableProfileCache: boolean;
  /** ⏲️ Mojang profile 缓存有效期（分钟） */
  profileCacheMinutes: number;

  // ===== 🔎 调试输出 =====
  /** 🔎 开启详细调试日志 */
  debugLog: boolean;
}

export const DEFAULT_ASSETS = {
  skinview3dBundlePath: path.resolve(process.cwd(), 'data/assets/mcrenderskin-vincentzyu-fork/vendor/skinview3d.bundle.js'),
  fontPath: path.resolve(process.cwd(), 'data/assets/mcrenderskin-vincentzyu-fork/fonts/MinecraftAE.sub.ttf'),
  defaultWallPath: path.resolve(process.cwd(), 'data/assets/mcrenderskin-vincentzyu-fork/image/default-wall.jpg'),
};

// ===== 🧩 插件配置 =====
export const Config: Schema<Config> = Schema.intersect([
  // ===== 🎯 指令设置 =====
  Schema.object({
    mcrCommandName: Schema.string()
      .default('mcrs')
      .description('🎯 Minecraft 皮肤渲染指令名'),
  }).description('🎯 指令设置'),

  // ===== 💬 消息设置 =====
  Schema.object({
    enableQuote: Schema.boolean()
      .default(true)
      .description('💬 是否自动引用回复触发指令的消息'),

    enableWaitingHint: Schema.boolean()
      .default(true)
      .description('⏳ 是否启用「正在渲染，请稍候...」等待提示消息'),
  }).description('💬 消息设置'),

  // ===== 👤 玩家设置 =====
  Schema.object({
    initName: Schema.string()
      .default('VincentZyu')
      .pattern(/^[a-zA-Z0-9_]{3,16}$/)
      .description('👤 渲染指令的默认玩家名称'),

    renderSize: Schema.union([
      Schema.const('360P'),
      Schema.const('720P'),
      Schema.const('1440P'),
      Schema.const('2200P'),
    ])
      .default('720P')
      .description('📐 指定渲染分辨率，数值越高越耗时'),
  }).description('👤 玩家设置'),

  // ===== 🌐 下载设置 =====
  Schema.object({
    trySkinBase64: Schema.boolean()
      .default(false)
      .description('🧪 尝试使用 Koishi 的 `ctx.http` 下载皮肤，而非走 Puppeteer'),

    tryCapeBase64: Schema.boolean()
      .default(false)
      .description('🪁 尝试使用 Koishi 的 `ctx.http` 下载披风，而非走 Puppeteer'),
  }).description('🌐 下载设置'),

  // ===== 🖼️ 背景图设置 =====
  Schema.object({
    wallPaper: Schema.union([
      Schema.const('Default'),
      Schema.string().role('link').required().description('🔗 URL'),
      Schema.string()
        .pattern(/^(data:image\/[a-zA-Z]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/)
        .role('textarea', { rows: [10, 4] })
        .required()
        .description('🧱 Base64'),
      Schema.path().required().description('📁 Path'),
    ])
      .default('Default')
      .description('🖼️ 渲染时使用的自定义背景图<br>🌄 填写 <code>Default</code> 时使用默认背景图：<code>ctx.baseDir/data/assets/mcrenderskin-vincentzyu-fork/image/default-wall.jpg</code>'),
  }).description('🖼️ 背景图设置'),

  // ===== ⏱️ 运行控制 =====
  Schema.object({
    renderTimeOut: Schema.number()
      .min(0)
      .max(1e4)
      .default(5000)
      .description('⏱️ 渲染超时阈值，单位 ms'),
  }).description('⏱️ 运行控制'),

  // ===== 🗄️ 缓存设置 =====
  Schema.object({
    enableUuidCache: Schema.boolean()
      .default(true)
      .description('🗄️ 是否启用玩家 UUID 数据库缓存，需要 database 服务'),

    uuidCacheDays: Schema.number()
      .min(1)
      .max(365)
      .default(30)
      .description('📅 UUID 缓存有效期，单位：天'),

    enableProfileCache: Schema.boolean()
      .default(true)
      .description('🧬 是否启用 Mojang profile 数据库缓存，需要 database 服务'),

    profileCacheMinutes: Schema.number()
      .min(1)
      .max(10080)
      .default(10)
      .description('⏲️ Mojang profile 缓存有效期，单位：分钟'),
  }).description('🗄️ 缓存设置'),

  // ===== 📁 资源路径 =====
  Schema.object({
    skinview3dBundlePath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.skinview3dBundlePath)
      .description('📦 skinview3d bundle 路径（默认展示 cwd/data/assets；运行时自动使用 ctx.baseDir/data/assets）'),

    fontPath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.fontPath)
      .description('🔤 Minecraft 字体路径（默认展示 cwd/data/assets；运行时自动使用 ctx.baseDir/data/assets）'),

    defaultWallPath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.defaultWallPath)
      .description('🌄 默认背景图路径（默认展示 cwd/data/assets；运行时自动使用 ctx.baseDir/data/assets）'),
  }).description('📁 资源路径'),

  // ===== 🤖 QQ 官方 Bot 平台设置 =====
  Schema.object({
    enableQQMarkdown: Schema.boolean()
      .default(true)
      .description('💬 在 QQ 官方 Bot 平台发送渲染图后附带 Markdown + 按钮消息'),

    enableQQMarkdownRenderInfo: Schema.boolean()
      .default(true)
      .description('⏱️ 是否在 QQ Markdown 中展示网络请求、Puppeteer 渲染和总耗时'),

    qqMarkdownKeyboardJson: Schema.string()
      .role('textarea', { rows: [5, 10] })
      .default(stringifyCompact(DEFAULT_KEYBOARD_ROWS))
      .description(
        '📋 QQ Markdown 按钮 JSON 配置<br><em>支持变量: <code>${mcrCommandName}</code> <code>${playerName}</code> <code>${userId}</code></em>',
      ),
  }).description('🤖 QQ 官方 Bot 平台设置'),

  // ===== 📊 渲染信息 =====
  Schema.object({
    showRenderInfo: Schema.boolean()
      .default(true)
      .description('⏱️ 是否在图片消息后追加网络请求、Puppeteer 渲染和总耗时信息'),
  }).description('📊 渲染信息'),

  // ===== 🔎 调试输出 =====
  Schema.object({
    debugLog: Schema.boolean()
      .default(false)
      .description('🔎 开启详细调试日志，便于排查下载与渲染问题'),
  }).description('🔎 调试输出'),
]);

// 🧭 相对路径补全
export function resolveAssetPath(filePath: string, baseDir = process.cwd()) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDir, filePath);
}
