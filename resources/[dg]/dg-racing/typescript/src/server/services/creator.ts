import { Events, Notifications, SQL, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';

import { registerTrack } from './tracks';

const pendingTracks = new Map<number, Racing.Creator.PendingRace>();
let trackId = 1;

export const createPendingTrack = (
  src: number,
  race: Omit<Racing.Creator.PendingRace, 'creator'>,
  checkpoints?: Racing.Checkpoint[]
) => {
  const id = trackId++;
  pendingTracks.set(id, { ...race, creator: Util.getCID(src) });
  Events.emitNet('racing:creator:start', src, id, checkpoints);
};

export const saveTrack = async (src: number, creatorId: number, checkpoints: Racing.Checkpoint[]) => {
  const track = pendingTracks.get(creatorId);
  if (!track) {
    Notifications.add(src, 'Geen race gevonden om op te slaan!', 'error');
    Util.Log(
      'racing:creator:save:failed',
      {
        checkpoints,
      },
      `Failed to save a new race`,
      src
    );
    return;
  }

  let id: number;

  if (track.id) {
    id = track.id;
    await SQL.query('DELETE FROM race_checkpoints WHERE trackId = ?', [id]);
  } else {
    const result = await SQL.query('INSERT INTO race_tracks (creator, name, type) VALUES (?,?,?) RETURNING id', [
      track.creator,
      track.name,
      track.type,
    ]);
    id = result && result?.[0]?.id;
    if (!id) {
      mainLogger.error('Failed to create race track', { id });
      Util.Log(
        'racing:creator:failed',
        {
          checkpoints,
          ...track,
        },
        `Failed to save a new race track in the db`
      );
      return;
    }
  }
  for (const c of checkpoints) {
    await SQL.query('INSERT INTO race_checkpoints (trackId, center, spread) VALUES (?,?,?)', [
      id,
      JSON.stringify(c.center),
      c.spread,
    ]);
  }
  registerTrack({ ...track, id, checkpoints });
  Util.Log(
    'racing:track:new',
    {
      id,
      name: track.name,
      type: track.type,
    },
    `${Util.getIdentifier(src)} has created a new race ${track.type} track`,
    src
  );
};
