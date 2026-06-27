import type { Context } from 'koishi';
import { readBinaryAsset, readTextAsset, toDataUri } from './util';
import type { RenderSize } from './util';

export async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function debug(ctx: Context | undefined, enabled: boolean | undefined, message: string, ...args: any[]) {
  if (!enabled || !ctx) return;
  ctx.logger.info(message, ...args);
}

function loadFontData(fontPath: string): string {
  return toDataUri('application/x-font-woff2;charset=utf-8', readBinaryAsset(fontPath));
}

function loadWallpaper(defaultWallPath: string): string {
  const filePath = defaultWallPath.toLowerCase();
  const mime = filePath.endsWith('.png')
    ? 'image/png'
    : filePath.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';
  return toDataUri(mime, readBinaryAsset(defaultWallPath));
}

export function getHtmlTemplate(wallpaper: string, fontDataUri: string, skinview3dBundleJs: string, defaultWallDataUri: string): string {
  const background = wallpaper && wallpaper !== 'Default' ? wallpaper.replace(/\\/g, '/') : defaultWallDataUri;
  return `
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Minecraft Skin Render</title>
    <style>
      @font-face {
        font-family: 'Minecraft';
        src: url('${fontDataUri}') format('woff2');
      }
      body {
        margin: 0;
        background-image: url('${background}');
        background-repeat: no-repeat;
        background-size: cover;
        background-attachment: fixed;
      }
    </style>
  </head>
  <body>
    <div id="rendered_imgs"></div>
    <script>${skinview3dBundleJs}</script>
  </body>
</html>`;
}

