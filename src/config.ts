import path from 'node:path';
import { Schema } from 'koishi';
import { type RenderSizeKey } from './util';

export interface Config {
  enableRender: boolean;
  initName: string;
  renderSize: RenderSizeKey;
  trySkinBase64: boolean;
  tryCapeBase64: boolean;
  wallPaper: string;
  renderTimeOut: number;
  skinview3dBundlePath: string;
  fontPath: string;
  defaultWallPath: string;
  debugLog: boolean;
}

export const DEFAULT_ASSETS = {
  skinview3dBundlePath: path.resolve(__dirname, '../assets/vendor/skinview3d.bundle.js'),
  fontPath: path.resolve(__dirname, '../assets/fonts/minecraft.woff2'),
  defaultWallPath: path.resolve(__dirname, '../assets/image/default-wall.jpg'),
};

// 🧩 插件配置
export const Config: Schema<Config> = Schema.intersect([
  // ⚙️ 常规设置
  Schema.object({
    enableRender: Schema.boolean()
      .default(false)
      .description('🚀 是否启用 `MCR` 指令'),

    initName: Schema.string()
      .default('VincentZyu')
      .pattern(/^[a-zA-Z0-9_]{3,16}$/)
      .description('👤 `MCR` 指令的默认玩家名称'),

    renderSize: Schema.union([
      Schema.const('360P'),
      Schema.const('720P'),
      Schema.const('1440P'),
      Schema.const('2200P'),
    ])
      .default('360P')
      .description('📐 指定渲染分辨率，数值越高越耗时'),
  }).description('常规设置'),

  // 🌐 下载设置
  Schema.object({
    trySkinBase64: Schema.boolean()
      .default(false)
      .description('🧪 尝试使用 Koishi 的 `ctx.http` 下载皮肤，而非走 Puppeteer'),

    tryCapeBase64: Schema.boolean()
      .default(false)
      .description('🪁 尝试使用 Koishi 的 `ctx.http` 下载披风，而非走 Puppeteer'),
  }).description('下载设置'),

  // 🖼️ 背景图设置
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
      .description('🖼️ 渲染时使用的自定义背景图'),
  }).description('背景图设置'),

  // ⏱️ 运行控制
  Schema.object({
    renderTimeOut: Schema.number()
      .min(0)
      .max(1e4)
      .default(5000)
      .description('⏱️ 渲染超时阈值，单位 ms'),
  }).description('运行控制'),

  // 📁 资源路径
  Schema.object({
    skinview3dBundlePath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.skinview3dBundlePath)
      .description('📦 skinview3d bundle 路径'),

    fontPath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.fontPath)
      .description('🔤 Minecraft 字体路径'),

    defaultWallPath: Schema.string()
      .role('textarea', { rows: [2, 5] })
      .default(DEFAULT_ASSETS.defaultWallPath)
      .description('🌄 默认背景图路径'),
  }).description('资源路径'),

  // 🔎 调试输出
  Schema.object({
    debugLog: Schema.boolean()
      .default(false)
      .description('🔎 开启详细调试日志，便于排查下载与渲染问题'),
  }).description('调试输出'),
]);

// 🧭 相对路径补全
export function resolveAssetPath(filePath: string, baseDir = process.cwd()) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(baseDir, filePath);
}
