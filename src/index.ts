import { Context, h } from 'koishi';
import {} from 'koishi-plugin-puppeteer';
import { type Config as ConfigType } from './config';
import { generateHtml, readRendererAssets } from './render';
import { buildRenderKeyboard, buildRenderMarkdown, sendQQMarkdown } from './qq';
import {
  getCapeUrlByTextureProf,
  getImgB64ByImgUrl,
  getMinecraftCapesByUuid,
  getOptiCapeByName,
  getProfileB64ByUuidWithCache,
  getRenderSize,
  ensureSharedAssets,
  resolveRuntimeSharedAssetPath,
  SHARED_ASSET_FILES,
  getSkinUrlByProfileB64,
  getUuidNameByNameWithCache,
  isValidMcName,
  PROFILE_CACHE_TABLE,
  UUID_CACHE_TABLE,
} from './util';

export const name = 'mcrenderskin-vincentzyu-fork';
export { Config } from './config';
export { usage } from './usage';

export const inject = {
  required: ['puppeteer'],
  optional: ['database'],
};

export function apply(ctx: Context, config: ConfigType) {
  const enabled = config.enableRender ?? false;
  if (!enabled) return;
  const debugLog = config.debugLog ?? false;

  ctx.inject(['database'], (ctx) => {
    if (config.enableUuidCache) {
      ctx.model.extend(
        UUID_CACHE_TABLE,
        {
          queryName: 'string',
          uuid: 'string',
          playerName: 'string',
          cachedAt: 'integer',
        },
        { primary: 'queryName' },
      );
    }

    if (config.enableProfileCache) {
      ctx.model.extend(
        PROFILE_CACHE_TABLE,
        {
          uuid: 'string',
          profileB64: 'string',
          cachedAt: 'integer',
        },
        { primary: 'uuid' },
      );
    }
  });

  const initName = config.initName ?? 'VincentZyu';
  const renderTimeout = config.renderTimeOut ?? 5000;
  const renderSize = getRenderSize(config.renderSize ?? '360P');
  const mcrCommandName = config.mcrCommandName || 'mcrs';
  const width = renderSize.viewportWidth;
  const height = renderSize.viewportHeight;
  const wallPaper = config.wallPaper ?? 'Default';

  const assetsPromise = ensureSharedAssets(ctx, debugLog).then(() => {
    return readRendererAssets({
      skinview3dBundlePath: resolveRuntimeSharedAssetPath(ctx, config.skinview3dBundlePath, SHARED_ASSET_FILES.skinview3dBundlePath),
      fontPath: resolveRuntimeSharedAssetPath(ctx, config.fontPath, SHARED_ASSET_FILES.fontPath),
      defaultWallPath: resolveRuntimeSharedAssetPath(ctx, config.defaultWallPath, SHARED_ASSET_FILES.defaultWallPath),
      debugLog,
      ctx,
    });
  });

  ctx.command(`${mcrCommandName} [玩家名称:string]`, '渲染MC玩家3D图', { authority: 1 }).alias('mcrender').action(async ({ session }, name?: string) => {
    const totalStart = Date.now();
    let networkMs = 0;
    let renderMs = 0;
    let playerName = name ?? initName;
    if (!isValidMcName(playerName)) return '输入的玩家名称非法';
    if (debugLog) ctx.logger.info('🔎 开始渲染: %s', playerName);

    const networkStart = Date.now();
    const uuidName = await getUuidNameByNameWithCache(ctx, playerName, {
      enableUuidCache: config.enableUuidCache,
      uuidCacheDays: config.uuidCacheDays,
      debugLog,
    });
    if (!uuidName) {
      ctx.logger.error('无法获取 %c 的UUID', playerName);
      return `无法获取 ${playerName} 的 UUID`;
    }

    playerName = uuidName.name;
    const uuid = uuidName.id;
    const profileB64 = await getProfileB64ByUuidWithCache(ctx, uuid, {
      enableProfileCache: config.enableProfileCache,
      profileCacheMinutes: config.profileCacheMinutes,
      debugLog,
    });
    if (!profileB64) {
      ctx.logger.error('无法获取 %c 的PROFILE', playerName);
      return `无法获取 ${playerName} 的 PROFILE`;
    }

    let skin = getSkinUrlByProfileB64(profileB64);
    if (!skin) return `无法获取 ${playerName} 的皮肤地址`;

    let cape = getCapeUrlByTextureProf(profileB64);
    if (!cape) cape = await getOptiCapeByName(ctx, playerName, debugLog);
    if (!cape) cape = await getMinecraftCapesByUuid(ctx, uuid, debugLog);

    if (config.trySkinBase64) skin = (await getImgB64ByImgUrl(ctx, skin, debugLog)) ?? skin;
    if (config.tryCapeBase64 && cape && !cape.startsWith('data:image/png;base64,')) {
      cape = await getImgB64ByImgUrl(ctx, cape, debugLog);
    }
    networkMs = Date.now() - networkStart;

    const assets = await assetsPromise;
    if (debugLog) ctx.logger.info('🔎 资源就绪，开始组装 HTML');
    const html = generateHtml(wallPaper, playerName, skin, cape, renderSize, assets.fontDataUri, assets.skinview3dBundleJs, assets.defaultWallDataUri);
    if (debugLog) ctx.logger.info('🔎 HTML 已生成，准备调用 Puppeteer');
    const renderStart = Date.now();
    const result = await ctx.puppeteer.render(html, async (page, next) => {
      const renderPromise = next();
      await page.setViewport({ width, height });
      if (debugLog) ctx.logger.info('🔎 Puppeteer viewport = %s x %s', width, height);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('渲染超时')), renderTimeout);
      });
      try {
        const rendered = (await Promise.race([renderPromise, timeoutPromise])) as string;
        if (debugLog) ctx.logger.info('🔎 Puppeteer 渲染完成');
        return rendered;
      } catch (error) {
        ctx.logger.error('渲染失败: %c', error);
        await page.close();
        if ((error as Error).message === '渲染超时') return `渲染 ${playerName} 超时`;
        return `渲染 ${playerName} 失败`;
      }
    });
    renderMs = Date.now() - renderStart;

    const totalMs = Date.now() - totalStart;
    const renderInfo = `\n⏱️ 网络请求: ${networkMs}ms | 🎨 Puppeteer 渲染: ${renderMs}ms | 📊 总耗时: ${totalMs}ms`;
    const baseMessage = (result as string | undefined) ?? `渲染 ${playerName} 失败`;
    const quotePrefix = config.enableQuote ? h.quote(session.messageId) : '';
    const message = `${quotePrefix}${config.showRenderInfo ? `${baseMessage}${renderInfo}` : baseMessage}`;
    const renderOk = !message.includes('失败') && !message.includes('超时');
    if (renderOk && config.enableQQMarkdown && (session.platform === 'qq' || session.platform === 'qqguild')) {
      await session.send(message);
      const timing = config.enableQQMarkdownRenderInfo
        ? { networkMs, renderMs, totalMs }
        : undefined;
      const md = buildRenderMarkdown(playerName, timing);
      const kb = buildRenderKeyboard(playerName, session.userId, mcrCommandName, config.qqMarkdownKeyboardJson);
      await sendQQMarkdown(session, md, kb);
      return;
    }

    return message;
  });
}
