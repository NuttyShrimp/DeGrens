class Chat {
  registerCommand(
    name: string,
    description: string,
    parameters: Chat.Parameter[] = [],
    permissionLevel: string = 'user',
    handler: Chat.CommandHandler
  ) {
    global.exports['dg-chat'].registerCommand(name, description, parameters, permissionLevel, handler);
  }
  sendMessage(target: string | number, data: Chat.Message) {
    global.exports['dg-chat'].sendMessage(target, data);
  }
}

export default {
  Chat: new Chat(),
};
