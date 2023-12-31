import { Keys, Notifications, PolyZone, RPC, UI, BlipManager } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';
import { isVehicleVinScratched } from 'services/vinscratch';

// This shit does not matter so no fucking config on server for this stupid ass bitch positiuon
const quicksellPosition: { position: Vec3; heading: number } = {
  position: { x: 479.74, y: -1889.81, z: 26.09 },
  heading: 302.32,
};

let inQuicksellZone = false;

// Init quicksell
export const buildQuicksellZone = () => {
  PolyZone.addBoxZone('quicksell', quicksellPosition.position, 10, 10, {
    minZ: quicksellPosition.position.z - 2,
    maxZ: quicksellPosition.position.z + 5,
    heading: quicksellPosition.heading,
    data: {},
  });
  BlipManager.addBlip({
    category: 'dg-vehicles',
    id: `vehicleshop-quicksell`,
    text: 'Quicksell',
    coords: quicksellPosition.position,
    sprite: 227,
    color: 12,
    scale: 0.9,
  });
};

// Handle polyzone entering
PolyZone.onEnter('quicksell', () => {
  inQuicksellZone = true;
  if (getCurrentVehicle() && isDriver()) {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Verkoop`);
  }
});
PolyZone.onLeave('quicksell', () => {
  inQuicksellZone = false;
  UI.hideInteraction();
});

// Handle selling
Keys.onPressDown('GeneralUse', async () => {
  if (!inQuicksellZone) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) return;
  const netId = NetworkGetNetworkIdFromEntity(veh);

  const isOwner = await RPC.execute<boolean>('vehicles:isOwnerOfVehicle', netId);
  if (!isOwner) {
    Notifications.add('Je bent niet de eigenaar van dit voertuig', 'error');
    return;
  }

  if (isVehicleVinScratched(veh)) {
    Notifications.add('Je kan dit voertuig niet verkopen', 'error');
    return;
  }

  const sellPrice = await RPC.execute<number>('vehicles:quicksell:getPrice', netId);
  const result = await UI.openInput({
    header: `Ben je zeker dat je dit voertuig wil verkopen voor €${sellPrice}\n\nDeze prijs is gebaseerd op de aankoopprijs en aangekochte onderdelen.\nMogelijkse belastingen zijn reeds van de prijs afgetrokken.`,
  });
  if (!result.accepted) return;

  const success = await RPC.execute<boolean>('vehicles:quicksell:sellVehicle', netId);
  Notifications.add(
    success ? 'Je hebt je voertuig succesvol verkocht!' : 'Er is iets misgelopen',
    success ? 'success' : 'error'
  );
});
