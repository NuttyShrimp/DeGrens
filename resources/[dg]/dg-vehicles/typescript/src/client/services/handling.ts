import { BaseEvents, Util } from '@dgx/client';
import { driverThread } from 'threads/driver';

const cleanHandlings = new Map<number, Vehicles.Handlings.Handling>();

const handlingFields: Vehicles.Handlings.HandlingEntry[] = [
  'fBrakeForce',
  'fBrakeBiasFront',
  'fClutchChangeRateScaleDownShift',
  'fClutchChangeRateScaleUpShift',
  'fCollisionDamageMult',
  'fDeformationDamageMult',
  'fDriveBiasFront',
  'fDriveInertia',
  'fEngineDamageMult',
  'fHandBrakeForce',
  'fInitialDragCoeff',
  'fInitialDriveForce',
  'fInitialDriveMaxFlatVel',
  'fLowSpeedTractionLossMult',
  'fSteeringLock',
  'fSuspensionCompDamp',
  'fSuspensionForce',
  'fSuspensionReboundDamp',
  'fTractionBiasFront',
  'fTractionCurveMax',
  'fTractionCurveMin',
  'fTractionLossMult',
];

export const getCleanHandling = (vehicle: number) => {
  if (!DoesEntityExist(vehicle) || !IsEntityAVehicle(vehicle)) return null;

  if (!cleanHandlings.has(vehicle)) {
    // @ts-expect-error
    const handling: Vehicles.Handlings.Handling = {};
    for (const field of handlingFields) {
      handling[field] = GetVehicleHandlingFloat(vehicle, 'CHandlingData', field);
    }

    // Make immutable
    Object.freeze(handling);

    cleanHandlings.set(vehicle, handling);
  }

  return cleanHandlings.get(vehicle);
};

export const getHandlingContext = (vehicle: number): Vehicles.Handlings.Multipliers | null => {
  const multipliers: Vehicles.Handlings.Multipliers = Entity(vehicle).state.handling;
  if (!multipliers) return null;
  return multipliers;
};

export const setHandlingContextMultiplier = (
  vehicle: number,
  handling: Vehicles.Handlings.HandlingEntry,
  context: string,
  valueType: Vehicles.Handlings.ModifierType,
  value: number,
  priority = 1
) => {
  const forCurrentVehicle = driverThread.isActive && driverThread.data.vehicle === vehicle;
  const handlingMultiplier: Vehicles.Handlings.Multipliers = forCurrentVehicle
    ? driverThread.data.handling
    : getHandlingContext(vehicle);

  if (!handlingMultiplier) return;

  if (!handlingMultiplier[handling]) {
    handlingMultiplier[handling] = {};
  }

  handlingMultiplier[handling][context] = {
    value,
    type: valueType,
    priority,
  };
};

export const resetHandlingContextMultiplier = (
  vehicle: number,
  context: string,
  handling?: Vehicles.Handlings.HandlingEntry
) => {
  const forCurrentVehicle = driverThread.isActive && driverThread.data.vehicle === vehicle;
  const handlingMultiplier: Vehicles.Handlings.Multipliers = forCurrentVehicle
    ? driverThread.data.handling
    : getHandlingContext(vehicle);

  if (!handlingMultiplier) return;

  if (handling) {
    if (!handlingMultiplier[handling]) {
      handlingMultiplier[handling] = {};
    }
    delete handlingMultiplier[handling][context];
    return;
  }

  for (const handling of handlingFields) {
    if (!handlingMultiplier[handling]) {
      handlingMultiplier[handling] = {};
    }

    delete handlingMultiplier[handling][context];
  }
};

export const applyHandlingMultipliers = (vehicle: number, handling?: Vehicles.Handlings.HandlingEntry) => {
  const cleanHandling = getCleanHandling(vehicle);
  const multipliers = GetHandlingMultiplier(vehicle, handling);

  if (!cleanHandling || !multipliers) return;

  const applyHandling = (handling: Vehicles.Handlings.HandlingEntry, value: number) => {
    const cleanValue = cleanHandling[handling];

    if (cleanValue !== value) {
      Util.debug(`Clean: ${cleanValue} | Modified: ${value} | name: ${handling}`);
    }

    SetVehicleHandlingFloat(vehicle, 'CHandlingData', handling, value + 0.000001);
  };

  if (typeof multipliers === 'number') {
    applyHandling(handling!, multipliers);
  } else {
    for (const [handling, multiplier] of Object.entries(multipliers)) {
      applyHandling(handling as Vehicles.Handlings.HandlingEntry, multiplier);
    }
  }

  SetVehicleHasBeenOwnedByPlayer(vehicle, true);
  ModifyVehicleTopSpeed(vehicle, 0.0);
};

const getModifiedHandlingValue = (value: number, multiplier: Vehicles.Handlings.Multiplier) => {
  switch (multiplier.type) {
    case 'fixed': {
      return multiplier.value;
    }
    case 'multiplier': {
      return value * multiplier.value;
    }
    case 'add': {
      return value + multiplier.value;
    }
  }
};

const GetHandlingMultiplier = (
  vehicle: number,
  handling?: Vehicles.Handlings.HandlingEntry
): number | Partial<Record<Vehicles.Handlings.HandlingEntry, number>> | undefined => {
  const forCurrentVehicle = driverThread.isActive && driverThread.data.vehicle === vehicle;
  const handlingMultiplier: Vehicles.Handlings.Multipliers = forCurrentVehicle
    ? driverThread.data.handling
    : getHandlingContext(vehicle);

  if (!handlingMultiplier) return;

  const getValue = (vehicle: number, handling: Vehicles.Handlings.HandlingEntry) => {
    const context = handlingMultiplier[handling];

    const defaultValue = getCleanHandling(vehicle)?.[handling];

    if (!context || !defaultValue) return;

    // Some examples:
    // 0 - Degradation
    // 1 - Something else
    // 2 - Nitro, vehiclemodes
    const highestPrioModifier = Object.values(context).sort((a, b) => b.priority - a.priority)[0];

    if (!highestPrioModifier) return defaultValue;

    let multipliedValue = getModifiedHandlingValue(defaultValue, highestPrioModifier);

    for (const multiplier of Object.values(context).filter(({ priority }) => priority === 0)) {
      multipliedValue = getModifiedHandlingValue(multipliedValue, multiplier);
    }

    return multipliedValue;
  };

  if (handling) {
    return getValue(vehicle, handling);
  }

  const multipliedValues: Partial<Record<Vehicles.Handlings.HandlingEntry, number>> = {};

  for (const handlingName of handlingFields) {
    const val = getValue(vehicle, handlingName);
    if (val) {
      multipliedValues[handlingName] = val;
    }
  }

  return multipliedValues;
};

driverThread.addHook('preStart', ref => {
  const handling = getHandlingContext(ref.data.vehicle);
  ref.data.handling = handling ?? {};
});

driverThread.addHook('afterStart', ref => {
  applyHandlingMultipliers(ref.data.vehicle);
});

BaseEvents.onResourceStop(() => {
  cleanHandlings.forEach((handling, ent) => {
    if (!DoesEntityExist(ent)) return;
    for (const [handlingName, value] of Object.entries(handling)) {
      SetVehicleHandlingFloat(ent, 'CHandlingData', handlingName, value);
    }
  });
});
