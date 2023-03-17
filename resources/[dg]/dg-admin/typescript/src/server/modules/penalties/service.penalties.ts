import { Chat, Config, Notifications, SQL, Util } from '@dgx/server';
import dayjs from 'dayjs';
import { updatePointsReset } from 'modules/penaltyPoints/service.penaltyPoints';

import { getIdentifierForPlayer, getPlayerForSteamId, getServerIdForSteamId } from '../../helpers/identifiers';

import { dropBySteamId, penaltyLogger } from './util.penalties';

const penalisePlayer = async (
  type: 'ban' | 'kick' | 'warn',
  src: number,
  target: string,
  reasons: string[],
  points: number,
  length?: number,
  data?: Record<string, any>
) => {
  const targetSrvId = getServerIdForSteamId(target);
  const targetName = targetSrvId ? Util.getName(targetSrvId) : String(targetSrvId);
  const metadata = {
    reason: reasons.join(' | '),
    points: points,
    length: length ?? null,
    automated: src === -1,
  };
  const penalityId = await SQL.insertValues('penalties', [
    {
      steamId: target,
      penalty: type,
      ...metadata,
    },
  ]);
  if (!penalityId) {
    Util.Log(
      `admin:penalties:${type}:failed`,
      {
        target,
        data,
        metadata,
      },
      `Failed to register ${type} for ${targetName}(${target})`,
      src >= 1 ? src : undefined
    );
    penaltyLogger.error(
      `Failed to register ${type} for ${targetName}(${target}) given by ${
        src === -1 ? 'AntiCheat' : src === 0 ? 'Panel' : Util.getName(src)
      } | ${Object.values(metadata)
        .map((k, v) => `${k}: ${v}`)
        .join('| ')}`
    );
    Chat.sendMessage('admin', {
      type: 'error',
      message: `Failed to register ${type} for ${targetName}(${target})`,
      prefix: 'Admin: ',
    });
    return;
  }
  Util.Log(
    `admin:penalties:${type}`,
    {
      target,
      data,
      metadata,
    },
    `${targetName}(${target}) received a ${type} for ${reasons.join(' | ')}`,
    src >= 1 ? src : undefined
  );
  penaltyLogger.info(
    `${targetName}(${target}) received a ${type} by ${
      src === -1 ? 'AntiCheat' : src === 0 ? 'Panel' : Util.getName(src)
    } | ${Object.entries(metadata)
      .map(([k, v]) => `${k}: ${v}`)
      .join('| ')}`
  );
  Chat.sendMessage('admin', {
    type: 'system',
    message: `${targetName}(${target}) received a ${type} for ${reasons.join(' | ')} (${points} points${
      length !== undefined ? ` | ${length} days` : ''
    })`,
    prefix: 'Admin: ',
  });
  updatePointsReset(target, points);
  return penalityId;
};

/**
 * @param source
 * @param target steamId of the player to be punished
 * @param reason
 * @param points
 * @param length
 */
export const banPlayer = async (
  src: number,
  target: string | number,
  reasons: string[],
  points: number,
  length: number,
  data?: Record<string, any>
) => {
  if (typeof target === 'number' || !target.startsWith('steam')) {
    target = getIdentifierForPlayer(Number(target), 'steam')!;
  }
  await penalisePlayer('ban', src, target, reasons, points, length, data);
  dropBySteamId(target, `Banned for: ${reasons.join(' | ')}`);
};

export const kickPlayer = async (src: number, target: string | number, reasons: string[], points: number) => {
  if (typeof target === 'number') {
    target = getIdentifierForPlayer(target, 'steam')!;
  }
  await penalisePlayer('kick', src, target, reasons, points);
  dropBySteamId(target, `Kicked for: ${reasons.join(' | ')}`);
};

export const warnPlayer = async (src: number, target: string | number, reasons: string[], points: number) => {
  if (typeof target === 'number') {
    target = getIdentifierForPlayer(target, 'steam')!;
  }
  const penaltyId = await penalisePlayer('warn', src, target, reasons, points);
  if (!penaltyId && src > 0) {
    Notifications.add(src, 'Failed to warn player, try again');
    return;
  }
  const targetData = getPlayerForSteamId(target);
  if (!targetData) {
    await SQL.query('INSERT INTO admin_unnanounced_warns (steamid, penaltyid) VALUES (?, ?)', [target, penaltyId]);
    return;
  }
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
      date: number;
    }[]
  >(
    `
      SELECT *,
             UNIX_TIMESTAMP(date) as date
      FROM penalties
      WHERE steamId = ?
        AND penalty = 'ban'
        AND (length = -1 OR CURRENT_TIMESTAMP < date + INTERVAL length DAY)
    `,
    [steamId]
  );
  if (result.length < 1) return { isBanned: false, reason: '' };
  const expiry = dayjs.unix(result[0].date).add(result[0].length, 'd').format('DD/MM/YYYY HH:mm:ss');
  return {
    isBanned: result.length > 0,
    reason: `Je bent gebanned voor ${result[0].reason}, Verloopt op ${
      result[0].length === -1 ? 'permanently' : expiry
    }`,
  };
};

export const ACBan = (target: number, reason: string, data?: Record<string, any>) => {
  penaltyLogger.warn('Going to ban someone with anticheat: ', 'reason', reason, 'data', data);
  banPlayer(-1, target, [`Anticheat: ${reason}`], 30, -1, data);
};

// ensure config has been loaded before calling
export const clearKickPenalties = async () => {
  const afkKickMessage = Config.getConfigValue<{ afkKickMessage: string }>('anticheat')?.afkKickMessage ?? '';
  await SQL.query(`DELETE FROM penalties WHERE penalty = 'kick' AND reason = '${afkKickMessage}'`); // using as param somheow didnt work but i couldnt be bothered
};
