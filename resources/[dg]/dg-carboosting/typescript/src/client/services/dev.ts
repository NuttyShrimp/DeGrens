import { Events, Keys, Notifications, UI } from '@dgx/client';

let location: Carboosting.LocationConfig | null = null;

const getCoords = (): Vec4 => {
  const ped = PlayerPedId();
  const [x, y, z] = GetEntityCoords(ped, false);
  return {
    x: +x.toFixed(4),
    y: +y.toFixed(4),
    z: +z.toFixed(4),
    w: +GetEntityHeading(ped).toFixed(4),
  };
};

const draw = (coords: Vec4, color: 'primary' | 'secondary') => {
  DrawMarker(
    1,
    coords.x,
    coords.y,
    coords.z - 1,
    0,
    0,
    0,
    0,
    0,
    coords.w + 180,
    1,
    1,
    1,
    color === 'primary' ? 255 : 0,
    color === 'primary' ? 0 : 255,
    0,
    100,
    false,
    false,
    2,
    false,
    //@ts-expect-error
    null,
    null,
    false
  );
};

Events.onNet('carboosting:dev:addLocation', (vehicleClasses: Vehicles.Class[]) => {
  if (location) {
    Notifications.add('Je bent nog een locatie aan het plaatsen', 'error');
    return;
  }

  location = {
    vehicle: getCoords(),
    npcs: [],
    classes: vehicleClasses,
  };

  const drawTick = setTick(() => {
    if (!location) {
      clearTick(drawTick);
      return;
    }

    draw(location.vehicle, 'primary');
    location.npcs.forEach(npc => draw(npc, 'secondary'));
  });

  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - NPC | ${Keys.getBindedKey('+housingMain')} - Save`);
});

// npc
Keys.onPressDown('GeneralUse', () => {
  if (location === null) return;
  location.npcs.push(getCoords());
});

// save
Keys.onPressDown('housingMain', () => {
  if (location === null) return;
  Events.emitNet('carboosting:dev:saveLocation', location);
  location = null;
  UI.hideInteraction();
});
