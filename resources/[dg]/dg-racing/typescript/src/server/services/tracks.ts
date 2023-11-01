import { Core, SQL, Util } from '@dgx/server';
import { isTrackInUse } from './race';

const tracks = new Map<number, Racing.Track>();

export const loadTracks = async () => {
  const db_tracks = await SQL.query<{ id: number; creator: number; type: Racing.RaceType; name: string }[]>(
    'SELECT * FROM race_tracks'
  );
  db_tracks.forEach(async track => {
    const checkpoints = await SQL.query<(Omit<Racing.Checkpoint, 'center'> & { center: string })[]>(
      'SELECT * FROM race_checkpoints WHERE trackId = ?',
      [track.id]
    );
    tracks.set(track.id, {
      ...track,
      checkpoints: checkpoints.map(c => ({ ...c, center: JSON.parse(c.center) })),
    });
  });
};

export const registerTrack = (track: Racing.Track) => {
  tracks.set(track.id, track);
};

export const getAllTracksForClients = () => {
  const clientTracks = [];
  for (const [_, track] of tracks) {
    clientTracks.push({
      ...track,
      checkpoint: track.checkpoints.length,
    });
  }
  return clientTracks;
};

export const getTrackById = (id: number) => {
  return tracks.get(id);
};

export const deleteTrack = async (id: number) => {
  if (isTrackInUse(id)) return false;
  SQL.query('DELETE FROM race_tracks WHERE id = ?', [id]);
  SQL.query('DELETE FROM race_checkpoints WHERE trackId = ?', [id]);
  tracks.delete(id);
  return true;
};

export const getLeaderboardForTrack = async (trackId: number) => {
  const leaderboard = await SQL.query<{ cid: number; carName: string; time: number }[]>(
    'SELECT cid, carName, time FROM race_leaderboard WHERE trackId = ? ORDER BY time ASC LIMIT 10',
    [trackId]
  );
  if (leaderboard.length < 1) return [];
  const charModule = Core.getModule('characters');
  return Promise.all(
    leaderboard.map(async entry => {
      const ply = await charModule.getOfflinePlayer(entry.cid);
      return {
        time: entry.time,
        model: entry.carName,
        name: ply ? `${ply.metadata.racingAlias}` : `Unknown (${entry.cid})`,
      };
    })
  );
};
