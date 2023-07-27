import { Business, Config, Financials, Jobs, Notifications, Phone, Police, SQL, UI, Util } from '@dgx/server';
import {
  checkVehicleStrikes,
  doVehicleForfeiture,
  getImpoundedVehicle,
  getImpoundedVehicles,
  getPlayerVehicleInfo,
  getVehicleStrikeAmount,
  putVehicleInImpound,
  removeVehicleFromImpound,
  setVehicleState,
  updateVehicleStock,
} from 'db/repository';
import { deleteVehicle, getVinForVeh, spawnOwnedVehicle } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { getCidFromVin } from 'modules/identification/service.id';
import { getConfigByModel } from 'modules/info/service.info';
import { keyManager } from 'modules/keys/classes/keymanager';
import { isPlayerAssigned, finishJob, overwriteTowJob, sendTowJob } from 'modules/mechanic/services/towing.mechanic';

let config: Depot.Config;
const pendingImpounds: Map<string, Depot.Reason> = new Map();

export const loadImpoundConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getConfigValue<Depot.Config>('vehicles.impound');
  checkVehicleStrikes(config.strikes.strikeFallOff);
};

export const getZones = (): Depot.Locations | null => {
  return config ? config.locations : null;
};

// Region Send to impound
export const openReasonSelectionMenu = (src: number, vehNetId: number) => {
  const isPolice = Jobs.getCurrentJob(src) === 'police';
  const menu = config.reasons
    .filter(r => r.allowBurger || isPolice)
    .map<ContextMenu.Entry>(r => ({
      title: r.title,
      data: {
        title: r.title,
        netId: vehNetId,
      },
      description: r.description,
      callbackURL: 'vehicles:depot:action',
    }));
  UI.openContextMenu(src, menu);
};

export const impoundVehicle = async (src: number, reason: Depot.Reason, veh: number) => {
  // delete vehicle and move vehicle state to depot
  const vin = getVinForVeh(veh);
  if (vin && vinManager.isVinFromPlayerVeh(vin)) {
    const ownerCid = await getCidFromVin(vin);
    if (ownerCid === 1000) {
      Notifications.add(src, 'Dit overheidsvoertuig kan niet in beslag worden genomen', 'error');
      return;
    }
    await putVehicleInImpound(vin, reason);
    const strikes = await getVehicleStrikeAmount(vin);
    if (strikes > config.strikes.permImpound) {
      permaImpoundVehicle(vin);
    }
    if (Jobs.getCurrentJob(src) !== 'police' && !isPlayerAssigned(src, vin)) {
      Notifications.add(src, 'Dit kan jij niet!', 'error');
      return;
    }
    finishJob(vin);
  }

  deleteVehicle(veh);
  Notifications.add(src, `Voertuig in beslaggenomen`);
};

export const requestImpound = async (src: number, title: string, veh: number, inSpot: boolean) => {
  const reason = config.reasons.find(r => r.title === title);
  if (!reason) return;
  const vin = getVinForVeh(veh);
  if (title === 'Scuff') {
    // Move to garage instead
    const link = await global.exports['dg-imager'].requestClientImgurScreenshot(src);
    Util.Log(
      'vehicles:impound:scuff',
      {
        image: link,
        vin,
      },
      `${Util.getName(src)} has scuff impounded a vehicle`,
      src
    );
    deleteVehicle(veh);
    if (vin && vinManager.isVinFromPlayerVeh(vin)) {
      setVehicleState(vin, 'parked');
    }
    return;
  }

  if (inSpot) {
    impoundVehicle(src, reason, veh);
    return;
  }

  if (vin) {
    keyManager.removeKeys(vin);
  }

  // if not create request for mechanic to tow vehicle to depot spot
  if (!vin || !vinManager.isVinFromPlayerVeh(vin)) {
    // Despawn after 1 minute
    Notifications.add(src, `De lokale takeldienst komt dit voertuig halen!`);
    setTimeout(() => {
      if (DoesEntityExist(veh)) {
        deleteVehicle(veh);
      }
    }, 60000);
    return;
  }

  if (!Business.isAnyPlayerSignedInForType('mechanic')) {
    Notifications.add(src, 'Er is momenteel geen takeldienst beschikbaar...');
    return;
  }

  // Create a tow request
  if (pendingImpounds.has(vin)) {
    Notifications.add(src, 'Vorig aanvraag is overschreden...');
    pendingImpounds.set(vin, reason);
    overwriteTowJob(src, vin);
    return;
  }

  pendingImpounds.set(vin, reason);
  sendTowJob(src, vin);
};

export const finishImpound = (src: number, veh: number) => {
  const vin = getVinForVeh(veh);
  const reason = pendingImpounds.get(vin ?? '');
  if (!vin || !vinManager.isVinFromPlayerVeh(vin) || !reason) {
    Notifications.add(src, 'Dit voertuig kan niet in beslaggenomen worden');
    return;
  }
  if (Jobs.getCurrentJob(src) !== 'police' && !isPlayerAssigned(src, vin)) {
    Notifications.add(src, 'Dit kan jij niet!', 'error');
    return;
  }
  impoundVehicle(src, reason, veh);
};
// endregion

