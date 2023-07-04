import { Events, Notifications, UI } from '@dgx/client';
import { getDoorId } from 'helpers/doors';
import { getDoorState } from 'services/doors';

global.exports('toggleEntityDoorState', (entity: number) => {
  if (!entity || GetEntityType(entity) !== 3) {
    Notifications.add('Dit is geen deur', 'error');
    return;
  }
  const doorId = getDoorId(entity);
  if (!doorId) {
    Notifications.add('Dit is geen deur', 'error');
    return;
  }
  Events.emitNet('doorlock:server:changeDoorState', doorId, !getDoorState(doorId));
});

global.exports('registerDoor', async (entity: number) => {
  if (!entity || GetEntityType(entity) !== 3) {
    Notifications.add('Dit is geen deur', 'error');
    return;
  }

  const doorId = getDoorId(entity);
  if (doorId !== undefined) {
    Notifications.add('Dit is al een geregistreerde deur', 'error');
    return;
  }

  const result = await UI.openInput({
    header: 'Registreer een deur',
    inputs: [
      { type: 'text', label: 'Beschrijving', name: 'description' },
      { type: 'number', label: 'Afstand (Default: 2)', name: 'distance' },
      {
        type: 'select',
        label: 'Standaard opslot (Default: Ja)',
        name: 'locked',
        value: 'true',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      {
        type: 'select',
        label: 'Geluid bij togglen (Default: Nee)',
        name: 'playSound',
        value: 'false',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      {
        type: 'select',
        label: 'Toon UI Interaction (Default: Ja)',
        name: 'showInteraction',
        value: 'true',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      {
        type: 'select',
        label: 'Animatie bij togglen (Default: Ja)',
        name: 'doAnimation',
        value: 'true',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      {
        type: 'select',
        label: 'Lockpickbaar (Default: Nee)',
        name: 'lockpickable',
        value: 'false',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      { type: 'text', label: 'Whitelisted Job (split met ;)', name: 'job' },
      { type: 'text', label: 'Whitelisted Business (split met ;)', name: 'business' },
      { type: 'text', label: 'Whitelisted Gang (split met ;)', name: 'gang' },
      {
        type: 'select',
        label: 'Force Open/Dicht ipv lock (Default: Nee)',
        name: 'forceOpen',
        value: 'false',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
      {
        type: 'select',
        label: 'Raycast door muren (Default: Nee)',
        name: 'allowThroughWalls',
        value: 'false',
        options: [
          { label: 'Ja', value: 'true' },
          { label: 'Nee', value: 'false' },
        ],
      },
    ],
  });
  if (!result.accepted) return;

  const [x, y, z] = GetEntityCoords(entity, false);

  const doorConfig: Doorlock.DoorConfig = {
    description: result.values.description ?? '',
    locked: result.values.locked === 'true',
    distance: Number(result.values.distance ?? 2),
    doors: [
      {
        model: GetEntityArchetypeName(entity),
        coords: { x, y, z },
      },
    ],
    authorized: {},
  };

  if (result.values.showInteraction === 'false') {
    doorConfig.hideInteraction = true;
  }
  if (result.values.playSound === 'true') {
    doorConfig.playSound = true;
  }
  if (result.values.doAnimation === 'false') {
    doorConfig.noAnimation = true;
  }
  if (result.values.lockpickable === 'true') {
    doorConfig.lockpickable = true;
  }
  if (result.values.job) {
    const names = result.values.job.split(';');
    doorConfig.authorized.job = names.map(name => ({ name, rank: 0 }));
  }
  if (result.values.business) {
    doorConfig.authorized.business = result.values.business.split(';');
  }
  if (result.values.gang) {
    doorConfig.authorized.gang = result.values.gang.split(';');
  }
  if (result.values.forceOpen === 'true') {
    doorConfig.forceOpen = true;
  }
  if (result.values.allowThroughWalls === 'true') {
    doorConfig.allowThroughWalls = true;
  }

  Notifications.add(
    'Specifieke dingen zoals thermietoptie, scripted name of gelinkte models moet je manueel toevoegen aan de json file'
  );
  Events.emitNet('doorlock:server:registerNew', doorConfig);
});
