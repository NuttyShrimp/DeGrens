import { Events } from '@dgx/client';

//@ts-ignore Types wrong, they should allow null
AddStateBagChangeHandler(null, null, (bagName: string, stateKey: string, stateValue: any) => {
  if (!bagName.startsWith('entity:')) return;
  const netId = Number(bagName.replace('entity:', ''));
  if (Number.isNaN(netId)) return;
  const veh = NetworkGetEntityFromNetworkId(netId);
  if (GetEntityType(veh) !== 2) return;
  Events.emitNet('vehicles:state:change', veh, stateKey, stateValue);
});
