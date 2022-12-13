import { Chat, SQL, Util } from '@dgx/server';

import { getIdentifierForPlayer, getPlayerForSteamId } from '../../helpers/identifiers';

import { dropBySteamId, penaltyLogger } from './util.penalties';

const penalisePlayer = async (
  type: 'ban' | 'kick' | 'warn',
  source: number,
  target: string,
  reasons: string[],
  points?: number,
  length?: number,
  data?: Record<string, any>
) => {
  const metadata = {
    reason: reasons.join(' | '),
    points: points ?? 0,
    length: length ?? null,
    automated: source === -1,
  };
  const result = await SQL.insertValues('penalties', [
    {
      steamId: target,
      penalty: type,
      ...metadata,
    },
  ]);
  if (result.affectedRows < 1) {
    Util.Log(
      `admin:penalties:${type}:failed`,
      {
        target,
        ...data,
        ...metadata,
      },
      `Failed to register ${type} for ${Util.getName(target)}(${target})`,
      source !== -1 ? source : undefined
    );
    penaltyLogger.error(
      `Failed to register ${type} for ${Util.getName(target)}(${target}) given by ${
        source !== -1 ? Util.getName(source) : 'AntiCheat'
      } | ${Object.values(metadata)
        .map((k, v) => `${k}: ${v}`)
        .join('| ')}`
    );
    Chat.sendMessage('admin', {
      type: 'error',
      message: `Failed to register ${type} for ${Util.getName(target)}(${target})`,
      prefix: 'Admin: ',
    });
    return;
  }
  Util.Log(
    `admin:penalties:${type}`,
    {
      target,
      ...metadata,
    },
    `${Util.getName(target)}(${target}) received a ${type} for ${reasons.join(' | ')}`,
    source !== -1 ? source : undefined
  );
  penaltyLogger.info(
    `${Util.getName(target)}(${target}) received a ${type} by ${Util.getName(
      source !== -1 ? Util.getName(source) : 'AntiCheat'
    )} | ${Object.entries(metadata)
      .map(([k, v]) => `${k}: ${v}`)
      .join('| ')}`
  );
  Chat.sendMessage('admin', {
    type: 'system',
    message: `${Util.getName(target)}(${target}) received a ${type} for ${reasons.join(
      ' | '
    )} (${points} points | ${length} days)`,
    prefix: 'Admin: ',
  });
};

/**
 * @param source
 * @param target steamId of the player to be punished
 * @param reason
 * @param points
 * @param length
 */
export const banPlayer = async (
  source: number,
  target: string | number,
  reasons: string[],
  points: number,
  length: number,
  data?: Record<string, any>
) => {
  if (typeof target === 'number' || !target.startsWith('steam')) {
    target = getIdentifierForPlayer(Number(target), 'steam');
  }
  await penalisePlayer('ban', source, target, reasons, points, length, data);
  dropBySteamId(target, `Banned for: ${reasons.join(' | ')}`);
};

export const kickPlayer = async (source: number, target: string | number, reasons: string[], points: number) => {
  if (typeof target === 'number') {
    target = getIdentifierForPlayer(target, 'steam');
  }
  await penalisePlayer('kick', source, target, reasons, points);
  dropBySteamId(target, `Kicked for: ${reasons.join(' | ')}`);
};

export const warnPlayer = async (source: number, target: string | number, reasons: string[]) => {
  if (typeof target === 'number') {
    target = getIdentifierForPlayer(target, 'steam');
  }
  await penalisePlayer('warn', source, target, reasons);
  const targetData = getPlayerForSteamId(target);
  if (!targetData) return;
  Chat.sendMessage(targetData.source, {
    type: 'warning',
    message: `Je bent gewaarschuwd voor: ${reasons.join(' | ')}`,
    prefix: 'Admin: ',
  });
};

export const isPlayerBanned = async (steamId: string) => {
  const result = await SQL.query<
    {
      reason: string;
      points: number;
      length: number;
      date: string;
      expiry: string;
    }[]
  >(
    `
      SELECT *,
             DATE_FORMAT(date + INTERVAL length DAY, '%d/%m/%Y %H:%i:%s') as expiry
      FROM penalties
      WHERE steamId = ?
        AND penalty = 'ban'
        AND (length = -1 OR CURRENT_TIMESTAMP < date + INTERVAL length DAY)

    `,
    [steamId]
  );
  if (result.length < 1) return { isBanned: false, reason: '' };
  return {
    isBanned: result.length > 0,
    reason: `Je bent gebanned voor ${result[0].reason}, Verloopt op ${result[0].expiry}`,
  };
};

export const ACBan = (target: number, reason: string, data?: Record<string, any>) =>
  banPlayer(-1, target, [`Anticheat: ${reason}`], 30, -1, data);
