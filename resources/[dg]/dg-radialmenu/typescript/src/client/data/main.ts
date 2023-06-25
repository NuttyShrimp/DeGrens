import { Police, Util } from '@dgx/client';

// Start menu when opening radialmenu
export const main: RadialMenu.Entry[] = [
  {
    title: 'Burger',
    icon: 'user',
    subMenu: 'citizen',
  },
  {
    title: 'Politie',
    icon: 'user-police',
    subMenu: 'police',
    jobs: ['police'],
  },
  {
    title: 'Ambulance',
    icon: 'user-doctor',
    subMenu: 'ambulance',
    jobs: ['ambulance'],
  },
  {
    title: 'Radio',
    icon: 'walkie-talkie',
    subMenu: 'radio',
    jobs: ['police', 'ambulance'],
    items: ['pd_radio'],
  },
  {
    title: 'Voertuig',
    icon: 'car',
    subMenu: 'vehicle',
    isEnabled: ({ currentVehicle }) => !!currentVehicle,
  },
  {
    title: 'Deel Sleutels',
    icon: 'key',
    type: 'client',
    event: 'vehicles:keys:share',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      if (!currentVehicle) return false;
      return global.exports['dg-vehicles'].hasVehicleKeys(currentVehicle);
    },
  },
  {
    title: 'Parkeer Voertuig',
    icon: 'square-parking',
    type: 'client',
    event: 'dg-vehicles:garages:park',
    shouldClose: true,
    isEnabled: ({ currentVehicle, raycastEntity }) => {
      if (currentVehicle) return false;
      if (!global.exports['dg-vehicles'].hasVehicleKeys(raycastEntity)) return false;
      return global.exports['dg-vehicles'].isOnParkingSpot(raycastEntity);
    },
  },
  {
    title: 'Open Garage',
    icon: 'garage-open',
    type: 'dgxServer',
    event: 'dg-vehicles:garages:open',
    shouldClose: true,
    isEnabled: ({ currentVehicle, raycastEntity }) => {
      if (currentVehicle) return false;
      if (
        raycastEntity &&
        GetEntityType(raycastEntity) === 2 &&
        Util.getEntityCoords(raycastEntity).distance(Util.getPlyCoords()) < 2.5
      )
        return false;
      return global.exports['dg-vehicles'].isOnParkingSpot();
    },
  },
  {
    title: 'Voertuig Inbeslagnemen',
    icon: 'truck-pickup',
    type: 'dgxClient',
    event: 'vehicles:depot:client:openSelectionMenu',
    shouldClose: true,
    isEnabled: ({ currentVehicle, raycastEntity }) => {
      if (currentVehicle) return false;
      if (!raycastEntity) return false;
      return IsEntityAVehicle(raycastEntity);
    },
  },
  {
    title: 'Beroven',
    icon: 'people-robbery',
    type: 'client',
    event: 'police:robPlayer',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: async ({ currentVehicle }) => {
      if (currentVehicle) return false;
      const playerToRob = await Police.getPlayerToRob();
      return playerToRob != undefined;
    },
  },
  {
    title: 'Escorteren',
    icon: 'person',
    type: 'client',
    event: 'police:startEscorting',
    shouldClose: true,
    minimumPlayerDistance: 2,
    isEnabled: async ({ currentVehicle }) => {
      if (currentVehicle) return false;
      const playerToEscort = await Police.getPlayerToEscort();
      return playerToEscort != undefined;
    },
  },
  {
    title: 'Loslaten',
    icon: 'person',
    type: 'client',
    event: 'police:stopEscorting',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      if (currentVehicle) return false;
      return Police.isEscorting();
    },
  },
  {
    title: 'Handboeien',
    icon: 'handcuffs',
    type: 'client',
    event: 'police:tryToCuff',
    shouldClose: true,
    minimumPlayerDistance: 1,
    isEnabled: ({ job, currentVehicle, items }) => {
      if (currentVehicle) return false;
      return job.name === 'police' || items.includes('hand_cuffs');
    },
  },
  {
    title: 'Anker',
    icon: 'anchor',
    type: 'dgxServer',
    event: 'misc:server:toggleAnchor',
    shouldClose: true,
    isEnabled: ({ currentVehicle }) => {
      if (!currentVehicle || GetVehicleClass(currentVehicle) !== 14) return false;
      return GetPedInVehicleSeat(currentVehicle, -1) === PlayerPedId();
    },
  },
];
