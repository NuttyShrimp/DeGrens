import { BlipManager, PolyZone, Util, Phone, Vehicles, Taskbar, Notifications, Events } from '@dgx/client';
import { DROPOFF_TYPE_DATA } from '../constants';
import { DEFAULT_CARBOOST_MAIL_DATA } from '../../shared/constants';

const activeDropoffZones = new Map<
  string,
  {
    type: Carboosting.DropoffType;
    inZone: boolean;
  }
>();

export const doClientAction = (boostId: string, data: Carboosting.ClientActionData) => {
  if (data.vehicleLocation) {
    PolyZone.addCircleZone(`carboosting_vehicle`, data.vehicleLocation, 150, {
      routingBucket: 0,
      data: {
        id: boostId,
      },
    });
    Util.debug(`Building vehicle zone for ${boostId}`);
  }

  if (data.radiusBlip) {
    BlipManager.addBlip({
      category: 'carboosting',
      id: `carboost_vehicle_${boostId}`,
      radius: data.radiusBlip.size,
      coords: data.radiusBlip.coords,
      color: 38,
      alpha: 150,
    });
    Util.debug(`Adding radius blip for ${boostId}`);
  }

  if (data.dropoff && !activeDropoffZones.has(boostId)) {
    BlipManager.addBlip({
      category: 'carboosting',
      id: `carboost_dropoff_${boostId}`,
      coords: data.dropoff.coords,
      color: 38,
      sprite: 225,
      scale: 1.3,
      text: 'Aflever Locatie',
    });
    PolyZone.addBoxZone(`carboosting_dropoff`, data.dropoff.coords, 10, 10, {
      heading: data.dropoff.coords.w,
      minZ: data.dropoff.coords.z - 1,
      maxZ: data.dropoff.coords.z + 4,
      data: {
        id: boostId,
      },
    });
    activeDropoffZones.set(boostId, {
      type: data.dropoff.type,
      inZone: false,
    });
    Util.debug(`Building dropoff zone for ${boostId}`);
  }

  if (data.addNotification) {
    Phone.showNotification(data.addNotification);
    Util.debug(`Adding notification ${data.addNotification.id} for ${boostId}`);
  }

  if (data.removeNotification) {
    Phone.removeNotification(data.removeNotification);
    Util.debug(`Removing notification ${data.removeNotification} for ${boostId}`);
  }

  if (data.mail) {
    // timeout else phone notifs will be fucked
    setTimeout(() => {
      Phone.addMail({ ...DEFAULT_CARBOOST_MAIL_DATA, ...data.mail! });
      Util.debug(`Adding mail for ${boostId}`);
    }, 2000);
  }
};

export const destroyVehicleZone = (boostId: string) => {
  PolyZone.removeZone(`carboosting_vehicle`, boostId);
  Util.debug(`Destroyed vehicle zone for ${boostId}`);
};

export const removeRadiusBlip = (boostId: string) => {
  BlipManager.removeBlip(`carboost_vehicle_${boostId}`);
  Util.debug(`Removed radius blip for ${boostId}`);
};

export const destroyDropoffZone = (boostId: string) => {
  if (!activeDropoffZones.has(boostId)) return;

  BlipManager.removeBlip(`carboost_dropoff_${boostId}`);
  PolyZone.removeZone(`carboosting_dropoff`, boostId);
  activeDropoffZones.delete(boostId);

  Util.debug(`Destroyed dropoff zone for ${boostId}`);
};

export const cleanupBoost = (boostId: string) => {
  destroyVehicleZone(boostId);
  removeRadiusBlip(boostId);
  destroyDropoffZone(boostId);
  Phone.removeNotification('carboosting-tracker-amount');
  Util.debug(`Cleaning up ${boostId}`);
};

export const cleanupAllBoosts = () => {
  BlipManager.removeCategory('carboosting');
  PolyZone.removeZone('carboosting_vehicle');
  PolyZone.removeZone('carboosting_dropoff');
  Phone.removeNotification('carboosting-tracker-amount');
  Util.debug('Cleaning up all boosts');
};

export const handleEnterDropoffZone = (boostId: string) => {
  const dropoffData = activeDropoffZones.get(boostId);
  if (!dropoffData) return;

  dropoffData.inZone = true;

  Phone.showNotification({
    id: `carboosting-entered-dropoff-${Date.now()}`,
    title: 'Carboosting',
    description: `Je bent gearriveerd op de locatie`,
    icon: 'car',
  });
};

export const handleLeaveDropoffZone = (boostId: string) => {
  const dropoffData = activeDropoffZones.get(boostId);
  if (!dropoffData) return;

  dropoffData.inZone = false;
};

export const canDoDropoffAction = (type: Carboosting.DropoffType, vehicle: number | undefined): boolean => {
  if (!vehicle || !DoesEntityExist(vehicle)) return false;
  const boostId: string | undefined = Entity(vehicle).state.boostId;
  if (!boostId) return false;
  const dropoffData = activeDropoffZones.get(boostId);
  if (!dropoffData) return false;
  return dropoffData.inZone && dropoffData.type === type;
};

export const doDropoffAction = async (type: Carboosting.DropoffType, vehicle: number | undefined) => {
  if (!vehicle || !canDoDropoffAction(type, vehicle)) return;

  if (type === 'scratch' && !Vehicles.isNearVehiclePlace(vehicle, 'bonnet', 2, true)) {
    Notifications.add('Je staat niet bij de motorkap', 'error');
    return;
  }

  if (isAnyoneInVehicle(vehicle)) {
    Notifications.add('Er zit nog iemand in het voertuig', 'error');
    return;
  }

  const typeData = DROPOFF_TYPE_DATA[type];
  const [canceled] = await Taskbar.create(typeData.icon, typeData.label, typeData.taskbar.duration, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: typeData.taskbar.animation,
  });
  if (canceled) return;

  if (!canDoDropoffAction(type, vehicle)) {
    Notifications.add('Je bent niet bij het voertuig', 'error');
    return;
  }

  if (type === 'scratch' && !Vehicles.isNearVehiclePlace(vehicle, 'bonnet', 2, true)) {
    Notifications.add('Je staat niet bij de open motorkap', 'error');
    return;
  }

  if (isAnyoneInVehicle(vehicle)) {
    Notifications.add('Er zit nog iemand in het voertuig', 'error');
    return;
  }

  const healthPercentage = Math.round((GetVehicleEngineHealth(vehicle) + GetVehicleBodyHealth(vehicle)) / 2000);
  Events.emitNet('carboosting:boost:dropoff', NetworkGetNetworkIdFromEntity(vehicle), healthPercentage);
};

const isAnyoneInVehicle = (vehicle: number) => {
  const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(vehicle));
  for (let i = -1; i < numSeats - 1; i++) {
    if (IsVehicleSeatFree(vehicle, i)) continue;
    return true;
  }
  return false;
};