export function generateHtml(wall: string, name: string, skin: string, cape: string | undefined, renderSize: RenderSize, fontDataUri: string, skinview3dBundleJs: string, defaultWallDataUri: string): string {
  const width = cape ? renderSize.skinWidth : renderSize.skinWidthNoCape;
  const template = getHtmlTemplate(wall, fontDataUri, skinview3dBundleJs, defaultWallDataUri);
  return `${template}
<script>
  const playerName = ${JSON.stringify(name)};
  const config = {
    skin: ${JSON.stringify(skin)},
    width: ${width},
    height: ${renderSize.skinHeight},
    cape: ${cape ? JSON.stringify(cape) : 'null'},
  };

  function fakeAnimation(skinViewerObject, t = 0) {
    skinViewerObject.playerObject.skin.leftLeg.rotation.x = Math.sin(t) * 0.5;
    skinViewerObject.playerObject.skin.rightLeg.rotation.x = Math.sin(t + Math.PI) * 0.5;
    skinViewerObject.playerObject.skin.leftArm.rotation.x = Math.sin(t + Math.PI) * 0.5;
    skinViewerObject.playerObject.skin.rightArm.rotation.x = Math.sin(t) * 0.5;
    const basicArmRotationZ = Math.PI * 0.02;
    skinViewerObject.playerObject.skin.leftArm.rotation.z = Math.cos(t) * 0.03 + basicArmRotationZ;
    skinViewerObject.playerObject.skin.rightArm.rotation.z = Math.cos(t + Math.PI) * 0.03 - basicArmRotationZ;
    const basicCapeRotationX = Math.PI * 0.06;
    if (skinViewerObject.playerObject.cape) {
      skinViewerObject.playerObject.cape.rotation.x = Math.sin(t / 1.5) * 0.06 + basicCapeRotationX;
    }
  }

  (async function () {
    const skinViewer = new skinview3d.SkinViewer({
      width: config.width,
      height: config.height,
      renderPaused: true
    });

    skinViewer.camera.rotation.x = -0.52;
    skinViewer.camera.rotation.y = 0.27;
    skinViewer.camera.rotation.z = 0.15;
    skinViewer.camera.position.x = 11.84;
    skinViewer.camera.position.y = 21.08;
    skinViewer.camera.position.z = 36.48;
    skinViewer.zoom = 0.7;
    skinViewer.animation = new skinview3d.WalkingAnimation({ speed: '1', paused: true, progress: 2.601, headBobbing: true });
    skinViewer.nameTag = new skinview3d.NameTagObject(playerName);
    skinViewer.nameTag.position.x = 0;
    skinViewer.nameTag.position.y = 20;
    skinViewer.nameTag.position.z = 0;
    skinViewer.nameTag.height = 2;
    skinViewer.nameTag.scale.x = playerName.length * 1.4;
    skinViewer.nameTag.scale.y = 2.4;
    skinViewer.nameTag.scale.z = 1;
    fakeAnimation(skinViewer, 10);
    await Promise.all([
      skinViewer.loadSkin(config.skin),
      skinViewer.loadCape(config.cape, { backEquipment: config.cape ? 'cape' : null })
    ]);
    skinViewer.render();
    const image = skinViewer.canvas.toDataURL();
    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.width = skinViewer.width;
    imgElement.height = skinViewer.height;
    document.getElementById('rendered_imgs').appendChild(imgElement);
    skinViewer.dispose();
  })();
</script>
<script>
  (async function () {
    const skinViewer2 = new skinview3d.SkinViewer({
      width: config.width,
      height: config.height,
      renderPaused: true
    });
    skinViewer2.camera.rotation.x = -2.59;
    skinViewer2.camera.rotation.y = 0.40;
    skinViewer2.camera.rotation.z = 2.91;
    skinViewer2.camera.position.x = 17.12;
    skinViewer2.camera.position.y = 21.16;
    skinViewer2.camera.position.z = -34.48;
    skinViewer2.zoom = 0.7;
    fakeAnimation(skinViewer2, 12);
    await Promise.all([
      skinViewer2.loadSkin(config.skin),
      skinViewer2.loadCape(config.cape, { backEquipment: config.cape ? 'cape' : null })
    ]);
    skinViewer2.render();
    const image = skinViewer2.canvas.toDataURL();
    const imgElement = document.createElement('img');
    imgElement.src = image;
    imgElement.width = skinViewer2.width;
    imgElement.height = skinViewer2.height;
    document.getElementById('rendered_imgs').appendChild(imgElement);
    skinViewer2.dispose();
  })();
</script>
<script>
  if (config.cape != null) {
    (async function () {
      const skinViewer3 = new skinview3d.SkinViewer({
        width: config.width,
        height: config.height,
        renderPaused: true
      });
      skinViewer3.camera.rotation.x = -2.59;
      skinViewer3.camera.rotation.y = 0.40;
      skinViewer3.camera.rotation.z = 2.91;
      skinViewer3.camera.position.x = 17.12;
      skinViewer3.camera.position.y = 21.16;
      skinViewer3.camera.position.z = -34.48;
      skinViewer3.zoom = 0.7;
      fakeAnimation(skinViewer3, 12);
      await Promise.all([
        skinViewer3.loadSkin(config.skin),
        skinViewer3.loadCape(config.cape, { backEquipment: 'elytra' })
      ]);
      skinViewer3.render();
      const image = skinViewer3.canvas.toDataURL();
      const imgElement = document.createElement('img');
      imgElement.src = image;
      imgElement.width = skinViewer3.width;
      imgElement.height = skinViewer3.height;
      document.getElementById('rendered_imgs').appendChild(imgElement);
      skinViewer3.dispose();
    })();
  }
</script>`;
}

export async function readRendererAssets(config: {
  skinview3dBundlePath: string;
  fontPath: string;
  defaultWallPath: string;
  debugLog?: boolean;
  ctx?: Context;
}) {
  debug(config.ctx, config.debugLog, '📦 读取 skinview3d bundle: %s', config.skinview3dBundlePath);
  const skinview3dBundleJs = readTextAsset(config.skinview3dBundlePath);
  debug(config.ctx, config.debugLog, '🔤 读取 Minecraft 字体: %s', config.fontPath);
  const fontDataUri = loadFontData(config.fontPath);
  debug(config.ctx, config.debugLog, '🌄 读取默认背景图: %s', config.defaultWallPath);
  const defaultWallDataUri = loadWallpaper(config.defaultWallPath);
  return { skinview3dBundleJs, fontDataUri, defaultWallDataUri };
}
