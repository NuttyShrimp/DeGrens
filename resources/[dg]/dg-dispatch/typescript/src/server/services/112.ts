import { Notifications, Police, Util, Hospital, Events, Chat, Jobs, Inventory } from '@dgx/server';
import { mainLogger } from 'sv_logger';

const recentPlys = new Set<number>();

export const registerAlertCommands = () => {
  [
    {
      name: '112a',
      description: 'Maak een ambulance melding',
      targetJob: 'ambulance',
    },
    {
      name: '112p',
      description: 'Maak een politie melding',
      targetJob: 'police',
    },
  ].forEach(cmd => {
    Chat.registerCommand(
      cmd.name,
      cmd.description,
      [{ name: 'Melding', description: 'Melding die je wil maken' }],
      'user',
      async (plyId, _, args) => {
        if (!args[0]) {
          Notifications.add(plyId, 'Je moet een bericht meegeven', 'error');
          return;
        }

        if (Police.isCuffed(plyId)) {
          Notifications.add(plyId, 'Je kan dit momenteel niet', 'error');
          return;
        }

        const hasPhone = await Inventory.doesPlayerHaveItems(plyId, 'phone');
        if (!hasPhone) {
          Notifications.add(plyId, 'Je hebt geen telefoon', 'error');
          return;
        }

        const onlineForJob = Jobs.getPlayersForJob(cmd.targetJob);
        if (onlineForJob.length === 0) {
          Notifications.add(plyId, 'Er is niemand in dienst om op je melding te antwoorden', 'error');
          return;
        }

        if (recentPlys.has(plyId)) {
          Notifications.add(plyId, 'Je hebt net een melding gemaakt', 'error');
          return;
        }

        // 30 sec timeout on making 112s
        recentPlys.add(plyId);
        setTimeout(() => {
          recentPlys.delete(plyId);
        }, 30 * 1000);

        const cid = Util.getCID(plyId);
        const plyName = await Util.getCharName(cid);
        const plyCoords = Util.getPlyCoords(plyId);

        const message = args.join(' ');
        const callData = {
          title: 'Inkomende 112 Melding',
          description: message,
          entries: { 'id-card': `${plyName} | ${plyId}` },
          coords: plyCoords,
          blip: {
            sprite: 280,
            color: 0,
          },
        };

        switch (cmd.targetJob) {
          case 'police':
            Police.createDispatchCall(callData);
            break;
          case 'ambulance':
            Hospital.createDispatchCall(callData);
            break;
        }

        const chatMsg = `Inkomende 112 melding - ${plyName} (${plyId}):<br>${message}`;
        onlineForJob.forEach(id => {
          Chat.sendMessage(id, {
            prefix: 'Dispatch: ',
            type: 'normal',
            message: chatMsg,
          });
        });

        Events.emitNet('dispatch:doCallAnim', plyId);

        const logMsg = `${Util.getName(plyId)}(${plyId}) made a ${cmd.name}`;
        Util.Log('dispatch:112', { message }, logMsg, plyId);
        mainLogger.silly(`${logMsg} | Message: ${message}`);
      }
    );
  });

  Chat.registerCommand(
    '112r',
    'Reageer op een 112 melding',
    [
      { name: 'id', description: 'ID van persoon' },
      { name: 'Melding', description: 'Bericht dat je wil terugsturen' },
    ],
    'user',
    async (plyId, _, args) => {
      const job = Jobs.getCurrentJob(plyId);
      if (!job || !['police', 'ambulance'].includes(job)) {
        Chat.sendMessage(plyId, {
          type: 'system',
          message: `Dit is enkel voor overheidsdiensten`,
          prefix: '',
        });
        return;
      }

      if (Police.isCuffed(plyId) || Hospital.isDown(plyId)) {
        Notifications.add(plyId, 'Je kan dit momenteel niet', 'error');
        return;
      }

      const target = Number(args[0]);
      if (!args || isNaN(target)) {
        Notifications.add(plyId, 'Je moet een geldig ID meegeven', 'error');
        return;
      }

      if (!args[1]) {
        Notifications.add(plyId, 'Je moet een bericht meegeven', 'error');
        return;
      }
      const message = args.slice(1).join(' ');

      const cid = Util.getCID(plyId);
      const charName = await Util.getCharName(cid);

      Chat.sendMessage(target, {
        type: 'normal',
        prefix: 'EMS: ',
        message: `112 Antwoord - ${charName} (${plyId}):<br>${message}`,
      });

      const targetCid = Util.getCID(target);
      const targetCharName = await Util.getCharName(targetCid);

      const playersForJob = Jobs.getPlayersForJob(job) ?? [];
      playersForJob.forEach(ply => {
        Chat.sendMessage(ply, {
          type: 'normal',
          prefix: `Dispatch: `,
          message: `112 Antwoord - ${charName} (${plyId}) -> ${targetCharName} (${target}):<br>${message}`,
        });
      });

      const logMsg = `${Util.getName(plyId)}(${plyId}) responded to a 112`;
      Util.Log('dispatch:112r', { message, targetCid }, logMsg, plyId);
      mainLogger.silly(`${logMsg} | Message: ${message}`);
    }
  );
};
