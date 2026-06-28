import fs from 'node:fs';
import path from 'node:path';
import { Context } from 'koishi';
import { resolveAssetPath } from './config';

const SHARED_ASSET_ROOT_PARTS = ['data', 'assets', 'mcrenderskin-vincentzyu-fork'];

export const SHARED_ASSET_FILES = {
  skinview3dBundlePath: ['vendor', 'skinview3d.bundle.js'],
  fontPath: ['fonts', 'MinecraftAE.sub.ttf'],
  defaultWallPath: ['image', 'default-wall.jpg'],
} as const;

export const RENDER_SIZE_KEYS = ['360P', '720P', '1440P', '2200P'] as const;
export type RenderSizeKey = (typeof RENDER_SIZE_KEYS)[number];
export const UUID_CACHE_TABLE = 'mcrenderskin_vincentzyu_fork_uuid_cache';
export const PROFILE_CACHE_TABLE = 'mcrenderskin_vincentzyu_fork_profile_cache';

export interface UuidNameCache {
  queryName: string;
  uuid: string;
  playerName: string;
  cachedAt: number;
}

export interface ProfileCache {
  uuid: string;
  profileB64: string;
  cachedAt: number;
}

declare module 'koishi' {
  interface Tables {
    mcrenderskin_vincentzyu_fork_uuid_cache: UuidNameCache;
    mcrenderskin_vincentzyu_fork_profile_cache: ProfileCache;
  }
}

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

export function getSharedAssetRootByBaseDir(baseDir: string): string {
  return path.join(baseDir, ...SHARED_ASSET_ROOT_PARTS);
}

export function getSharedAssetPathByBaseDir(baseDir: string, relativeParts: readonly string[]): string {
  return path.join(getSharedAssetRootByBaseDir(baseDir), ...relativeParts);
}

function getBundledAssetPath(relativeParts: readonly string[]): string {
  return path.resolve(__dirname, '../assets', ...relativeParts);
}

async function copyBundledAssetIfMissing(ctx: Context, relativeParts: readonly string[], verboseConsoleLog = false): Promise<string> {
  const sourcePath = getBundledAssetPath(relativeParts);
  const targetPath = getSharedAssetPathByBaseDir(ctx.baseDir, relativeParts);

  await fs.promises.mkdir(path.dirname(targetPath), { recursive: true });
  if (fs.existsSync(targetPath)) {
    debug(ctx, verboseConsoleLog, '📦 共享资源已存在，跳过复制: %s', targetPath);
    return targetPath;
  }

  await fs.promises.copyFile(sourcePath, targetPath);
  ctx.logger.info('📦 已复制内置资源到 Koishi 数据目录: %s', targetPath);
  return targetPath;
}

export async function ensureSharedAssets(ctx: Context, verboseConsoleLog = false) {
  return {
    skinview3dBundlePath: await copyBundledAssetIfMissing(ctx, SHARED_ASSET_FILES.skinview3dBundlePath, verboseConsoleLog),
    fontPath: await copyBundledAssetIfMissing(ctx, SHARED_ASSET_FILES.fontPath, verboseConsoleLog),
    defaultWallPath: await copyBundledAssetIfMissing(ctx, SHARED_ASSET_FILES.defaultWallPath, verboseConsoleLog),
  };
}

export function resolveRuntimeSharedAssetPath(ctx: Context, configuredPath: string, relativeParts: readonly string[]): string {
  const configured = configuredPath?.trim();
  const configDefaultPath = getSharedAssetPathByBaseDir(process.cwd(), relativeParts);
  const runtimeDefaultPath = getSharedAssetPathByBaseDir(ctx.baseDir, relativeParts);

  if (!configured || configured === configDefaultPath || configured === runtimeDefaultPath) {
    return runtimeDefaultPath;
  }

  return configured;
}

export function toDataUri(mime: string, data: Buffer): string {
  return `data:${mime};base64,${data.toString('base64')}`;
}

async function fetchUuidNameByName(ctx: Context, name: string, verboseConsoleLog = false): Promise<{ id: string; name: string } | undefined> {
  try {
    debug(ctx, verboseConsoleLog, '🔎 查询 Mojang UUID: %s', name);
    const resp_json = await ctx.http.get(`https://api.mojang.com/users/profiles/minecraft/${name}`, { responseType: 'json' });
    return { id: resp_json.id, name: resp_json.name };
  } catch {
    ctx.logger?.warn?.(`Uuid not found: ${name}`);
    return undefined;
  }
}

export async function getUuidNameByName(ctx: Context, name: string, verboseConsoleLog = false): Promise<{ id: string; name: string } | undefined> {
  return fetchUuidNameByName(ctx, name, verboseConsoleLog);
}

