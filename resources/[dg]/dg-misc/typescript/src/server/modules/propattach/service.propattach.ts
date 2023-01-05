import { Events, Util } from '@dgx/server';
import { propattachLogger } from './logger.propattach';

const propsByPlayer: Map<number, Set<number>> = new Map();

const getPlayerProps = (plyId: number) => {
  const props = propsByPlayer.get(plyId);
  if (!props) {
    Util.Log(
      'propattach:unknownPlayer',
      {},
      `Tried to do propattach for ${Util.getName(plyId)} but was not known to system`,
      plyId,
      true
    );
    propattachLogger.error(`Tried to do propattach for ${plyId} but was not known to system`);
    return;
  }
  return props;
};

export const handlePlayerJoin = (plyId: number) => {
  propsByPlayer.set(plyId, new Set());
};

export const handlePlayerLeave = (plyId: number) => {
  clearProps(plyId);
  propsByPlayer.delete(plyId);
};

export const registerPropToPlayer = (plyId: number, netId: number) => {
  const props = getPlayerProps(plyId);
  if (!props) return;
  props.add(netId);
  propattachLogger.debug(`Added prop ${netId} to ${Util.getName(plyId)}`);
};

export const removePropFromPlayer = (plyId: number, netId: number) => {
  const entity = NetworkGetEntityFromNetworkId(netId);
  if (entity && DoesEntityExist(entity)) {
    DeleteEntity(entity);
  }
  const props = propsByPlayer.get(plyId);
  if (!props) {
    propattachLogger.warn(
      `Tried to remove prop from ${Util.getName(plyId)} but player did not have any props registered`
    );
    return;
  }
  props.delete(netId);
  propattachLogger.debug(`Removed prop ${netId} from ${Util.getName(plyId)}`);
};

export const handleRoutingBucketChange = (plyId: number, routingBucket: number) => {
  let props = propsByPlayer.get(plyId);
  if (!props) return;
  props.forEach(netId => {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!entity || !DoesEntityExist(entity)) return;
    SetEntityRoutingBucket(entity, routingBucket);
  });
};

export const clearProps = (plyId: number) => {
  let props = propsByPlayer.get(plyId);
  if (!props) return;
  props.forEach(netId => {
    const entity = NetworkGetEntityFromNetworkId(netId);
    if (!entity || !DoesEntityExist(entity)) return;
    DeleteEntity(entity);
  });
  props.clear();
  Events.emitNet('propattach:reset', plyId);
};
