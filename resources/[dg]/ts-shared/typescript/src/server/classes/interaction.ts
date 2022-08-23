import { Util } from './index';

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

export default {
  Chat: new Chat(),
};
