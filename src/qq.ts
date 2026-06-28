import { h } from 'koishi';

export const DEFAULT_KEYBOARD_ROWS = {
  rows: [
    {
      buttons: [
        {
          render_data: { label: '🔁 再来一张', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${mcrCommandName} ${playerName}',
            enter: true,
          },
        },
        {
          render_data: { label: '❓ 提供帮助', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: '${mcrCommandName} -h',
            enter: true,
          },
        },
      ],
    },
    {
      buttons: [
        {
          render_data: { label: '🎮 玩玩别的', style: 1 },
          action: {
            type: 2,
            permission: { type: 2 },
            data: 'help',
            enter: true,
          },
        },
      ],
    },
  ],
};

export function stringifyCompact(obj: any): string {
  const rows = obj.rows;
  let result = '{\n';
  result += '  "rows": [\n';
  for (let ri = 0; ri < rows.length; ri++) {
    const buttons = rows[ri].buttons.map(
      (b: any) => '        ' + JSON.stringify(b),
    );
    result += '    {\n';
    result += '      "buttons": [\n';
    result += buttons.join(',\n');
    result += '\n      ]\n';
    result += '    }' + (ri < rows.length - 1 ? ',' : '') + '\n';
  }
  result += '  ]\n';
  result += '}';
  return result;
}

export function buildRenderKeyboard(playerName: string, userId: string, mcrCommandName: string, customJson?: string): object {
  let raw = customJson || JSON.stringify(DEFAULT_KEYBOARD_ROWS);
  try {
    raw = raw.replace(/\$\{playerName\}/g, playerName);
    raw = raw.replace(/\$\{userId\}/g, userId);
    raw = raw.replace(/\$\{mcrCommandName\}/g, mcrCommandName);
    const parsed = JSON.parse(raw);
    if (parsed?.rows?.length) return parsed;
  } catch {}
  return DEFAULT_KEYBOARD_ROWS;
}

export interface RenderTimingInfo {
  networkMs: number;
  renderMs: number;
  totalMs: number;
}

export function buildRenderMarkdown(playerName: string, timing?: RenderTimingInfo): string {
  const lines = [
    '# Minecraft 皮肤渲染完成 ✨',
    '',
    `> 玩家名: ${playerName}`,
  ];

  if (timing) {
    lines.push(
      `> 🌐 网络请求耗时: ${timing.networkMs}ms`,
      `> 🎨 Puppeteer 渲染耗时: ${timing.renderMs}ms`,
      `> ⏱️ 总耗时: ${timing.totalMs}ms`,
    );
  }

  lines.push(
    '',
    '- ↓ 可以继续操作 ↓',
  );
  return lines.join('\n');
}

export async function sendQQMarkdown(
  session: any,
  markdown: string,
  keyboard: object,
): Promise<void> {
  if (!['qq', 'qqguild'].includes(session.platform)) return;
  try {
    const isCrack = !!(session.bot as any)?.config?.autoStreamText;

    if (isCrack) {
      const payload: Record<string, unknown> = {
        markdown: { content: markdown },
      };
      if ((keyboard as any)?.rows?.length) {
        payload.keyboard = { content: keyboard };
      }
      await session.send(h('qq:rawmarkdown', payload));
      return;
    }

    const payload: Record<string, unknown> = {
      msg_type: 2,
      markdown: { content: markdown },
    };
    if ((keyboard as any)?.rows?.length) {
      payload.keyboard = { content: keyboard };
    }

    if (
      session.messageId &&
      session.timestamp &&
      Date.now() - session.timestamp < 5 * 60 * 1000 - 2000
    ) {
      session.seq ||= 0;
      payload.msg_id = session.messageId;
      payload.msg_seq = ++session.seq;
    }

    await session.bot.internal.sendMessage(session.channelId, payload);
  } catch (e) {
    console.warn('⚠️💬 [QQ Markdown] 发送失败, 不影响图片:', e?.message || e);
  }
}
