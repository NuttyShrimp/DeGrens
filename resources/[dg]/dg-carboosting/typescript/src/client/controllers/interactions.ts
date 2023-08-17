import { Events, Peek, PolyZone } from '@dgx/client';
import { DROPOFF_TYPE_DATA } from '../constants';
import { canDoDropoffAction, doDropoffAction, handleEnterDropoffZone, handleLeaveDropoffZone } from 'services/boost';

PolyZone.onEnter<{ id: string }>('carboosting_vehicle', (_, { id }) => {
  Events.emitNet('carboosting:boost:enteredVehicleZone', id);
});

PolyZone.onEnter<{ id: string }>('carboosting_dropoff', (_, { id }) => {
  handleEnterDropoffZone(id);
});

PolyZone.onLeave<{ id: string }>('carboosting_dropoff', (_, { id }) => {
  handleLeaveDropoffZone(id);
});

Peek.addFlagEntry('boostId', {
  options: (Object.entries(DROPOFF_TYPE_DATA) as ObjEntries<typeof DROPOFF_TYPE_DATA>).map<
    PeekParams['options'][number]
  >(([type, data]) => ({
    label: data.label,
    icon: `fas fa-${data.icon}`,
    distance: data.peekDistance ?? 2,
    action: (_, vehicle) => doDropoffAction(type, vehicle),
    canInteract: vehicle => canDoDropoffAction(type, vehicle),
  })),
});
