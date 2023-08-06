import { Events, Notifications, Sync, Util } from '@dgx/server';

class InstanceManager {
  private propertyIdToInstanceId: Map<string, number> = new Map();
  private instanceIdToPropertyId: Map<number, string> = new Map();
  private propertyInstanceId: number = 2000;

  private freeInstanceId = () => {
    const instanceId = Sync.getFreeInstanceId(this.propertyInstanceId);
    if (instanceId) {
      return instanceId;
    }
  };

  enter = (propertyName: string, plyId: number) => {
    let instanceId = this.propertyIdToInstanceId.get(propertyName);
    if (!instanceId) {
      instanceId = this.freeInstanceId();
      if (!instanceId) {
        Notifications.add(plyId, 'Kon geen vrije instantie voorzien voor deze ruimte', 'error');
        return;
      }
      this.propertyIdToInstanceId.set(propertyName, instanceId);
      this.instanceIdToPropertyId.set(instanceId, propertyName);
    }
    instanceId = this.propertyIdToInstanceId.get(propertyName);
    if (!instanceId) return;
    global.exports['dg-lib'].setInstance(plyId, instanceId);
    Util.Log(
      `realestate:enterProperty`,
      { property: propertyName },
      `${Util.getName(plyId)} entered ${propertyName}`,
      plyId
    );
  };

  inBuilding = (plyId: number) => {
    const plyBucket = GetPlayerRoutingBucket(String(plyId));
    return this.instanceIdToPropertyId.has(plyBucket);
  };

  leave = (plyId: number) => {
    const plyBucket = GetPlayerRoutingBucket(String(plyId));
    const propertyName = this.instanceIdToPropertyId.get(plyBucket);
    if (!propertyName) return;
    global.exports['dg-lib'].setInstance(plyId, 0);
    Events.emitNet('realestate:leaveProperty', plyId);
    Util.Log(
      `realestate:leaveProperty`,
      { property: propertyName },
      `${Util.getName(plyId)} left ${propertyName}`,
      plyId
    )
  };
}

export const instanceManager = new InstanceManager();
