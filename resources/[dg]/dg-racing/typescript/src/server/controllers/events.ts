import { Admin, Core, Events, Notifications, Phone, RPC, Util, Vehicles } from '@dgx/server';
import { charModule } from 'helpers/core';
import { createPendingTrack, saveTrack } from 'services/creator';
import {
  cancelRace,
  finishRace,
  getAvailableRaces,
  getRaceIdForPly,
  isRaceScheduled,
  joinRace,
  kickRace,
  leaveRace,
  passedCheckpoint,
  rejoinRace,
  scheduleRace,
  startRace,
} from 'services/race';
import { deleteTrack, getAllTracksForClients, getLeaderboardForTrack, getTrackById } from 'services/tracks';
import { mainLogger } from 'sv_logger';

Core.onPlayerLoaded(ply => {
  if (!ply.serverId) return;
  rejoinRace(ply.serverId);
});

Events.onNet('racing:creator:finish', (src: number, id: number, checkpoints: Racing.Checkpoint[]) => {
  saveTrack(src, id, checkpoints);
});

Events.onNet('racing:track:create', (src: number, name: string, type: Racing.RaceType) => {
  createPendingTrack(src, { name, type });
});

Events.onNet('racing:track:preview', (src: number, trackId: number) => {
  const track = getTrackById(trackId);
  if (!track) {
    Notifications.add(src, 'This track does not exist', 'error');
    mainLogger.error(`${Util.getName(src)}(${src}) tried to preview a track that does not exist (${trackId})`);
    return;
  }
  Events.emitNet('racing:track:preview', src, track.checkpoints, track.type === 'lap');
});

Events.onNet('racing:track:edit', (src: number, trackId: number) => {
  const track = getTrackById(trackId);
  if (!track) return;
  createPendingTrack(src, track, track.checkpoints);
});

Events.onNet('racing:track:delete', (src: number, trackId: number) => {
  const track = getTrackById(trackId);
  if (!track) {
    Notifications.add(src, 'This track does not exist', 'error');
    mainLogger.error(`${Util.getName(src)}(${src}) tried to delete a track that does not exist (${trackId})`);
    return;
  }
  const cid = Util.getCID(src);
  if (track.creator != cid) {
    Admin.ACBan(src, "Attempted to delete a track that he didin't create", { trackId });
    return;
  }
  if (!deleteTrack(trackId)) {
    Notifications.add(src, 'This track is currently in use', 'error');
    return;
  }
  Util.Log('racing:track:delete', { track }, `${Util.getIdentifier(src)} deleted the ${track.name} track`, src);
});

Events.onNet(
  'racing:race:schedule',
  (
    src: number,
    trackId: number,
    startTime: string,
    leaderboard: boolean,
    classRestriction?: Vehicles.Class,
    laps?: number
  ) => {
    scheduleRace(src, trackId, startTime, classRestriction, leaderboard, laps);
  }
);

Events.onNet('racing:race:join', (src: number, raceId: number) => {
  if (!isRaceScheduled(raceId)) {
    return;
  }
  joinRace(src, raceId);
});

Events.onNet('racing:settings:changeAlias', (src, alias: string) => {
  const ply = charModule.getPlayer(src);
  if (!ply) {
    mainLogger.error(`Failed to update a racingAlias for ${src}`, { src, alias });
    return;
  }
  ply.updateMetadata('racingAlias', alias);
});

Events.onNet('racing:races:passCheckpoint', (src: number, checkpoint: number) => {
  const raceId = getRaceIdForPly(src);
  if (!raceId) {
    mainLogger.warn(`${Util.getIdentifier(src)} tried to pass a checkpoint but is not participating in a race`);
    return;
  }
  passedCheckpoint(src, raceId, checkpoint);
});

Events.onNet('racing:race:finish', (src: number, raceId: number) => {
  finishRace(src, raceId);
});

Events.onNet('racing:race:start', (src: number, raceId: number) => {
  startRace(src, raceId);
});

Events.onNet('racing:race:cancel', (src: number, raceId: number) => {
  cancelRace(src, raceId);
});

Events.onNet('racing:race:leave', (src: number, raceId: number) => {
  const cid = Util.getCID(src);
  leaveRace(cid, raceId);
});

Events.onNet('racing:race:kick', (src: number, raceId: number, cid: number) => {
  kickRace(src, raceId, cid);
});

RPC.register('racing:races:available', async src => {
  return await Promise.all(
    getAvailableRaces(src).map(async r => {
      const participants = await Promise.all(
        r.participants.map(async cid => {
          const ply = await charModule.getOfflinePlayer(cid);
          return {
            name: ply?.metadata.racingAlias ?? 'Unknown player',
            cid,
          };
        })
      );
      return {
        ...r,
        participants,
      };
    })
  );
});

RPC.register('racing:races:tracks', () => {
  return getAllTracksForClients();
});

RPC.register('racing:track:getLeaderboard', async (src, trackId: number) => {
  return getLeaderboardForTrack(trackId);
});
