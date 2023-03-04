import { Chat, Events, Hospital, Jobs, Notifications, Police, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';

Chat.registerCommand(
  '112a',
  'Maak een ambulance melding',
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

    const onlineAmbu = Jobs.getPlayersForJob('ambulance');
    if (onlineAmbu.length === 0) {
      Notifications.add(src, 'Er is geen ambulance aanwezig', 'error');
      return;
    }

    const cid = Util.getCID(src);
    const plyName = await Util.getCharName(cid);
    const plyCoords = Util.getPlyCoords(src);

    const message = args.join(' ');
    Hospital.createDispatchCall({
      title: 'Inkomende 112 Melding',
      description: message,
      entries: { 'id-card': `${plyName} | ${src}` },
      coords: plyCoords,
      blip: {
        sprite: 280,
        color: 0,
      },
    });

    onlineAmbu.forEach(plyId => {
      Chat.sendMessage(plyId, {
        prefix: 'Dispatch: ',
        type: 'normal',
        message: `Inkomende 112 melding - ${plyName} (${src}):<br>${message}`,
      });
    });

    Events.emitNet('police:doCallAnim', src);

    Util.Log('hospital:112', { message }, `${Util.getName(src)} made a 112a`, src);
    mainLogger.silly(`Player ${src} has made a 112a. Message: ${message}`);
  }
);

Chat.registerCommand(
  '112r',
  'Reageer op een 112 melding',
  [
    { name: 'id', description: 'ID van persoon' },
    { name: 'Melding', description: 'Bericht dat je wil terugsturen' },
  ],
  'user',
  async (src, _, args) => {
    const job = Jobs.getCurrentJob(src);
    if (!job || !['police', 'ambulance'].includes(job)) {
      Chat.sendMessage(src, {
        type: 'system',
        message: `Dit is enkel voor overheidsdiensten`,
        prefix: '',
      });
      return;
    }

    if (Police.isCuffed(src) || Hospital.isDown(src)) {
      Notifications.add(src, 'Je kan dit momenteel niet', 'error');
      return;
    }

    const target = Number(args[0]);
    if (!args || isNaN(target)) {
      Notifications.add(src, 'Je moet een geldig ID meegeven', 'error');
      return;
    }

    if (!args[1]) {
      Notifications.add(src, 'Je moet een bericht meegeven', 'error');
      return;
    }
    const message = args.slice(1).join(' ');

    Chat.sendMessage(target, {
      type: 'normal',
      prefix: 'EMS: ',
      message,
    });

    Util.Log('ems:112r', { message }, `${Util.getName(src)} made a 112r`, src);
    mainLogger.silly(`Player ${src} responded to a 112. Message: ${message}`);
  }
);
