import { SQL, UI } from '@dgx/server';
import { charModule } from 'helpers/core';
import { dutyTimeLogger } from './logger.dutytime';

type DutyTimesEntry = { action: 'start' | 'stop'; time: number };

export const initializeDutyTimesModule = async () => {
  // clear entries older than 30 days
  const time = Math.floor(Date.now() / 1000);
  const result = await SQL.query('DELETE FROM duty_times WHERE time < ?', [time - 86400 * 30]);
  dutyTimeLogger.info(`Removed ${result?.affectedRows ?? 0} old duty time entries`);
};

export const addDutyTimeEntry = async (cid: number, context: string, action: 'start' | 'stop') => {
  SQL.insertValues('duty_times', [
    {
      cid,
      context,
      action,
      time: Math.floor(Date.now() / 1000),
    },
  ]);
  dutyTimeLogger.debug(`Added duty time entry | CID: ${cid} | Context: ${context} | Action: ${action}`);
};

export const showDutyTimeList = async (plyId: number, context: string) => {
  const result = await SQL.query<({ cid: number } & DutyTimesEntry)[]>(
    'SELECT cid, action, time FROM duty_times WHERE context = ? ORDER BY time ASC',
    [context]
  );
  if (!result) return;

  const groupedResult = result.reduce<Record<string, DutyTimesEntry[]>>((cids, cur) => {
    if (!cids[cur.cid]) cids[cur.cid] = [];
    cids[cur.cid].push(cur);
    return cids;
  }, {});

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Duty Time List',
      description: 'Tijd in dienst de laatste 30 dagen',
      icon: 'clock',
      disabled: true,
    },
  ];

  for (const cid of Object.keys(groupedResult)) {
    const charInfo = (await charModule.getOfflinePlayer(+cid))?.charinfo;
    const charName = charInfo ? `${charInfo.firstname} ${charInfo.lastname}` : `CID: ${cid}`;
    const dutyTime = calculateDutyTime(groupedResult[cid]);
    if (dutyTime < 60) continue; // would show 0 min if they were only signed in for a few seconds to skip this lil bitch

    menuEntries.push({
      title: `${charName}: ${formatTime(dutyTime)}`,
    });
  }

  UI.openContextMenu(plyId, menuEntries);
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const hours = Math.floor(minutes / 60);
  return `${Math.floor(hours / 24)}d ${hours % 24}h ${minutes % 60}m`;
};

export const getDutyTime = async (cid: number, context: string) => {
  const result = await SQL.query<DutyTimesEntry[]>(
    'SELECT action, time FROM duty_times WHERE cid = ? AND context = ? ORDER BY time ASC',
    [cid, context]
  );
  if (!result) return;

  const dutyTime = calculateDutyTime(result);
  if (dutyTime < 60) return; // would show 0 min if they were only signed in for a few seconds to skip this lil bitch

  return formatTime(dutyTime);
};

/**
 * @returns Seconds
 */
const calculateDutyTime = (entries: DutyTimesEntry[]) => {
  let totalTime = 0;
  let startTime: number | null = null;
  for (const entry of entries) {
    if (entry.action === 'start') {
      // by not nullchecking startTime, we make sure to last last start entry if multiple after one another occur (server restart happened or whatever)
      startTime = entry.time;
      continue;
    } else if (startTime !== null) {
      totalTime += entry.time - startTime;
      startTime = null;
      continue;
    }
  }

  return totalTime;
};
