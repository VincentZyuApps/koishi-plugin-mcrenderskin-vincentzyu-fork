import fs from 'node:fs';
import path from 'node:path';
import { Context } from 'koishi';
import { resolveAssetPath } from './config';

export const RENDER_SIZE_KEYS = ['360P', '720P', '1440P', '2200P'] as const;
export type RenderSizeKey = (typeof RENDER_SIZE_KEYS)[number];

export interface RenderSize {
  viewportWidth: number;
  viewportHeight: number;
  skinWidth: number;
  skinWidthNoCape: number;
  skinHeight: number;
}

export const RENDER_SIZES: Record<RenderSizeKey, RenderSize> = {
  '360P': {
    viewportWidth: 271 * 2,
    viewportHeight: 180 * 2,
    skinWidth: 85 * 2,
    skinWidthNoCape: 125 * 2,
    skinHeight: 180 * 2,
  },
  '720P': {
    viewportWidth: 541 * 2,
    viewportHeight: 360 * 2,
    skinWidth: 175 * 2,
    skinWidthNoCape: 250 * 2,
    skinHeight: 360 * 2,
  },
  '1440P': {
    viewportWidth: 1080 * 2,
    viewportHeight: 720 * 2,
    skinWidth: 350 * 2,
    skinWidthNoCape: 500 * 2,
    skinHeight: 720 * 2,
  },
  '2200P': {
    viewportWidth: 1640 * 2,
    viewportHeight: 1100 * 2,
    skinWidth: 540 * 2,
    skinWidthNoCape: 810 * 2,
    skinHeight: 1080 * 2,
  },
};

function debug(ctx: Context | undefined, enabled: boolean | undefined, message: string, ...args: any[]) {
  if (!enabled || !ctx) return;
  ctx.logger.info(message, ...args);
}

export function getRenderSize(size: RenderSizeKey): RenderSize {
  return RENDER_SIZES[size] ?? RENDER_SIZES['360P'];
}

export function isValidMcName(name: string): boolean {
  return /^[a-zA-Z0-9_]{3,16}$/.test(name);
}

export function readTextAsset(filePath: string, baseDir = process.cwd()): string {
  return fs.readFileSync(resolveAssetPath(filePath, baseDir), 'utf8');
}

export function readBinaryAsset(filePath: string, baseDir = process.cwd()): Buffer {
  return fs.readFileSync(resolveAssetPath(filePath, baseDir));
}

export function toDataUri(mime: string, data: Buffer): string {
  return `data:${mime};base64,${data.toString('base64')}`;
}

export async function getUuidNameByName(ctx: Context, name: string, debugLog = false): Promise<{ id: string; name: string } | undefined> {
  try {
    debug(ctx, debugLog, '🔎 查询 Mojang UUID: %s', name);
    const resp_json = await ctx.http.get(`https://api.mojang.com/users/profiles/minecraft/${name}`, { responseType: 'json' });
    return { id: resp_json.id, name: resp_json.name };
  } catch {
    ctx.logger?.warn?.(`Uuid not found: ${name}`);
    return undefined;
  }
}

export async function getProfileB64ByUuid(ctx: Context, uuid: string, debugLog = false): Promise<string | undefined> {
  try {
    debug(ctx, debugLog, '🧬 查询 profile: %s', uuid);
    const resp_json = await ctx.http.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(/-/g, '')}`, { responseType: 'json' });
    return resp_json.properties?.[0]?.value;
  } catch {
    return undefined;
  }
}

export function getSkinUrlByProfileB64(profileBase64: string): string | undefined {
  try {
    const profile = JSON.parse(Buffer.from(profileBase64, 'base64').toString('utf8'));
    return profile.textures?.SKIN?.url;
  } catch {
    return undefined;
  }
}

export function getCapeUrlByTextureProf(profileBase64: string): string | undefined {
  try {
    const profile = JSON.parse(Buffer.from(profileBase64, 'base64').toString('utf8'));
    return profile.textures?.CAPE?.url;
  } catch {
    return undefined;
  }
}

export async function getOptiCapeByName(ctx: Context, name: string, debugLog = false): Promise<string | undefined> {
  try {
    debug(ctx, debugLog, '🪁 尝试下载 OptiFine cape: %s', name);
    const resp_content = await ctx.http.get(`http://s.optifine.net/capes/${name}.png`);
    return `data:image/png;base64,${Buffer.from(resp_content, 'utf8').toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function getMinecraftCapesByUuid(ctx: Context, uuid: string, debugLog = false): Promise<string | undefined> {
  try {
    debug(ctx, debugLog, '🧥 尝试下载 MinecraftCapes: %s', uuid);
    const resp_json = await ctx.http.get(`https://api.minecraftcapes.net/profile/${uuid}`, { responseType: 'json' });
    if (resp_json.textures?.cape) return `data:image/png;base64,${resp_json.textures.cape}`;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function getImgB64ByImgUrl(ctx: Context, url: string, debugLog = false): Promise<string | undefined> {
  try {
    debug(ctx, debugLog, '📥 下载图片并转 base64: %s', url);
    const resp_content = await ctx.http.get(url);
    return `data:image/png;base64,${Buffer.from(resp_content, 'utf8').toString('base64')}`;
  } catch {
    return undefined;
  }
}
