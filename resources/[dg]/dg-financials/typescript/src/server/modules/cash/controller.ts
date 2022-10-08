import { RPC, Chat, Notifications } from '@dgx/server';

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
  (src, args) => {
    if (!args[0] || !args[1]) {
      Notifications.add(src, `Niet alle velden zijn ingevuld!`, 'error');
      return;
    }

    try {
      cashLogger.silly(`givecash: from ${src} to ${args[0]} | amount: ${args[1]}`);
      const target = parseInt(args[0]);
      const amount = parseInt(args[1]);
      if (isNaN(amount)) {
        throw new Error(`Het bedrag moet een getal zijn!`);
      }
      if (amount < 1) {
        throw new Error(`Het bedrag moet groter zijn dan 0!`);
      }
      if (src == target) {
        throw new Error(`Je kan je eigen geen cash geven!`);
      }
      const plyPed = GetPlayerPed(String(src));
      const plyPos = DGX.Util.ArrayToVector3(GetEntityCoords(plyPed));
      const trgPed = GetPlayerPed(String(target));
      if (!trgPed) {
        throw new Error(`Kon actie niet uitvoeren!`);
      }
      const trgPos = DGX.Util.ArrayToVector3(GetEntityCoords(trgPed));
      if (plyPos.distance(trgPos) > 4) {
        throw new Error(`Kon actie niet uitvoeren!`);
      }
      const cash = getCash(src);
      if (cash < amount) {
        throw new Error(`Je hebt niet genoeg cash!`);
      }
      removeCash(src, amount, `Gave cash aan ${GetPlayerName(String(target))}(${target}) via cmd`);
      addCash(target, amount, `Received cash van ${GetPlayerName(String(src))}(${src}) via cmd`);
      emitNet('animations:client:EmoteCommandStart', src, ['id']);
    } catch (e) {
      cashLogger.debug(e);
    }
  }
);

Chat.registerCommand('cash', 'Flash cash', [], 'user', src => {
  const plyCash = getCash(src);
  emitNet('hud:client:ShowAccounts', src, plyCash);
});
