import { Police, Util } from '@dgx/server';
import { SPEED_LIMIT } from './constants.speedzones';
import { calculateStressIncrease } from './helpers.speedzones';
import { getPlateFlags, isPlateFlagged } from 'services/plateflags';

export const handlePlayerEnteredSpeedZone = (plyId: number, netId: number, speed: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const speedOverLimit = speed - SPEED_LIMIT;
  if (speedOverLimit > 0) {
    const stressIncrease = calculateStressIncrease(speedOverLimit);
    Util.changePlayerStress(plyId, stressIncrease);
  }

  const plate = Entity(vehicle).state.plate;
  if (isPlateFlagged(plate)) {
    const flags = getPlateFlags(plate);
    Police.createDispatchCall({
      tag: '10-37',
      title: 'Gemarkeerd voertuig gespot',
      description: `Redenen: ${flags.map(flag => `${flag.reason}`).join(' | ')}`,
      blip: {
        sprite: 272,
        color: 1,
      },
      entries: {
        'input-text': plate,
      },
      coords: Util.getEntityCoords(vehicle),
      vehicle,
    });
  }
};
