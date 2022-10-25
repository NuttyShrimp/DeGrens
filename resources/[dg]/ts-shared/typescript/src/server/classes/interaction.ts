import { RPC, Util } from './index';

class Chat {
  registerCommand(
    name: string,
    description: string,
    parameters: Chat.Parameter[] = [],
    permissionLevel = 'user',
    handler: Chat.CommandHandler
  ) {
    setImmediate(async () => {
      await Util.awaitCondition(() => GetResourceState('dg-chat') === 'started');
      global.exports['dg-chat'].registerCommand(name, description, parameters, permissionLevel, handler);
    });
  }
  sendMessage(target: string | number, data: Chat.Message) {
    global.exports['dg-chat'].sendMessage(target, data);
  }
}

class RayCast {
  getEntityPlayerLookingAt = async (
    plyId: number,
    distance?: number,
    flag?: number,
    ignore?: number
  ): Promise<[number, 0 | 1 | 2 | 3, Vec3]> => {
    const res = await RPC.execute<[number, 0 | 1 | 2 | 3, Vec3]>(
      'lib:raycast:getEntityPlayerLookingAt',
      plyId,
      distance,
      flag,
      ignore
    );
    if (!res) return [0, 0, { x: 0, y: 0, z: 0 }];
    const [netId, type, pos] = res;
    const entity = NetworkGetEntityFromNetworkId(netId);
    return [entity, type, pos];
  };
}

export default {
  Chat: new Chat(),
  RayCast: new RayCast(),
};
