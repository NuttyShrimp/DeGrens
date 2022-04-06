import { addCash, getCash, removeCash, seedCache, seedPlyInCache } from './service';
import { cashLogger } from './util';

global.exports('getCash', getCash);
global.exports('removeCash', removeCash);
global.exports('addCash', addCash);

RegisterCommand(
  'financials:cash:seed',
  () => {
    seedCache();
  },
  true
);

onNet('DGCore:Server:OnPlayerLoaded', () => {
  cashLogger.info('Seeding cash cache...');
  seedPlyInCache(source);
});

DGCore.Functions.CreateCallback('financials:server:cash:get', (src, cb) => {
  cb(getCash(src));
});

DGCore.Commands.Add(
  'givecash',
  'Geef cash aan een persoon',
  [
    {
      help: 'De spelerid van de persoon waaraan je cash wilt geven',
      name: 'speler-id',
    },
    { help: 'Het bedrag dat je wilt geven', name: 'bedrag' },
  ],
  true,
  (src, args) => {
    if (!args[0] || !args[1]) {
      emitNet('DGCore:Notify', src, `Niet alle velden zijn ingevuld!`, 'error');
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
      emitNet('DGCore:Notify', src, e.toString(), 'error');
      cashLogger.debug(e);
    }
  },
  'user'
);
