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
  doRaycast = async (plyId: number, distance?: number, flag?: number, ignore?: number): Promise<RayCastHit> => {
    const result = await RPC.execute<Omit<RayCastHit, 'entity'> & { netId: number }>(
      'lib:doRaycast',
      plyId,
      distance,
      flag,
      ignore
    );
    if (!result) return {};
    return {
      entity: result.netId != undefined ? NetworkGetEntityFromNetworkId(result.netId) : undefined,
      coords: result.coords,
    };
  };
}

export default {
  Chat: new Chat(),
  RayCast: new RayCast(),
};
