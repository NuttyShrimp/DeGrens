import { RPC, Chat, Notifications, Util } from '@dgx/server';

import { addCash, getCash, removeCash } from './service';
import { cashLogger } from './util';

global.exports('getCash', (src: number | string) => getCash(src));
global.exports('removeCash', (src: number | string, amount: number, reason: string) => removeCash(src, amount, reason));
global.exports('addCash', (src: number | string, amount: number, reason: string) => addCash(src, amount, reason));

RPC.register('financials:server:cash:get', src => {
  return getCash(src);
});

Chat.registerCommand(
  'givecash',
  'Geef cash aan een persoon',
  [
    {
      name: 'speler-id',
      description: 'De spelerid van de persoon waaraan je cash wilt geven',
    },
    {
      name: 'bedrag',
      description: 'Het bedrag dat je wilt geven',
    },
  ],
  'user',
  (src, _, args) => {
    if (!args[0] || !args[1]) {
      Notifications.add(src, `Niet alle velden zijn ingevuld!`, 'error');
      return;
    }

    cashLogger.silly(`givecash: from ${src} to ${args[0]} | amount: ${args[1]}`);
    const target = Number(args[0]);
    const amount = Number(args[1]);
    if (isNaN(amount)) {
      Notifications.add(src, `Het bedrag moet een getal zijn!`, 'error');
      return;
    }

    if (amount < 1) {
      Notifications.add(src, `Het bedrag moet hoger dan 0 zijn!`, 'error');
      return;
    }

    if (src == target) {
      Notifications.add(src, `Je kan geen cash aan jezelf geven`, 'error');
      return;
    }

    const plyPos = Util.getPlyCoords(src);
    const targetPos = Util.getPlyCoords(target);
    if (plyPos.distance(targetPos) > 4) {
      Notifications.add(src, `Deze persoon is te ver van je`, 'error');
      return;
    }

    const cash = getCash(src);
    if (cash < amount) {
      Notifications.add(src, `Je hebt niet genoeg cash`, 'error');
      return;
    }

    removeCash(src, amount, `Gave cash aan ${GetPlayerName(String(target))}(${target}) via cmd`);
    addCash(target, amount, `Received cash van ${GetPlayerName(String(src))}(${src}) via cmd`);
    emitNet('animations:client:EmoteCommandStart', src, ['id']);
  }
);

Chat.registerCommand('cash', 'Flash cash', [], 'user', src => {
  const plyCash = getCash(src);
  emitNet('hud:client:ShowAccounts', src, plyCash);
});
