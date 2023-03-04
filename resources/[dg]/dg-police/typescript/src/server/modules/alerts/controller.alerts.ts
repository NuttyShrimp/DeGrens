import { Chat, Notifications, Police, Jobs, Util, Events, Inventory } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { doEmergencyButton } from './service.alerts';

Inventory.registerUseable('emergency_button', src => {
  if (Jobs.getCurrentJob(src) !== 'police') {
    Notifications.add(src, 'Dit is enkel voor agenten', 'error');
    return;
  }
  doEmergencyButton(src);
});

Chat.registerCommand(
  '112p',
  'Maak een politie melding',
  [{ name: 'Melding', description: 'Melding die je wil maken' }],
  'user',
  async (src, _, args) => {
    if (!args[0]) {
      Notifications.add(src, 'Je moet een bericht meegeven', 'error');
      return;
    }

    if (Police.isCuffed(src)) {
      Notifications.add(src, 'Je kan dit momenteel niet', 'error');
      return;
    }

    const onlinePolice = Jobs.getPlayersForJob('police');
    if (onlinePolice.length === 0) {
      Notifications.add(src, 'Er is geen politie aanwezig', 'error');
      return;
    }

    const cid = Util.getCID(src);
    const plyName = await Util.getCharName(cid);
    const plyCoords = Util.getPlyCoords(src);

    const message = args.join(' ');
    Police.createDispatchCall({
      title: 'Inkomende 112 Melding',
      description: message,
      tag: '10-43',
      entries: { 'id-card': `${plyName} | ${src}` },
      coords: plyCoords,
      blip: {
        sprite: 280,
        color: 0,
      },
    });

    onlinePolice.forEach(plyId => {
      Chat.sendMessage(plyId, {
        prefix: 'Dispatch: ',
        type: 'normal',
        message: `Inkomende 112 melding - ${plyName} (${src}):<br>${message}`,
      });
    });

    Events.emitNet('police:doCallAnim', src);

    Util.Log('police:112', { message }, `${Util.getName(src)} made a 112p`, src);
    mainLogger.silly(`Player ${src} has made a 112p. Message: ${message}`);
  }
);

Events.onNet('police:alerts:emergency', (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  doEmergencyButton(src);
});
