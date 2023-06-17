import { Events, UI, RayCast, Util, Notifications } from '@dgx/client';
import { buildLockers } from 'services/lockers';

Events.onNet('lockers:client:place', async () => {
  const result = await UI.openInput<{ id: string; price: string; doAnimation: string }>({
    header: 'Locker plaatsen',
    inputs: [
      {
        type: 'text',
        name: 'id',
        label: 'ID',
      },
      {
        type: 'number',
        name: 'price',
        label: 'Prijs',
      },
      {
        type: 'select',
        name: 'doAnimation',
        label: 'Animatie Bij Openen',
        value: 'yes',
        options: [
          {
            label: 'Ja',
            value: 'yes',
          },
          {
            label: 'Nee',
            value: 'no',
          },
        ],
      },
    ],
  });
  if (!result.accepted) return;

  const price = +result.values.price;
  if (isNaN(price)) {
    Notifications.add('Geen geldige prijs', 'error');
    return;
  }

  UI.showInteraction('Enter to place - Scroll for size');

  const selection = await new Promise<{ coords: Vec3; size: number }>(res => {
    let size = 1;
    const interval = setInterval(() => {
      const coords = RayCast.doRaycast().coords;
      if (coords) {
        const plyCoords = Util.getPlyCoords();
        DrawLine(plyCoords.x, plyCoords.y, plyCoords.z, coords.x, coords.y, coords.z, 100, 150, 255, 150);
        DrawMarker(
          28,
          coords.x,
          coords.y,
          coords.z,
          0,
          0,
          0,
          0,
          0,
          0,
          size,
          size,
          size,
          100,
          150,
          255,
          150,
          false,
          true,
          2,
          false,
          //@ts-ignore
          null,
          //@ts-ignore
          null,
          false
        );
        if (IsControlJustPressed(0, 14)) {
          size -= 0.1;
        }
        if (IsControlJustPressed(0, 15)) {
          size += 0.1;
        }
        if (IsControlJustPressed(0, 18)) {
          clearInterval(interval);
          res({ coords, size });
        }
      }
    }, 2);
  });

  UI.hideInteraction();
  const coords = {
    x: Util.round(selection.coords.x, 4),
    y: Util.round(selection.coords.y, 4),
    z: Util.round(selection.coords.z, 4),
  };
  const size = Util.round(selection.size, 2);

  const locker: Lockers.BuildData = {
    id: result.values.id,
    coords,
    radius: size,
    doAnimation: result.values.doAnimation === 'yes',
  };

  Events.emitNet('lockers:server:place', locker, Math.round(price));
});

Events.onNet('lockers:client:add', (lockers: Lockers.BuildData[]) => {
  buildLockers(lockers);
});

Events.onNet('lockers:client:doAnimation', async () => {
  const ped = PlayerPedId();
  await Util.loadAnimDict('missarmenian2');
  TaskPlayAnim(ped, 'missarmenian2', 'open_garage_franklin', 8.0, 8.0, -1, 0, 0, false, false, false);
  await Util.Delay(3500);
  ClearPedTasks(ped);
});
