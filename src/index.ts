import { Context } from 'koishi';
import {} from 'koishi-plugin-puppeteer';
import { type Config as ConfigType } from './config';
import { generateHtml, readRendererAssets } from './render';
import { usage } from './usage';
import {
  getCapeUrlByTextureProf,
  getImgB64ByImgUrl,
  getMinecraftCapesByUuid,
  getOptiCapeByName,
  getProfileB64ByUuid,
  getRenderSize,
  getSkinUrlByProfileB64,
  getUuidNameByName,
  isValidMcName,
} from './util';

export const name = 'mcrenderskin-vincentzyu-fork';
export { Config } from './config';
export { usage } from './usage';

export const inject = {
  required: ['puppeteer'],
};

export function apply(ctx: Context, config: ConfigType) {
  const enabled = config.enableRender ?? false;
  if (!enabled) return;
  const debugLog = config.debugLog ?? false;

  const initName = config.initName ?? 'VincentZyu';
  const renderTimeout = config.renderTimeOut ?? 5000;
  const renderSize = getRenderSize(config.renderSize ?? '360P');
  const width = renderSize.viewportWidth;
  const height = renderSize.viewportHeight;
  const wallPaper = config.wallPaper ?? 'Default';

  const assetsPromise = readRendererAssets({
    skinview3dBundlePath: config.skinview3dBundlePath,
    fontPath: config.fontPath,
    defaultWallPath: config.defaultWallPath,
    debugLog,
    ctx,
  });

  ctx.command('MCR [玩家名称:string]', '渲染MC玩家3D图', { authority: 1 }).alias('mcrender').action(async ({ session }, name?: string) => {
    let playerName = name ?? initName;
    if (!isValidMcName(playerName)) return '输入的玩家名称非法';
    if (debugLog) ctx.logger.info('🔎 开始渲染: %s', playerName);

    const uuidName = await getUuidNameByName(ctx, playerName, debugLog);
    if (!uuidName) {
      ctx.logger.error('无法获取 %c 的UUID', playerName);
      return `无法获取 ${playerName} 的 UUID`;
    }

    playerName = uuidName.name;
    const uuid = uuidName.id;
    const profileB64 = await getProfileB64ByUuid(ctx, uuid, debugLog);
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

    const assets = await assetsPromise;
    if (debugLog) ctx.logger.info('🔎 资源就绪，开始组装 HTML');
    const html = generateHtml(wallPaper, playerName, skin, cape, renderSize, assets.fontDataUri, assets.skinview3dBundleJs, assets.defaultWallDataUri);
    if (debugLog) ctx.logger.info('🔎 HTML 已生成，准备调用 Puppeteer');
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

    return (result as string | undefined) ?? `渲染 ${playerName} 失败`;
  });
}
