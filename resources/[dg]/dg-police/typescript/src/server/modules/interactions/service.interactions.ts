import { Events } from '@dgx/server';
import { Util } from '@dgx/shared';
import { isPlayerInCarryDuo, stopCarryDuo } from './modules/carry';
import { getPlayerEscorting, isPlayerBeingEscorted, isPlayerEscorting, stopEscorting } from './modules/escort';

// This means in carry duo, escorting or getting escorted
export const isPlayerInActiveInteraction = (plyId: number) => {
  return isPlayerInCarryDuo(plyId) || isPlayerEscorting(plyId) || isPlayerBeingEscorted(plyId);
};

// Send out stop carry/escort events
// Then await till both of them are registered as done
export const forceStopInteractions = async (plyId: number) => {
  // First we check carry
  if (isPlayerInCarryDuo(plyId)) {
    stopCarryDuo(plyId);
    await Util.Delay(100); // Needed because carry tps player which can cause issues
  }

  // Then we check escorting
  const escortingPlayer = getPlayerEscorting(plyId);
  if (escortingPlayer) {
    stopEscorting(escortingPlayer);
    Events.emitNet('police:interactions:overrideStoppedEscort', escortingPlayer);
    const plyPed = GetPlayerPed(String(plyId));
    await Util.awaitCondition(() => GetEntityAttachedTo(plyPed) === 0);
  }
};
