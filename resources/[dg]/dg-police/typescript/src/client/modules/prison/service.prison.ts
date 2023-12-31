import { BlipManager, PolyTarget, PolyZone, Sounds, Util } from '@dgx/client';

let prisonConfig: Police.Prison.Config;

let inPrison = false;
export const isInPrison = () => inPrison;

export const loadPrisonConfig = (config: Police.Prison.Config) => {
  config.itemRetrievalPlaces.forEach((zone, id) => {
    PolyTarget.addCircleZone('prison_item_retrieval', zone, 1, { useZ: true, data: { id } });
  });
  PolyZone.addPolyZone('prison', config.prisonZone, { data: {} });
  PolyTarget.addBoxZone(
    'check_prisoners',
    config.checkPrisoners.center,
    config.checkPrisoners.width,
    config.checkPrisoners.length,
    {
      heading: config.checkPrisoners.heading,
      minZ: config.checkPrisoners.minZ,
      maxZ: config.checkPrisoners.maxZ,
      data: {},
    }
  );
  prisonConfig = config;
};

export const enterPrison = async () => {
  DoScreenFadeOut(500);
  await Util.Delay(500);

  const position = prisonConfig.insideJailSpawn;
  const ped = PlayerPedId();
  SetEntityCoords(ped, position.x, position.y, position.z - 0.9, false, false, false, false);
  SetEntityHeading(ped, position.w);
  setTimeout(() => {
    DoScreenFadeIn(500);
  }, 2000);

  setInPrison();
};

export const restoreSentence = async () => {
  await Util.awaitCondition(() => prisonConfig != undefined, false);
  setInPrison();
};

const setInPrison = () => {
  inPrison = true;
  Sounds.playLocalSound('jail', 0.3);
  PolyTarget.addCircleZone('prison_phone', prisonConfig.jailControl, 1, { useZ: true, data: {}, routingBucket: 0 });
  PolyTarget.addCircleZone('prison_shop', prisonConfig.shop, 2, { useZ: true, data: {}, routingBucket: 0 });
  BlipManager.addBlip({
    category: 'prison',
    id: 'control',
    coords: prisonConfig.jailControl,
    text: 'Gevangenis Telefoon',
    sprite: 1,
    color: 2,
  });
};

export const cleanupJail = () => {
  inPrison = false;
  PolyTarget.removeZone('prison_phone');
  PolyTarget.removeZone('prison_shop');
  BlipManager.removeCategory('prison');
};

export const leavePrison = async () => {
  DoScreenFadeOut(500);
  await Util.Delay(500);

  const position = prisonConfig.outsideJailSpawn;
  const ped = PlayerPedId();
  SetEntityCoords(ped, position.x, position.y, position.z - 0.9, false, false, false, false);
  SetEntityHeading(ped, position.w);
  setTimeout(() => {
    DoScreenFadeIn(500);
  }, 2000);

  cleanupJail();
};
