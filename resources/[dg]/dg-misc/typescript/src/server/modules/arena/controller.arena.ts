import { Auth, Chat, Notifications } from '@dgx/server';
import { ArenaType, dispatchInteriorToClients, getPossibleArenaTypes, setCurrentArenaType } from './service.arena';

Auth.onAuth(plyId => {
  dispatchInteriorToClients(plyId);
});

Chat.registerCommand(
  'setArenaInterior',
  'Set Arena Interior',
  [{ name: 'type', description: 'Type', required: false }],
  'support',
  (plyId, _, args) => {
    const newType = args[0] as ArenaType | undefined;
    if (newType === undefined) {
      setCurrentArenaType(null);
      Notifications.add(plyId, 'Arena type gereset');
      return;
    }

    const possibleTypes = getPossibleArenaTypes();
    if (!possibleTypes) return;

    if (possibleTypes.indexOf(newType) === -1) {
      emitNet('dg-ui:SendAppEvent', plyId, 'copy', JSON.stringify(possibleTypes));
      Notifications.add(plyId, `${newType} is geen geldige type. Alle types staat in je clipboard`, 'error');
      return;
    }

    setCurrentArenaType(newType);
    Notifications.add(plyId, `Arena type veranderd naar ${newType}`);
  }
);