// region Retrieval from impound
export const openImpoundList = async (src: number) => {
  const cid = Util.getCID(src);
  if (!cid) return;
  const impoundedVehicles = await getImpoundedVehicles(cid);
  if (impoundedVehicles.length === 0) {
    Notifications.add(src, 'Je hebt geen voertuigen in het depot');
    return;
  }
  const menu = await Promise.all(
    impoundedVehicles.map<Promise<ContextMenu.Entry | null>>(async v => {
      if (v.until === -1) return null;
      const vehicleInfo = await getPlayerVehicleInfo(v.vin);
      if (!vehicleInfo) return null;
      const vehicleStrikes = await getVehicleStrikeAmount(v.vin);
      const vehicleConfig = getConfigByModel(vehicleInfo.model);

      const daysUntilBailFinish = Math.max(Math.round((v.until - Date.now() / 1000) / 86400), 0);
      // has sit out 1/3 of the time
      const canBailOut = (v.until - v.created_at) / 3 + v.created_at <= Date.now() / 1000;
      const bailPrice =
        daysUntilBailFinish *
          config.price.earlyReleaseBase *
          config.price.multipliers[vehicleConfig?.class ?? 'D'] *
          (1 + vehicleStrikes / 100) +
        v.price;

      return {
        title: vehicleConfig?.name ?? 'Unknown vehicle',
        description: `${daysUntilBailFinish <= 0 ? '0 dagen' : `${daysUntilBailFinish} dagen`} | ${`€${bailPrice}`}`,
        submenu: canBailOut
          ? [
              {
                title: 'Betaal',
                callbackURL: 'vehicles/impound/getVehicle',
                data: {
                  vin: v.vin,
                },
              },
            ]
          : [
              {
                title: 'Je kan dit voertuig nog niet ophalen',
                disabled: true,
              },
            ],
      };
    })
  );

  UI.openContextMenu(src, menu.filter(e => e !== null) as ContextMenu.Entry[]);
};

export const unbailVehicle = async (src: number, vin: string) => {
  const cid = Util.getCID(src);
  if (!cid) return;
  const impoundedVehicle = await getImpoundedVehicle(cid, vin);
  if (!impoundedVehicle) return;
  const vehicleInfo = await getPlayerVehicleInfo(impoundedVehicle.vin);
  if (!vehicleInfo) return null;
  const vehicleStrikes = await getVehicleStrikeAmount(vin);
  const vehicleConfig = getConfigByModel(vehicleInfo.model);

  const unixTime = Date.now();
  const canBailOut = unixTime - impoundedVehicle.created_at > impoundedVehicle.until - unixTime;
  if (!canBailOut) return;

  const daysUntilBailFinish = Math.round((impoundedVehicle.until - unixTime / 1000) / 86400);
  const bailPrice =
    daysUntilBailFinish *
      config.price.earlyReleaseBase *
      config.price.multipliers[vehicleConfig?.class ?? 'D'] *
      (1 + vehicleStrikes / 100) +
    impoundedVehicle.price;

  // purchase will fail if price is 0
  if (bailPrice > 0) {
    const defaultAccountId = Financials.getDefaultAccountId(cid);
    if (!defaultAccountId) return;
    const success = await Financials.purchase(
      defaultAccountId,
      cid,
      bailPrice,
      `${vehicleConfig?.name} ${vehicleConfig?.brand} (${vehicleInfo.plate}) uit beslag gehaald`
    );
    if (!success) {
      Notifications.add(src, 'Betaling van prijs is gefaald');
      return;
    }
  }

  removeVehicleFromImpound(vin);

  await spawnOwnedVehicle(src, vehicleInfo, config.locations.retrieveSpot);
  Notifications.add(src, 'Voertuig uit opslag gehaald!', 'success');
};
// endregion

// region Perma Impound and Sale
const permaImpoundVehicle = async (vin: string) => {
  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) return;
  await doVehicleForfeiture(vin);
  Phone.addOfflineMail(vehicleInfo.cid, {
    subject: 'Permanente inbeslagname voertuig',
    sender: 'Hof van Cassatie',
    message: `Het hof van Cassatie heeft vandaag beslist dat uw voertuig met nummerplaat <strong>${vehicleInfo.plate}</strong> en voertuig identificatie nummer <strong>${vehicleInfo.vin}</strong> van op heden permanent in beslaggenome is wegens het meermaals gebruiken van het voertuig voor onwettige redenen`,
  });
};

export const checkPermaImpoundVehicleStock = async () => {
  const stock = await SQL.query<{ model: string }[]>(
    'SELECT * FROM vehicle_resale WHERE created_at < (NOW() - INTERVAL 2 WEEK)'
  );
  if (!stock) return;
  stock.forEach(v => {
    updateVehicleStock(v.model, 1);
  });
};
// endregion
// endregion