export async function getUuidNameByNameWithCache(
  ctx: Context,
  name: string,
  options: {
    enableUuidCache?: boolean;
    uuidCacheDays?: number;
    verboseConsoleLog?: boolean;
  },
): Promise<{ id: string; name: string } | undefined> {
  const verboseConsoleLog = options.verboseConsoleLog ?? false;
  const cacheEnabled = options.enableUuidCache ?? true;
  const cacheDays = Math.max(1, options.uuidCacheDays ?? 30);
  const database = ctx.database;

  if (!cacheEnabled || !database) {
    if (verboseConsoleLog && cacheEnabled && !database) ctx.logger.warn('🔎 UUID 缓存已启用，但 database 服务不可用，改为直接查询 Mojang');
    return fetchUuidNameByName(ctx, name, verboseConsoleLog);
  }

  const queryName = name.toLowerCase();
  const now = Date.now();
  const expiredBefore = now - cacheDays * 24 * 60 * 60 * 1000;

  try {
    const cached = await database.get(UUID_CACHE_TABLE, { queryName });
    const item = cached[0];
    if (item && item.cachedAt >= expiredBefore) {
      debug(ctx, verboseConsoleLog, '🔎 命中 UUID 缓存: %s -> %s', name, item.uuid);
      return { id: item.uuid, name: item.playerName };
    }
  } catch {
    if (verboseConsoleLog) ctx.logger.warn('🔎 读取 UUID 缓存失败，改为直接查询 Mojang');
  }

  const result = await fetchUuidNameByName(ctx, name, verboseConsoleLog);
  if (!result) return undefined;

  try {
    await database.upsert(UUID_CACHE_TABLE, [
      {
        queryName,
        uuid: result.id,
        playerName: result.name,
        cachedAt: now,
      },
    ]);
    debug(ctx, verboseConsoleLog, '🔎 写入 UUID 缓存: %s -> %s', result.name, result.id);
  } catch {
    if (verboseConsoleLog) ctx.logger.warn('🔎 写入 UUID 缓存失败');
  }

  return result;
}

export async function getProfileB64ByUuid(ctx: Context, uuid: string, verboseConsoleLog = false): Promise<string | undefined> {
  return fetchProfileB64ByUuid(ctx, uuid, verboseConsoleLog);
}

async function fetchProfileB64ByUuid(ctx: Context, uuid: string, verboseConsoleLog = false): Promise<string | undefined> {
  try {
    debug(ctx, verboseConsoleLog, '🧬 查询 profile: %s', uuid);
    const resp_json = await ctx.http.get(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid.replace(/-/g, '')}`, { responseType: 'json' });
    return resp_json.properties?.[0]?.value;
  } catch {
    return undefined;
  }
}

export async function getProfileB64ByUuidWithCache(
  ctx: Context,
  uuid: string,
  options: {
    enableProfileCache?: boolean;
    profileCacheMinutes?: number;
    verboseConsoleLog?: boolean;
  },
): Promise<string | undefined> {
  const verboseConsoleLog = options.verboseConsoleLog ?? false;
  const cacheEnabled = options.enableProfileCache ?? true;
  const cacheMinutes = Math.max(1, options.profileCacheMinutes ?? 10);
  const database = ctx.database;
  const normalizedUuid = uuid.replace(/-/g, '');

  if (!cacheEnabled || !database) {
    if (verboseConsoleLog && cacheEnabled && !database) ctx.logger.warn('🧬 profile 缓存已启用，但 database 服务不可用，改为直接查询 Mojang');
    return fetchProfileB64ByUuid(ctx, normalizedUuid, verboseConsoleLog);
  }

  const now = Date.now();
  const expiredBefore = now - cacheMinutes * 60 * 1000;

  try {
    const cached = await database.get(PROFILE_CACHE_TABLE, { uuid: normalizedUuid });
    const item = cached[0];
    if (item && item.cachedAt >= expiredBefore) {
      debug(ctx, verboseConsoleLog, '🧬 命中 profile 缓存: %s', normalizedUuid);
      return item.profileB64;
    }
  } catch {
    if (verboseConsoleLog) ctx.logger.warn('🧬 读取 profile 缓存失败，改为直接查询 Mojang');
  }

  const profileB64 = await fetchProfileB64ByUuid(ctx, normalizedUuid, verboseConsoleLog);
  if (!profileB64) return undefined;

  try {
    await database.upsert(PROFILE_CACHE_TABLE, [
      {
        uuid: normalizedUuid,
        profileB64,
        cachedAt: now,
      },
    ]);
    debug(ctx, verboseConsoleLog, '🧬 写入 profile 缓存: %s', normalizedUuid);
  } catch {
    if (verboseConsoleLog) ctx.logger.warn('🧬 写入 profile 缓存失败');
  }

  return profileB64;
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

export async function getOptiCapeByName(ctx: Context, name: string, verboseConsoleLog = false): Promise<string | undefined> {
  try {
    debug(ctx, verboseConsoleLog, '🪁 尝试下载 OptiFine cape: %s', name);
    const resp_content = await ctx.http.get(`http://s.optifine.net/capes/${name}.png`);
    return `data:image/png;base64,${Buffer.from(resp_content, 'utf8').toString('base64')}`;
  } catch {
    return undefined;
  }
}

export async function getMinecraftCapesByUuid(ctx: Context, uuid: string, verboseConsoleLog = false): Promise<string | undefined> {
  try {
    debug(ctx, verboseConsoleLog, '🧥 尝试下载 MinecraftCapes: %s', uuid);
    const resp_json = await ctx.http.get(`https://api.minecraftcapes.net/profile/${uuid}`, { responseType: 'json' });
    if (resp_json.textures?.cape) return `data:image/png;base64,${resp_json.textures.cape}`;
    return undefined;
  } catch {
    return undefined;
  }
}

export async function getImgB64ByImgUrl(ctx: Context, url: string, verboseConsoleLog = false): Promise<string | undefined> {
  try {
    debug(ctx, verboseConsoleLog, '📥 下载图片并转 base64: %s', url);
    const resp_content = await ctx.http.get(url);
    return `data:image/png;base64,${Buffer.from(resp_content, 'utf8').toString('base64')}`;
  } catch {
    return undefined;
  }
}
