import { SQL } from '@dgx/server';
import dayjs from 'dayjs'

const resetTimeouts: Record<string, NodeJS.Timeout> = {};
const adminPoints: Map<string, number> = new Map();

export const scheduleFallofs = async () => {
  const playerPoints = await SQL.query<Penalty.PenaltyReset[]>(
    'SELECT steamid, points, UNIX_TIMESTAMP(created_at) AS created_at, UNIX_TIMESTAMP(updated_at) AS updated_at FROM admin_points'
  );
  playerPoints.forEach(async pp => {
    const updated_at = dayjs(pp.updated_at);
    if (updated_at.add(pp.points, "d").isBefore(dayjs())) {
      // vervallen, remove entry
      await SQL.query("DELETE FROM admin_points WHERE steamid = ?", [pp.steamid]);
    }
    let shouldTimeout = updated_at.isBefore(dayjs().add(12));
    if (!shouldTimeout) return;
    resetTimeouts[pp.steamid] = setTimeout(() => {
      SQL.query("DELETE FROM admin_points WHERE steamid = ?", [pp.steamid]);
    }, updated_at.diff(dayjs(), "ms"))
  })
};

export const updatePointsReset = (steamid: string, addPoints: number) => {
  if (addPoints < 0) return;
  if (resetTimeouts[steamid]) {
    // no way this timeout is happening in the same server restart
    clearTimeout(resetTimeouts[steamid]);
  }
  SQL.query(`
    INSERT INTO admin_points (steamid, points) VALUES (?, ?)
    ON DUPLICATE KEY UPDATE points = VALUES(points), updated_at = CURRENT_TIMESTAMP()
  `, [steamid, addPoints]);
    adminPoints.set(steamid, getPointsForSteamId(steamid) + addPoints)
}

export const loadPoints = async () => {
  const pointData = await SQL.query<{points: number, steamid: string}[]>("SELECT points, steamid FROM admin_points");
  if (!pointData) return;
  pointData.forEach(pd=> adminPoints.set(pd.steamid, pd.points));
}

export const getPointsForSteamId = (steamId: string) => {
  return adminPoints.get(steamId) ?? 0;
}